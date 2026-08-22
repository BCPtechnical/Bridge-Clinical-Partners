# Bridge Clinical Partners — Landing Page

A static, dependency-free build (`index.html`, `styles.css`, `script.js`). No
framework, no build step, no npm packages, no server-side code — nothing to
patch, nothing exposed.

## Current status

### Still placeholder text — needs your input
- **Phone number** — currently `(XXX) XXX-XXXX` (Contact section)
- **Address** — currently `City, State` (Contact section)
- **Social links** — Facebook and X icons in the footer currently point to `#`

## Design details already implemented

- **Fonts** — Oceanic Text (headings, buttons) and Oceanic Grotesk (body
  text) are self-hosted as WOFF2 in `/assets/fonts`, no third-party font
  requests.
- **Fully responsive** — nav collapses to a hamburger menu under 900px;
  section vertical padding scales fluidly with `clamp()` at every viewport
  width rather than only at fixed breakpoints; offering cards and the About
  Us layout collapse to a single column on smaller screens; contact pills
  stack full-width under 520px.
- **Hover/interaction states** — buttons grow and lift with a color/shadow
  change on hover and a press-down effect on click; offering cards lift with
  a deepening shadow, accent border, and the icon fills solid on hover;
  contact pills and footer social icons get matching lift effects.
  `prefers-reduced-motion` is respected throughout — anyone with that OS
  setting gets the color changes without the movement.

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
