import pytest
from app.ingest.url_fetch import fetch_url_text, SSRFError, FetchError
from app.ingest.pdf import extract_pdf_text
from app.ingest.image_ocr import extract_image_text
from app.parse.entities import extract_entities
from PIL import Image
import io
from reportlab.pdfgen import canvas

@pytest.mark.asyncio
async def test_url_fetch_blocked_ip():
    with pytest.raises(SSRFError):
        await fetch_url_text("http://127.0.0.1/admin")
        
    with pytest.raises(SSRFError):
        await fetch_url_text("http://192.168.1.5/")

def test_extract_pdf():
    pdf_bytes = io.BytesIO()
    c = canvas.Canvas(pdf_bytes)
    c.drawString(100, 100, "Hello PDF")
    c.save()
    text = extract_pdf_text(pdf_bytes.getvalue())
    assert "Hello PDF" in text

def test_extract_image():
    # Only run if tesseract is installed, otherwise skip
    import pytesseract
    try:
        pytesseract.get_tesseract_version()
    except pytesseract.TesseractNotFoundError:
        pytest.skip("Tesseract not installed")
        
    img = Image.new('RGB', (100, 30), color = (255, 255, 255))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    # Will not contain much text, just testing it doesn't crash
    text = extract_image_text(img_bytes.getvalue())
    assert isinstance(text, str)

def test_extract_entities():
    text = "Contact hr@nexo-tech.in or call 9876543210. Visit https://nexo-tech.in. Pay Rs 5000 via t.me/hr_nexo"
    entities = extract_entities(text)
    assert "hr@nexo-tech.in" in entities.emails
    assert "nexo-tech.in" in entities.domains
    assert "9876543210" in entities.phones
    assert "Rs 5000" in entities.amounts
    assert "t.me/hr_nexo" in entities.handles
    assert "https://nexo-tech.in" in entities.urls
