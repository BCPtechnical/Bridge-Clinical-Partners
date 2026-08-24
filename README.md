# Bridge Clinical Partners — Landing Page

**Status:** In development — pending final content and Contentful setup

Statically generated site: a Node build script (`build.js`) pulls copy from
Contentful at **build time** and writes plain HTML — nothing fetches
Contentful in the visitor's browser. The deployed site is exactly as fast
and dependency-free as a hand-written static page. No framework, no
server-side code at runtime.

Pipeline: **push to `main`** → GitHub Actions runs `node build.js` → output
deploys to GitHub Pages → Porkbun DNS points at GitHub Pages.

The build never breaks even before Contentful is configured — if the two
secrets below aren't set, or the Contentful API is unreachable, the build
falls back to the current known-good content automatically.

## One-time setup

### 1. Contentful content model

Create these content types in your Contentful space, with these exact
field IDs (the build script matches on these):

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

**`offeringCard`** (multiple entries — one per card, 6 today)
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
| address | Short text |
| facebookUrl | Short text |
| twitterUrl | Short text |

Logo, fonts, nav labels, footer legal links, and offering icons stay in code
— they change rarely and keeping them out of the CMS keeps the build simple.

### 2. GitHub repo secrets

In the repo: **Settings → Secrets and variables → Actions → New repository
secret**, add:

- `CONTENTFUL_SPACE_ID`
- `CONTENTFUL_ACCESS_TOKEN` — a **Content Delivery API** token (read-only),
  from Contentful: Settings → API keys.
- `SITE_URL` *(optional)* — the site's canonical URL, no trailing slash,
  e.g. `https://bridgeclinicalpartners.com`. Used for the canonical link tag
  and Open Graph/Twitter Card image URLs. Defaults to the current GitHub
  Pages URL if unset — **update this once the custom domain (step 4) is
  live**, otherwise social share previews will still point at the
  `github.io` address.

### 3. GitHub Pages

**Settings → Pages → Source → GitHub Actions.** The included workflow
(`.github/workflows/deploy.yml`) handles the rest on every push to `main`.

### 4. Custom domain (Porkbun DNS)

In the repo: **Settings → Pages → Custom domain**, enter your domain —
GitHub will create a `CNAME` file automatically and commit it.

At Porkbun, add these DNS records:
- **Apex domain** (`bridgeclinicalpartners.com`): four `A` records pointing to
  `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- **`www` subdomain**: a `CNAME` record pointing to `<your-github-username>.github.io`

Once DNS propagates, check **"Enforce HTTPS"** in the same Pages settings.

### 5. Let Contentful trigger a rebuild automatically

Important: this is a **build-time** integration (see top of this file) —
publishing an edit in Contentful does not update the live site by itself.
Something has to re-run the build. Two ways to do that:

**A. Manual** — repo → **Actions** tab → "Build and deploy to GitHub Pages"
→ **Run workflow**. Always available, no setup needed, good enough if edits
are infrequent.

**B. Automatic (recommended for a client who'll edit regularly)** — a
Contentful webhook calls GitHub's API on every publish, kicking off the same
workflow with no manual step:

1. Generate a **separate** fine-grained GitHub token just for this (Settings
   → Developer settings → Personal access tokens): repository access limited
   to this repo, permission **Contents: Read and write**. Keep this separate
   from any token used for pushing code — it only ever needs to trigger
   builds.
2. In Contentful: **Settings → Webhooks → Add webhook**
   - URL: `https://api.github.com/repos/Oh-Zephyr/Bridge-Clinical-Partners/dispatches`
   - Method: `POST`
   - Headers: `Authorization: Bearer <the token from step 1>`,
     `Accept: application/vnd.github+json`
   - Content type: `application/json`
   - Custom payload: `{"event_type": "contentful-publish"}`
   - Triggers: at minimum **Entry: Publish** and **Entry: Unpublish**;
     add **Asset: Publish** too if photos will be swapped via Contentful.
3. Save. From then on, publishing in Contentful triggers a rebuild within
   the same few minutes as pushing code would.

## Local preview

```
npm run build   # writes static output to dist/
npx serve dist
```

Runs the exact same build the GitHub Action runs. Without the two
Contentful env vars set locally, it uses the fallback content automatically.

## Placeholder text — needs your input

Ships as fallback content until Contentful entries are filled in:
- **Phone number** — `(XXX) XXX-XXXX`
- **Address** — `City, State`
- **Social links** — Facebook and X icons point to `#`

## Metadata

Favicon and social-share preview both use the brand logomark
(`public/assets/favicon.svg` / `.png`, 131×131). This works for the
"summary" Twitter/link-preview card format, but it's not the ideal
1200×630 image most platforms prefer for the larger rich-preview card — if
you want that fuller format later, send over (or have designed) a proper
1200×630 branded share graphic and I'll wire it in as `og:image` with
`twitter:card` switched to `summary_large_image`.

## Security recommendations (set at your host/CDN, not in the HTML)

- `Content-Security-Policy` — restrict to `default-src 'self'`.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff` (already set via meta tag as a fallback)
- HTTPS is enforced automatically once you check the box in GitHub Pages
  settings (step 4 above).

GitHub Pages doesn't support custom response headers for a plain static
site — if strict CSP/HSTS headers matter more than convenience, a host like
Cloudflare Pages or Netlify (fronting the same GitHub Pages output, or
replacing it) would be needed for that specific piece.

## Performance already baked in

- Zero client-side JS dependencies; the only script is a ~20-line vanilla
  mobile-menu toggle.
- Zero render-blocking libraries or frameworks.
- Fonts self-hosted as WOFF2, no external font requests.
- All icons (offering cards, contact pills, social) are inline SVG — no
  icon-font request, no extra HTTP round trips.
- Images use `loading="lazy"` below the fold.
- Contentful is only ever called at build time — zero runtime API calls in
  the browser.
