import os
import shutil
import pytesseract
from PIL import Image
import io

def get_tesseract_cmd() -> str:
    env_cmd = os.environ.get("TESSERACT_PATH")
    if env_cmd and os.path.exists(env_cmd):
        return env_cmd
    which_cmd = shutil.which("tesseract")
    if which_cmd:
        return which_cmd
    if os.name == 'nt':
        default_nt = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        if os.path.exists(default_nt):
            return default_nt
    return "tesseract"

pytesseract.pytesseract.tesseract_cmd = get_tesseract_cmd()

def extract_image_text(file_bytes: bytes) -> str:
    # Re-evaluate path in case env was updated dynamically
    pytesseract.pytesseract.tesseract_cmd = get_tesseract_cmd()
    try:
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        return text
    except pytesseract.TesseractNotFoundError:
        raise RuntimeError(
            "Tesseract OCR is not installed or not found on the system. "
            "Please install Tesseract-OCR or specify its location via the TESSERACT_PATH environment variable."
        )
    except Exception as e:
        raise ValueError(f"Failed to process image: {e}")
