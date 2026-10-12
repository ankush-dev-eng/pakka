# Pakka - Repair Plan

## Objectives
1. **Frontend Input Mode Switching**: Re-architect `InputCard.tsx` to handle Text, File, and URL states cleanly and securely. Send payloads as `FormData`.
2. **Backend Multipart Support**: Refactor `api/analyze.py` to accept `Optional[str]` and `Optional[UploadFile]`, extracting text conditionally via `pdfplumber` or `pytesseract`.
3. **Motion Design**: Introduce subtle page layout staggers using `framer-motion` for a premium dawn-gradient aesthetic.
4. **Security**: Validate SSRF on URL scraping. Cap trust score severely if 'money_forwarding' or 'fee_request' are triggered.
5. **Testing**: Run complete Playwright frontend test suite and pytest backend assertions.

## Status: COMPLETE
All objectives have been successfully implemented and verified through the respective CI pipelines.
