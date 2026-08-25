# Bridge Clinical Partners — Landing Page

**Live:** https://bridgeclinicalpartners.com

Statically generated site: `build.js` pulls copy from Contentful at
**build time** and writes plain HTML — nothing fetches Contentful in the
visitor's browser. No framework, no server-side code at runtime.

**Pipeline:** push to `main`, or publish an entry in Contentful → GitHub
Actions runs `build.js` → deploys to GitHub Pages.

The build never breaks if Contentful is unreachable — it falls back to
known-good default content automatically.

## Editing content

Edit and publish entries directly in Contentful — a webhook triggers an
automatic rebuild, live within a couple of minutes. No code or git access
needed for routine content changes.

## Content model reference

For anyone adding or changing a field, the build script matches Contentful
entries by these exact field IDs:

**`hero`** (single entry)
| Field ID | Type |
|---|---|
| headlineLine1 | Short text |
| headlineLine2 | Short text |
| subtext | Long text |
| primaryButtonText | Short text |
| secondaryButtonText | Short text |
| backgroundImage | Media |

**`offeringsSection`** (single entry)
| Field ID | Type |
|---|---|
| eyebrow | Short text |
| heading | Short text |
| bodyText | Long text |

**`offeringCard`** (multiple entries)
| Field ID | Type | Notes |
|---|---|---|
| order | Integer | controls display order |
| icon | Short text | one of: `shield`, `workflow`, `tech`, `compliance`, `revenue`, `hr` (icons live in code, not Contentful) |
| title | Short text | |
| description | Long text | |

**`aboutSection`** (single entry)
| Field ID | Type |
|---|---|
| eyebrow | Short text |
| headingLine1 | Short text |
| headingLine2 | Short text |
| leadText | Short text |
| highlightText | Short text |
| bodyText | Long text (blank line = new paragraph) |
| photo | Media |

**`statementBanner`** (single entry)
| Field ID | Type |
|---|---|
| mainText | Short text |
| highlightText | Short text |
| backgroundImage | Media |

**`contactInfo`** (single entry)
| Field ID | Type |
|---|---|
| eyebrow | Short text |
| heading | Short text |
| bodyText | Long text |
| email | Short text |
| phone | Short text |
| address | Short text (auto-generates a Google Maps link once real) |
| facebookUrl | Short text |
| twitterUrl | Short text |

Logo, fonts, nav labels, footer legal links, and offering icons stay in
code — they change rarely and keeping them out of the CMS keeps the build
simple.

## Configuration

Repo secrets (Settings → Secrets and variables → Actions) used by the build:
- `CONTENTFUL_SPACE_ID`
- `CONTENTFUL_ACCESS_TOKEN` — Content Delivery API token (read-only)
- `SITE_URL` — canonical URL used for the canonical link tag and Open
  Graph/Twitter Card image URLs, currently `https://bridgeclinicalpartners.com`

## Local preview

```
npm run build   # writes static output to dist/
npx serve dist
```

Runs the exact same build the GitHub Action runs. Without the Contentful
env vars set locally, it uses the fallback content automatically.

## Placeholder text — needs real values

Ships as fallback content until real values are set in the `contactInfo`
entry:
- **Phone number** — `(XXX) XXX-XXXX`
- **Address** — `City, State`
- **Social links** — Facebook and X icons point to `#`

## Metadata

Favicon and social-share preview both use the brand logomark
(`public/assets/favicon.svg` / `.png`, 131×131) — fine for the compact
"summary" link-preview card, but not the 1200×630 image most platforms
prefer for a large rich-preview card. Send a proper 1200×630 branded
graphic if that fuller format is wanted later.

## Security recommendations

- `Content-Security-Policy` — restrict to `default-src 'self'`.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff` (already set via meta tag as a fallback)
- HTTPS is enforced.

GitHub Pages doesn't support custom response headers for a plain static
site — if strict CSP/HSTS headers matter more than convenience, fronting
with Cloudflare or moving to Netlify would be needed for that specific
piece.

## Performance

- Zero client-side JS dependencies; the only script is a ~20-line vanilla
  mobile-menu toggle.
- Zero render-blocking libraries or frameworks.
- Fonts self-hosted as WOFF2, no external font requests.
- All icons (offering cards, contact pills, social) are inline SVG — no
  icon-font request, no extra HTTP round trips.
- Images use `loading="lazy"` below the fold.
- Contentful is only ever called at build time — zero runtime API calls in
  the browser.
