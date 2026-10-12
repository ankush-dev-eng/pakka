# Pakka — Release Audit

**Audit date:** 2026-10-12  
**Auditor:** Antigravity AI (automated)  
**Branch:** `master`  
**Repository:** https://github.com/ankush-dev-eng/pakka
**Latest verified commit:** `f36f9e9`

---

## 1. Repository Root

| Item | Status |
|------|--------|
| `.git` directory present | ✅ |
| `backend/pyproject.toml` | ✅ |
| `frontend/package.json` | ✅ |
| Root `.gitignore` | ✅ Created & committed |
| Root `README.md` | ✅ Complete documentation with architecture & API |
| `docs/assets/` | ✅ Screenshots populated from verified captures |
| `LICENSE` | ❌ Not present — noted in README |

---

## 2. Untracked File Analysis

Prior to the publish session, **only two files** were tracked in Git:
- `backend/app/api/analyze.py`
- `backend/tests/test_api.py`

All other project files were untracked. The entire application was snapshot-committed in `f5e3828` and pushed to GitHub without losing any existing commit history. Subsequently, 13 code review issues across backend and frontend were resolved and verified in commit `f36f9e9`.

---

## 3. Security Preflight

### Environment files
- No `.env` files tracked in Git history or working tree.
- `backend/.env.example` created with safe placeholder values only.
- Root `.gitignore` explicitly excludes `.env` and `.env.*`.

### Secret scan — working tree
- `backend/app/config.py`: `GEMINI_API_KEY` defaults to empty string `""` — no key present.
- `backend/app/llm/gemini.py`: reads key from environment; no hardcoded secrets.
- `backend/app/llm/mock.py`: `MockLLMProvider` requires no credentials.
- No API keys, tokens, passwords, or credentials found in any source file.

### Secret scan — git history
- All commits (`c392aff`, `a1e9c22`, `dd31001`, `ff59c44`, `f5e3828`, `f36f9e9`) scanned; no secrets exist in repository history.

### Local runtime artifacts
- `backend/pakka.db` and root `pakka.db`: SQLite files — excluded by `.gitignore`.
- `backend/.venv/`: virtual environment — excluded.
- `frontend/node_modules/`: excluded.
- `frontend/.next/`: excluded.
- `backend/__pycache__/`, `backend/*.egg-info/`: excluded.

---

## 4. Tracked File Inventory

### Backend (`backend/`)
| File | Purpose |
|------|---------|
| `pyproject.toml` | Project metadata and dependencies (`python-multipart` included) |
| `requirements.txt` | Minimal pip install reference |
| `app/main.py` | FastAPI application entry point |
| `app/config.py` | Pydantic settings (reads from env) |
| `app/models.py` | SQLModel database schema (`AnalysisRecord`) |
| `app/api/analyze.py` | `/api/analyze`, `/api/report/*`, `/api/stats` endpoints |
| `app/api/health.py` | `GET /health` endpoint |
| `app/core/scoring.py` | Trust score (0–100) + verdict engine |
| `app/core/schema.py` | Pydantic response models (`AnalysisResult`) |
| `app/core/i18n.py` | i18n loader (en/hi/bn YAML) |
| `app/intel/detectors.py` | 12 deterministic fraud signal detectors |
| `app/intel/lookalike.py` | Levenshtein-based lookalike domain checker |
| `app/intel/domain_age.py` | WHOIS-free domain age estimation |
| `app/ingest/image_ocr.py` | Tesseract OCR wrapper for PNG/JPG |
| `app/ingest/pdf.py` | pdfplumber PDF text extraction |
| `app/ingest/url_fetch.py` | SSRF-safe httpx URL fetcher (manual redirects + `ip.is_global`) |
| `app/llm/provider.py` | Abstract LLM provider base |
| `app/llm/mock.py` | Default mock provider (active runtime default) |
| `app/llm/gemini.py` | Optional Gemini provider (structured output; not wired to endpoint) |
| `app/llm/grounding.py` | LLM flag grounding validator |
| `app/data/red_flags.yaml` | 12 fraud signal definitions + weights (en/hi/bn) |
| `app/data/companies.json` | Known legitimate company domain list |
| `app/data/i18n_en.yaml` | English UI translations |
| `app/data/i18n_hi.yaml` | Hindi UI translations |
| `app/data/i18n_bn.yaml` | Bengali UI translations |
| `app/db/database.py` | SQLite database init + session factory |
| `tests/` | 10 test files (unit + integration) |
| `.env.example` | Safe environment variable template |

