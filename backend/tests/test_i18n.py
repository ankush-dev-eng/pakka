from app.core.i18n import load_i18n

def get_all_keys(d, prefix=""):
    keys = set()
    for k, v in d.items():
        if isinstance(v, dict):
            keys.update(get_all_keys(v, f"{prefix}{k}."))
        else:
            keys.add(f"{prefix}{k}")
    return keys

def test_i18n_key_parity():
    en = load_i18n("en")
    hi = load_i18n("hi")
    bn = load_i18n("bn")
    
    en_keys = get_all_keys(en)
    hi_keys = get_all_keys(hi)
    bn_keys = get_all_keys(bn)
    
    assert en_keys == hi_keys, f"English and Hindi keys differ: {en_keys ^ hi_keys}"
    assert en_keys == bn_keys, f"English and Bengali keys differ: {en_keys ^ bn_keys}"
