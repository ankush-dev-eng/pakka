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
    
    if text:
        extracted_text = text
    elif url:
        try:
            # SSRF protection
            parsed = urllib.parse.urlparse(url)
            if parsed.scheme not in ("http", "https"):
                raise HTTPException(status_code=400, detail="Invalid URL scheme")
            
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "html.parser")
                extracted_text = soup.get_text(separator=" ", strip=True)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")
    elif file:
        try:
            content_bytes = await file.read()
            if file.filename.lower().endswith(".pdf"):
                with pdfplumber.open(io.BytesIO(content_bytes)) as pdf:
                    extracted_text = " ".join([page.extract_text() or "" for page in pdf.pages])
            elif file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
                img = Image.open(io.BytesIO(content_bytes))
                extracted_text = pytesseract.image_to_string(img)
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
        
    # 1. Rule-based detection
    from app.intel.detectors import run_all_detectors, load_red_flags, RED_FLAGS
    load_red_flags()
    raw_flags = await run_all_detectors(req_text, domains, amounts, senders)
    
    rule_flags = []
    for flag_id, triggered in raw_flags.items():
        if triggered:
            weight = RED_FLAGS.get(flag_id, {}).get("weight", 10)
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
    # Simple stats for demo
    total_analyzed = session.exec(select(AnalysisRecord)).all()
    scams = [r for r in total_analyzed if r.verdict == "likely_scam"]
    return {
        "total_analyzed": len(total_analyzed),
        "likely_scams": len(scams)
    }