### Frontend (`frontend/`)
| File | Purpose |
|------|---------|
| `package.json` | Next.js 16.4.0 + Framer Motion ^14.0.0 + Tailwind CSS ^4 |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `src/app/page.tsx` | Home page — hero + InputCard + feature tiles |
| `src/app/layout.tsx` | Root layout with Header |
| `src/app/globals.css` | Design tokens (CSS variables) |
| `src/app/result/[id]/page.tsx` | Dynamic result page |
| `src/app/result/[id]/ResultContent.tsx` | Result view component (verdicts, score animation, flags) |
| `src/app/community/page.tsx` | Community trends page |
| `src/app/about/page.tsx` | About page |
| `src/components/InputCard.tsx` | Main 4-tab input component |
| `src/components/Header.tsx` | Navigation header |
| `src/components/GlassTile.tsx` | Glass-card UI primitive |
| `src/components/GridBackground.tsx` | Animated grid overlay |
| `src/components/HighlightedText.tsx` | Evidence highlighting in results |
| `src/components/LangSwitch.tsx` | Language switcher (en/hi/bn) |
| `src/components/SectionBand.tsx` | Section divider component |
| `src/lib/api.ts` | Frontend API client |
| `src/lib/i18n.tsx` | Frontend i18n context hook & translations |

---

## 5. Feature Verification: Implementation Inspected vs. Tests Executed

| Feature | Implementation Inspected | Test Actually Executed | Status |
|---------|--------------------------|------------------------|--------|
| Text input analysis | `analyze.py` L51-52, `InputCard.tsx` | `test_api.py::test_analyze_valid_text` | ✅ Executed & Passed |
| PDF upload + extraction | `analyze.py` L84-86, `ingest/pdf.py` | `test_ingest.py::test_extract_pdf` | ✅ Executed & Passed |
| Screenshot/image OCR | `ingest/image_ocr.py`, `analyze.py` | `test_ingest.py::test_extract_image` | ⚠️ **Skipped** (Tesseract binary not installed on host) |
| URL fetch + analysis | `ingest/url_fetch.py`, `analyze.py` | `test_ingest.py::test_url_fetch_blocked_ip` | ✅ Executed & Passed |
| 12 fraud signal detectors | `intel/detectors.py` | `test_detectors.py` (4 tests) | ✅ Executed & Passed |
| Trust score (0–100) | `core/scoring.py` | `test_scoring.py::test_scoring_golden` | ✅ Executed & Passed |
| Verdict thresholds | `core/scoring.py` | `test_scoring.py`, `test_insufficient_info.py` | ✅ Executed & Passed |
| Insufficient info verdict | `core/schema.py`, `ResultContent.tsx` | `test_insufficient_info.py` (3 tests) | ✅ Executed & Passed |
| English analysis | `data/red_flags.yaml` en phrases | `test_fixtures.py`, `test_fixtures_accuracy.py` | ✅ Executed & Passed |
| Hindi / Bengali parity | `data/red_flags.yaml` | `test_i18n.py::test_i18n_key_parity` | ✅ Executed & Passed |
| Mock LLM (default) | `llm/mock.py` | `test_api.py`, `test_llm_grounding.py` | ✅ Executed & Passed |
| Gemini LLM provider | `llm/gemini.py` | None (not wired into `/api/analyze` endpoint) | ⚠️ **Not Wired / Not Tested Live** |
| Rate limiting | `slowapi` 10/min analyze, 5/min report | Inspected in code; bypassed in test fixtures | 🔍 Inspected only |
| SSRF protection | `ingest/url_fetch.py` | `test_ingest.py::test_url_fetch_blocked_ip` | ✅ Executed & Passed |
| Community stats | `analyze.py`, `community/page.tsx` | `test_api.py::test_stats` | ✅ Executed & Passed |
| Feedback (report/genuine) | `POST /api/report/{id}` | `test_api.py::test_report_feedback` | ✅ Executed & Passed |
| Report pack | `GET /api/report-pack/{id}` | `test_api.py::test_report_pack` | ✅ Executed & Passed (HTML stub) |
| TypeScript check | `tsconfig.json` | `npx tsc --noEmit` | ✅ Executed (0 errors) |
| Next.js production build | `next build` | `npm run build` | ✅ Executed & Passed |
| Frontend ESLint | `.eslintrc` | `npm run lint` | ⚠️ 2 unescaped quote / any errors in app files |

