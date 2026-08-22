# Bridge Clinical Partners — Landing Page

A static, dependency-free build (`index.html`, `styles.css`, `script.js`). No
framework, no build step, no npm packages, no server-side code — nothing to
patch, nothing exposed.

## Current status

### Images & logo — done, self-hosted
The logo (nav + footer), hero background, offerings watermark, About Us
photo, and the "We answer to you" statement background are all local files
in `/assets`, exported from Figma and wired in permanently. No third-party
hotlinking, nothing that expires.

### Fonts — still pending a real license
The Figma file specs "Oceanic Text" and "Oceanic Grotesk" (Interval Type,
a paid foundry — not open source). The font files sent over so far are
marked internally as `TRIAL` builds with a "Personal Use Only" license from
a free-download site, not a purchased commercial license from Interval Type
(intervaltype.com or type.today) — so they haven't been wired in, since
shipping a trial font on a live commercial site is a real legal exposure for
the client.

Two ways to close this out:
1. Purchase the commercial license, then send the licensed `.woff2`
   (preferred) or `.otf`/`.ttf` files and I'll self-host them via
   `@font-face` — no third-party font requests at all, faster and more
   private than Google Fonts.
2. Confirm with the client — they may already hold a license from whoever
   built the original Figma file.

Until then, the site uses Manrope (headings) + Inter (body) from Google
Fonts as a close visual stand-in.

### Still placeholder text — needs your input
- **Phone number** — currently `(XXX) XXX-XXXX` (Contact section)
- **Address** — currently `City, State` (Contact section)
- **Social links** — Facebook and X icons in the footer currently point to `#`

## Design details already implemented

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
