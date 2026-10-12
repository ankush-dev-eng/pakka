# Pakka - Architectural & Technical Decisions

1. **Input payload encoding:** Switching from standard JSON to Native `FormData` allows unified endpoint processing for textual scraping, copy-pasting, and raw PDF uploads.
2. **Provider usage (AdaptionLabs):** To preserve isolated security requirements, unauthenticated generic calls remain mocked, keeping secret keys off the client completely.
3. **Typing on Backend Form Data:** FastApi uses `python-multipart` extensively. To prevent 422 errors on single-field inputs (text-only, no file), strict `Optional[UploadFile] = File(None)` must be enforced so the parser does not fail to coerce objects.
4. **Motion Engine:** Adopted `framer-motion` for React due to superior compatibility with Next.js SSR architecture over pure CSS keyframes for complex staggering.