---

## 6. Known Limitations / Honest Caveats

1. **Gemini LLM Not Wired**: The `/api/analyze` endpoint directly instantiates `llm_provider = MockLLMProvider()`. While `GeminiProvider` exists in `app/llm/gemini.py` with structured output parsing, live Gemini analysis is not wired to runtime dispatch or tested end-to-end. Mock mode is the operational runtime default.
2. **OCR Pipeline Unverified on Host**: Tesseract OCR is not installed in the current environment (`C:\Program Files\Tesseract-OCR\tesseract.exe` not found). The image extraction unit test was skipped by `pytest`. The OCR path is implemented in code but has not processed a live image in this environment.
3. **Frontend Lint Warnings**: `npm run lint` flags 2 errors (`react/no-unescaped-entities` in `community/page.tsx` and an explicit `any` in `InputCard.tsx`). Production build (`npm run build`) and TypeScript (`tsc --noEmit`) compile successfully.
4. **Report Pack Minimal Implementation**: `/api/report-pack/{id}` returns an inline HTML string rather than generating a downloadable PDF document.
5. **Community Blocklist Scope**: `detect_community_reported` matches against hardcoded test entries (`scammer@scam.com`), not a live dynamic database of reported domains.

---

## 7. Test Execution Record

### Backend pytest
- **Command:** `.\.venv\Scripts\pytest.exe tests -v`
- **Working directory:** `backend/`
- **Exit code:** `0`
- **Results:** **31 passed, 1 skipped, 3 warnings in 8.04s**
- **Skipped test:** `tests/test_ingest.py::test_extract_image` (Tesseract not installed)

### Frontend TypeScript
- **Command:** `npx tsc --noEmit`
- **Working directory:** `frontend/`
- **Exit code:** `0`
- **Results:** Clean typecheck, 0 errors.

### Frontend Production Build
- **Command:** `npm run build`
- **Working directory:** `frontend/`
- **Exit code:** `0`
- **Results:** Compiled successfully in Turbopack, static and dynamic routes generated cleanly.

---

## 8. Verified Git Commit History

| Hash | Commit Message | Verified Role |
|------|----------------|---------------|
| `c392aff` | `fix(api): resolve 422 error on text analysis by making Form variables optional and add regression tests` | Prior repository baseline |
| `a1e9c22` | `chore(git): add root .gitignore and backend .env.example` | Repository hygiene |
| `dd31001` | `docs(release): add RELEASE_AUDIT.md with security and feature inventory` | Initial release audit draft |
| `ff59c44` | `docs(readme): add premium Pakka README with architecture, setup, and API reference` | Comprehensive project README |
| `f5e3828` | `feat: initial Pakka application snapshot` | Full working application snapshot |
| `f36f9e9` | `fix: address code review issues across backend and frontend` | Resolution of 13 code review items |
