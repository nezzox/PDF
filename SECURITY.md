# Security hardening

The production editor is static and processes project files locally. It has no account system, API server or production package dependencies.

## Active controls
- Meta Content Security Policy: same-origin scripts, no inline scripts/eval, no outbound fetch/WebSocket connections, no frames/plugins/workers, no form submissions or base URL overrides. Inline CSS is allowed because the editor sets geometry and rich-text styles dynamically.
- No-referrer policy.
- HTML is rendered as text, never imported as markup. Native HTML/file drops are cancelled. Paste accepts plain text.
- Layout identifiers must be own properties of the allowlist. Project import builds a fresh allowlisted model and regenerates identifiers.
- Imports: 100 MB file limit; 100 pages; 500 blocks per page / 1,000 total; 5,000 cells; 50,000 text runs; 200,000 characters per cell / 2 million total; title 500 characters and bands 20,000 each. Image data is limited to PNG/JPEG/WebP data URLs, 32 MB encoded per image and 96 MB aggregate.
- Locally selected images: 20 MB file limit, 40 million decoded pixels, resized to at most 2,400 pixels per side, re-encoded to PNG. The pixel check happens after decoding; embedded project images are validated for URL format/size but not decoded by the model. These limits reduce resource abuse; they cannot eliminate browser decoder or memory risks.
- GitHub Actions have read-only repository permissions, no persisted checkout credentials, pinned action commits and a job timeout.
- Model, browser, security and print regression checks run in GitHub Actions.

## Hosting boundary
This change updates nezzox/PDF and its GitHub Pages deployment. It does not change a separately hosted ChatGPT Sites copy or domain/proxy settings.

HTTP response headers must be configured at the actual hosting/CDN layer. No server-header protection is claimed from this repository's HTML. In particular, frame-ancestors is ignored in a meta policy (https://www.w3.org/TR/CSP/#directive-frame-ancestors). Recommended header configuration for a standalone deployment:
- Content-Security-Policy: the current meta policy plus frame-ancestors 'none'
- X-Content-Type-Options: nosniff
- Referrer-Policy: no-referrer
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Strict-Transport-Security: max-age=31536000 (only after confirming this host is served permanently over HTTPS)

If embedding is intentionally supported, explicitly allow the required parent origins instead of frame-ancestors 'none'. GitHub Pages does not expose arbitrary response-header configuration through these static files. Configure those headers on a controlled reverse proxy/CDN or hosting provider.

No claim is made that the site is vulnerability-free. No penetration testing of unrelated systems, DNS changes or account security changes were performed.
