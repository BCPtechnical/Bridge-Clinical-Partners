# Bridge Clinical Partners — Landing Page

A static, dependency-free build (`index.html`, `styles.css`, `script.js`). No
framework, no build step, no npm packages, no server-side code — nothing to
patch, nothing exposed.

## Current status

### Images & logo — working, but temporary
The logo (nav + footer), hero background, About Us photo, and the "We answer
to you" statement background are all pulled live from Figma's own asset CDN
and are wired into the page now — open `index.html` and they'll render
correctly.

**These Figma URLs expire in ~7 days.** My sandbox environment is
network-restricted and can't reach figma.com to download and permanently
self-host the files (this is a deliberate security limitation on my end, not
a Figma restriction). Before you launch:
1. In Figma, select each asset (logo, hero photo, about photo) → Export →
   PNG/SVG.
2. Upload the exported files here and I'll drop them into `/assets` and
   repoint the `<img>` tags to local, permanent paths — this is also faster
   and more private than hotlinking Figma.

### Fonts — pending your files
The Figma file specs "Oceanic Text" and "Oceanic Grotesk" (Interval Type,
a paid foundry — not open source). You confirmed you have a license. Send
over the `.woff2` (preferred) or `.otf`/`.ttf` files for both families and
I'll self-host them via `@font-face` — no third-party font requests at all,
which is both faster and more private than pulling from Google Fonts.

Until then, the site uses Manrope (headings) + Inter (body) from Google
Fonts as a close visual stand-in.

### Still placeholder text — needs your input
- **Phone number** — currently `(XXX) XXX-XXXX` (Contact section)
- **Address** — currently `City, State` (Contact section)
- **Social links** — Facebook and X icons in the footer currently point to `#`

## Security recommendations (set at your host/CDN, not in the HTML)

Static sites have a very small attack surface already (no server code, no
database, no auth), but for a healthcare-adjacent brand, set these response
headers at your host (Netlify, Vercel, Cloudflare Pages, S3+CloudFront all
support this via config, no code required):

- `Content-Security-Policy` — restrict to `default-src 'self'`; once fonts
  are self-hosted you can drop the Google Fonts allowance entirely.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff` (already set via meta tag as a fallback)
- Force HTTPS-only serving (default on Netlify/Vercel/CloudFront).

## Performance already baked in

- Zero JS dependencies; the only script is a ~20-line vanilla mobile-menu
  toggle.
- Zero render-blocking libraries or frameworks.
- All icons (offering cards, contact pills, social) are inline SVG — no
  icon-font request, no extra HTTP round trips.
- Images use `loading="lazy"` below the fold.

## Local preview

Open `index.html` in a browser, or serve the folder with any static server,
e.g. `npx serve .`
