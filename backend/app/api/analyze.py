from fastapi import APIRouter, Depends, Request, HTTPException
from sqlmodel import Session, select
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.db.database import get_session
from app.models import AnalysisRecord

from app.llm.mock import MockLLMProvider
from app.llm.grounding import validate_grounding
from app.core.scoring import calculate_score

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

from fastapi import File, Form, UploadFile
import pdfplumber
import pytesseract
from PIL import Image
import io
import httpx
from bs4 import BeautifulSoup
import ipaddress
import urllib.parse


class FeedbackRequest(BaseModel):
    type: str  # "scam" or "genuine"

llm_provider = MockLLMProvider()

@router.post("/analyze")
@limiter.limit("10/minute")
async def analyze_text(
    request: Request, 
    text: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    lang: str = Form("en"),
    session: Session = Depends(get_session)
):
    extracted_text = ""
    
    # Removed debug print to avoid UnicodeEncodeError
    inputs_provided = sum([text is not None, url is not None, file is not None])
    if inputs_provided != 1:
        raise HTTPException(status_code=400, detail="Exactly one of text, url, or file must be provided")

    if text is not None:
        extracted_text = text
    elif url is not None:
        try:
            from app.ingest.url_fetch import (
                fetch_url_text,
                TargetAccessDeniedError,
                TargetNotFoundError,
                RequestTimeoutError,
                SSRFError,
                FetchError
            )
            content = await fetch_url_text(url)
            soup = BeautifulSoup(content, "html.parser")
            extracted_text = soup.get_text(separator=" ", strip=True)
        except TargetAccessDeniedError as e:
            raise HTTPException(
                status_code=403,
                detail=f"Target website blocked access: {str(e)} Please paste the offer text directly or upload a screenshot/PDF."
            )
        except TargetNotFoundError as e:
            raise HTTPException(status_code=404, detail=f"Target URL not found: {str(e)}")
        except RequestTimeoutError as e:
            raise HTTPException(status_code=504, detail=f"Target URL timed out: {str(e)}")
        except SSRFError as e:
            raise HTTPException(status_code=400, detail=f"Invalid URL: {str(e)}")
        except FetchError as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")
    elif file:
        try:
            content_bytes = await file.read()
            if file.filename.lower().endswith(".pdf"):
                with pdfplumber.open(io.BytesIO(content_bytes)) as pdf:
                    extracted_text = " ".join([page.extract_text() or "" for page in pdf.pages])
            elif file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
                from app.ingest.image_ocr import extract_image_text
                extracted_text = extract_image_text(content_bytes)
            else:
                raise HTTPException(status_code=400, detail="Unsupported file format")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}")
    
    if not extracted_text or not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    req_text = extracted_text
    req_lang = lang

    if not req_text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    if len(req_text) > 10000:
        raise HTTPException(status_code=400, detail="Text too long")
        
    # Basic extraction
    import re
    # Extract emails
    emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', req_text)
    senders = emails
    
    # Extract domains from emails and URLs
    domains = []
    for email in emails:
        domains.append(email.split('@')[1])
        
    urls = re.findall(r'https?://(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)', req_text)
    urls += re.findall(r'(?<![@\w])([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)(?:/|\b)', req_text)
    # Simple heuristic to exclude common non-domains that match regex
    for d in urls:
        if '.' in d and not d.endswith('.'):
            domains.append(d)
            
    # Extract amounts (numbers)
    amounts = []
    # simple match for numbers that might be salary/pay, e.g., 45, 15000, 45,000, 4500000, 45 LPA
    amount_matches = re.findall(r'\b\d+(?:,\d+)*(?:\.\d+)?\b', req_text)
    for m in amount_matches:
        try:
            val = float(m.replace(',', ''))
            amounts.append(int(val))
        except ValueError:
            pass
            
    # Check for 'LPA' and convert to actual value
    lpa_matches = re.findall(r'\b(\d+(?:\.\d+)?)\s*LPA\b', req_text, flags=re.IGNORECASE)
    for m in lpa_matches:
        try:
            val = float(m) * 100000
            amounts.append(int(val))
        except ValueError:
            pass
            
    # Check for daily/weekly/monthly rates and annualize them for unrealistic_pay detection
    rate_matches = re.findall(r'\b(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:/|per|a)\s*(day|week|month)\b', req_text, flags=re.IGNORECASE)
    for m in rate_matches:
        try:
            val = float(m[0].replace(',', ''))
            period = m[1].lower()
            if period == 'day':
                val = val * 260 # Assuming 260 working days
            elif period == 'week':
                val = val * 52
            elif period == 'month':
                val = val * 12
            amounts.append(int(val))
        except ValueError:
            pass
            
    # 1. Rule-based detection
    import app.intel.detectors as detectors
    detectors.load_red_flags()
    raw_flags = await detectors.run_all_detectors(req_text, domains, amounts, senders)
    
    rule_flags = []
    for flag_id, triggered in raw_flags.items():
        if triggered:
            weight = detectors.RED_FLAGS.get(flag_id, {}).get("weight", 10)
            rule_flags.append({
                "id": flag_id,
                "title": flag_id.replace("_", " ").title(),
                "reason": "Rule matched.",
                "weight": weight,
                "source": "rule"
            })
    
    # 2. LLM explanation & new flags
    llm_resp = await llm_provider.explain(req_text, rule_flags, req_lang)
    valid_llm_flags = validate_grounding(req_text, llm_resp.get("new_flags", []))
    
    # 3. Combine flags & calculate score
    job_keywords = {"job", "offer", "interview", "salary", "pay", "work", "hire", "hired", "hiring", "apply", "selected", "resume", "cv", "lpa", "rupees", "position", "company", "fee", "stipend", "payment", "₹", "rs"}
    
    word_count = len(req_text.split())
    import re
    has_keywords = any(re.search(rf'\b{re.escape(kw)}\b', req_text.lower()) if kw.isalpha() else (kw in req_text.lower()) for kw in job_keywords)
    
    has_signals = any(raw_flags.values()) or bool(domains) or bool(amounts) or bool(senders) or has_keywords
    
    is_meaningful = False
    if word_count >= 10:
        is_meaningful = True
    elif word_count >= 3 and has_signals:
        is_meaningful = True
    if any(raw_flags.values()):
        is_meaningful = True
    
    if not is_meaningful:
        score, verdict = 0, "insufficient_information"
    else:
        score, verdict = calculate_score(raw_flags, valid_llm_flags)
    
    # 4. Save to DB
    record = AnalysisRecord(
        text=req_text,
        lang=req_lang,
        flags=rule_flags,
        llm_flags=valid_llm_flags,
        next_steps=llm_resp.get("next_steps", []),
        score=score,
        verdict=verdict
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    
    return record

@router.get("/analyze/{id}")
def get_analysis(id: str, session: Session = Depends(get_session)):
    record = session.get(AnalysisRecord, id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return record

@router.post("/report/{id}")
@limiter.limit("5/minute")
def submit_feedback(request: Request, id: str, req: FeedbackRequest, session: Session = Depends(get_session)):
    record = session.get(AnalysisRecord, id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    if req.type == "scam":
        record.reported_scam = True
    elif req.type == "genuine":
        record.reported_genuine = True
    else:
        raise HTTPException(status_code=400, detail="Invalid feedback type")
        
    session.add(record)
    session.commit()
    return {"status": "ok"}

@router.get("/report-pack/{id}")
def generate_report_pack(id: str, session: Session = Depends(get_session)):
    # Mock generation of report pack
    record = session.get(AnalysisRecord, id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Normally we'd generate a PDF/HTML string here
    html_content = f"<h1>Pakka Report</h1><p>Verdict: {record.verdict}</p><p>Score: {record.score}</p>"
    return {"html": html_content}

@router.get("/stats")
def get_stats(session: Session = Depends(get_session)):
    total_analyzed = session.exec(select(AnalysisRecord)).all()
    scams = [r for r in total_analyzed if r.verdict == "likely_scam" or r.reported_scam]
    
    from collections import Counter
    pattern_counts = Counter()
    for r in total_analyzed:
        if r.verdict == "likely_scam" or r.reported_scam:
            for flag in r.flags:
                if flag.get("title"):
                    pattern_counts[flag["title"]] += 1
            for flag in r.llm_flags:
                if flag.get("title"):
                    pattern_counts[flag["title"]] += 1
                
    top_patterns = [{"name": title, "count": count} for title, count in pattern_counts.most_common(3)]
    
    return {
        "total_analyzed": len(total_analyzed),
        "likely_scams": len(scams),
        "top_patterns": top_patterns
    }
