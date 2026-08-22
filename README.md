# Bridge Clinical Partners — Landing Page

**Status:** In development — pending final content

A static, dependency-free build (`index.html`, `styles.css`, `script.js`). No
framework, no build step, no npm packages, no server-side code.

## Placeholder text — needs your input

- **Phone number** — currently `(XXX) XXX-XXXX` (Contact section)
- **Address** — currently `City, State` (Contact section)
- **Social links** — Facebook and X icons in the footer currently point to `#`

## Security recommendations (set at your host/CDN, not in the HTML)

Static sites have a very small attack surface already (no server code, no
database, no auth), but for a healthcare-adjacent brand, set these response
headers at your host (Netlify, Vercel, Cloudflare Pages, S3+CloudFront all
support this via config, no code required):

- `Content-Security-Policy` — restrict to `default-src 'self'`.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff` (already set via meta tag as a fallback)
- Force HTTPS-only serving (default on Netlify/Vercel/CloudFront).

## Performance already baked in

- Zero JS dependencies; the only script is a ~20-line vanilla mobile-menu
  toggle.
- Zero render-blocking libraries or frameworks.
- Fonts self-hosted as WOFF2, no external font requests.
- All icons (offering cards, contact pills, social) are inline SVG — no
  icon-font request, no extra HTTP round trips.
- Images use `loading="lazy"` below the fold.

## Local preview

Open `index.html` in a browser, or serve the folder with any static server,
e.g. `npx serve .`
