import yaml
from pathlib import Path
from typing import Dict, Any

I18N_DIR = Path(__file__).parent.parent / "data"

def load_i18n(lang: str) -> Dict[str, Any]:
    file_path = I18N_DIR / f"i18n_{lang}.yaml"
    if not file_path.exists():
        file_path = I18N_DIR / "i18n_en.yaml"
    with open(file_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def get_translation(lang: str, category: str, key: str) -> str:
    data = load_i18n(lang)
    return data.get(category, {}).get(key, key)
