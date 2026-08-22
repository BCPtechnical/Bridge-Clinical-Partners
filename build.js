#!/usr/bin/env node
/**
 * Build script — Bridge Clinical Partners
 *
 * Pulls marketing copy from Contentful (Content Delivery API) at BUILD time
 * only. The output of this script is a plain static index.html — nothing
 * fetches Contentful in the visitor's browser, so the deployed site is just
 * as fast and dependency-free as a hand-written static page.
 *
 * If CONTENTFUL_SPACE_ID / CONTENTFUL_ACCESS_TOKEN aren't set, or the
 * Contentful API is unreachable, the build falls back to the known-good
 * default content below rather than failing — so `git push` never produces
 * a broken deploy, even before Contentful is fully set up.
 *
 * Requires Node.js 18+ (uses the built-in fetch — no npm dependencies).
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master';

// ---------------------------------------------------------------------------
// Known-good fallback content — exactly what's on the site today. This is
// what ships if Contentful isn't configured yet, or a fetch fails.
// ---------------------------------------------------------------------------
const DEFAULT_CONTENT = {
  hero: {
    headlineLine1: '100% Physician-Owned.',
    headlineLine2: 'Zero Private Equity.',
    subtext: 'Retain your independence and restore your clinical autonomy. Bridge Clinical Partners is a physician-led Management Services Organization (MSO) that provides the enterprise-level operational support you need to thrive—without forcing you to sell out to corporate interests.',
    primaryButtonText: 'Protect Your Practice',
    secondaryButtonText: 'Our Physician-Led Model',
    backgroundImage: 'assets/hero-bg.png',
  },
  offeringsSection: {
    eyebrow: 'Our Offerings',
    heading: 'The Infrastructure to Stay Independent',
    bodyText: "You don't have to sell your practice to survive the administrative burdens of modern medicine. We provide the comprehensive, end-to-end management solutions you need to scale profitably, while you maintain 100% control over patient care.",
  },
  offerings: [
    { order: 1, icon: 'shield', title: 'Practice Preservation & Independence', description: 'Stay at the helm. We provide the operational scale and leverage of a corporate entity, but our only shareholders are the physicians we serve. We handle the business; you keep your autonomy.' },
    { order: 2, icon: 'workflow', title: 'Operations & Workflow Optimization', description: 'Eliminate bottlenecks. We optimize your front-desk protocols, patient scheduling, and daily workflows to enhance efficiency and the patient experience.' },
    { order: 3, icon: 'tech', title: 'Technology & EHR Support', description: 'Keep your practice secure and connected. We offer IT infrastructure management, EHR optimization, and data security compliance.' },
    { order: 4, icon: 'compliance', title: 'Regulatory Compliance & Credentialing', description: 'Navigate healthcare regulations with confidence. We manage provider credentialing, HIPAA compliance, and risk management protocols.' },
    { order: 5, icon: 'revenue', title: 'Revenue Cycle Management (RCM)', description: 'Maximize your collections and minimize denials. We handle everything from coding compliance to billing and aggressive accounts receivable follow-up.' },
    { order: 6, icon: 'hr', title: 'Human Resources & Staffing', description: 'Build a reliable, high-performing team. We manage recruiting, onboarding, payroll, benefits administration, and staff training.' },
  ],
  about: {
    eyebrow: 'About Us',
    headingLine1: 'Built by Physicians.',
    headingLine2: 'Answering Only to Physicians.',
    leadText: 'Bridge Clinical Partners was founded on a simple, uncompromising principle:',
    highlightText: 'Healthcare should be led by doctors, not private equity firms.',
    bodyText: 'As a practicing physician, our founder built this Management Services Organization to run his own clinical entity. We needed a way to eliminate administrative burnout and scale operations—all without sacrificing our independence to outside investors.\n\nWe successfully built that infrastructure, and now we are offering it to you. We understand the daily realities of patient care and the pressures pushing private practices toward corporate consolidation. Our mission is to provide you with the robust business support you need to remain independent, profitable, and in control of your clinical decisions.',
    photo: 'assets/about-photo.png',
  },
  statement: {
    mainText: 'We answer to you, and ',
    highlightText: 'you answer to your patients.',
    backgroundImage: 'assets/statement-bg.png',
  },
  contact: {
    eyebrow: 'Contact Us',
    heading: 'Let\u2019s work together.',
    bodyText: 'When you feel ready to part with some (or all) the administrative responsibilities of being a doctor, reach out to our leadership team for a confidential consultation.',
    email: 'info@bridgeclinicalpartners.com',
    phone: '(XXX) XXX-XXXX',
    address: 'City, State',
    facebookUrl: '#',
    twitterUrl: '#',
  },
};

// ---------------------------------------------------------------------------
// Inline icon SVGs, keyed to match the "icon" short-text field on the
// offeringCard content type in Contentful. Kept in code (not Contentful
// media) so the offering cards stay zero-extra-request inline SVG.
// ---------------------------------------------------------------------------
const ICONS = {
  shield: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M12 2 L20 5 V11 C20 16 16.5 20.5 12 22 C7.5 20.5 4 16 4 11 V5 Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  workflow: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2.5" stroke="currentColor" stroke-width="1.5"/><circle cx="5" cy="19" r="2.5" stroke="currentColor" stroke-width="1.5"/><circle cx="19" cy="19" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M12 7.5V12M12 12L5 16.5M12 12L19 16.5" stroke="currentColor" stroke-width="1.5"/></svg>',
  tech: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="1.5"/></svg>',
  compliance: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M6 4 L11 9 L4 16 L2 14 L9 7 M13 6 L19 12 L16 15 L10 9 M17 16 L21 20 L19 22 L15 18" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  revenue: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 10h20M7 15h4" stroke="currentColor" stroke-width="1.5"/></svg>',
  hr: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/><circle cx="17" cy="9" r="2.4" stroke="currentColor" stroke-width="1.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15.5 14.5c2.7 0 5 2.1 5 5.5" stroke="currentColor" stroke-width="1.5"/></svg>',
};

// ---------------------------------------------------------------------------
// Contentful fetch helpers
// ---------------------------------------------------------------------------
async function fetchEntries(contentType) {
  const url = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT}/entries?content_type=${contentType}&include=2&access_token=${ACCESS_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Contentful request failed for "${contentType}": ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function resolveAssetUrl(assetLink, includes) {
  if (!assetLink?.sys?.id || !includes?.Asset) return null;
  const asset = includes.Asset.find(a => a.sys.id === assetLink.sys.id);
  const url = asset?.fields?.file?.url;
  return url ? (url.startsWith('//') ? `https:${url}` : url) : null;
}

/** Merge Contentful fields onto a default object, only overriding present, non-empty values. */
function mergeFields(defaults, fields, includes, assetKeys = []) {
  const out = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (assetKeys.includes(key)) {
      const resolved = resolveAssetUrl(fields?.[key], includes);
      if (resolved) out[key] = resolved;
    } else if (typeof fields?.[key] === 'string' && fields[key].trim() !== '') {
      out[key] = fields[key];
    }
  }
  return out;
}

async function loadContent() {
  if (!SPACE_ID || !ACCESS_TOKEN) {
    console.log('[build] CONTENTFUL_SPACE_ID / CONTENTFUL_ACCESS_TOKEN not set — using default content.');
    return DEFAULT_CONTENT;
  }

  try {
    const [hero, offeringsSection, offerings, about, statement, contact] = await Promise.all([
      fetchEntries('hero'),
      fetchEntries('offeringsSection'),
      fetchEntries('offeringCard'),
      fetchEntries('aboutSection'),
      fetchEntries('statementBanner'),
      fetchEntries('contactInfo'),
    ]);

    const content = { ...DEFAULT_CONTENT };

    if (hero.items?.[0]) {
      content.hero = mergeFields(DEFAULT_CONTENT.hero, hero.items[0].fields, hero.includes, ['backgroundImage']);
    }
    if (offeringsSection.items?.[0]) {
      content.offeringsSection = mergeFields(DEFAULT_CONTENT.offeringsSection, offeringsSection.items[0].fields, null);
    }
    if (offerings.items?.length) {
      content.offerings = offerings.items
        .map(item => ({
          order: item.fields.order ?? 999,
          icon: ICONS[item.fields.icon] ? item.fields.icon : 'shield',
          title: item.fields.title || '',
          description: item.fields.description || '',
        }))
        .sort((a, b) => a.order - b.order);
    }
    if (about.items?.[0]) {
      content.about = mergeFields(DEFAULT_CONTENT.about, about.items[0].fields, about.includes, ['photo']);
    }
    if (statement.items?.[0]) {
      content.statement = mergeFields(DEFAULT_CONTENT.statement, statement.items[0].fields, statement.includes, ['backgroundImage']);
    }
    if (contact.items?.[0]) {
      content.contact = mergeFields(DEFAULT_CONTENT.contact, contact.items[0].fields, null);
    }

    console.log('[build] Loaded content from Contentful.');
    return content;
  } catch (err) {
    console.warn(`[build] Contentful fetch failed (${err.message}) — falling back to default content.`);
    return DEFAULT_CONTENT;
  }
}

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------
function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/** Turn blank-line-separated paragraphs into <br><br>-joined HTML, escaping content first. */
function paragraphize(str = '') {
  return escapeHtml(str)
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .join('<br><br>');
}

function digitsOnly(str = '') {
  return str.replace(/[^\d+]/g, '');
}

function mapUrlFor(address = '') {
  if (!address || address.trim() === 'City, State') return '#';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function renderOfferingsBlock(template, offerings) {
  const startMarker = '<!--OFFERINGS_START-->';
  const endMarker = '<!--OFFERINGS_END-->';
  const startIdx = template.indexOf(startMarker);
  const endIdx = template.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Offerings block markers not found in template.');
  }

  const cardTemplate = template.slice(startIdx + startMarker.length, endIdx);
  const rendered = offerings
    .map(o => cardTemplate
      .replaceAll('{{icon}}', ICONS[o.icon] || ICONS.shield)
      .replaceAll('{{title}}', escapeHtml(o.title))
      .replaceAll('{{description}}', escapeHtml(o.description)))
    .join('\n');

  return template.slice(0, startIdx) + rendered + template.slice(endIdx + endMarker.length);
}

function renderTemplate(template, content) {
  let html = renderOfferingsBlock(template, content.offerings);

  const replacements = {
    'hero.headlineLine1': escapeHtml(content.hero.headlineLine1),
    'hero.headlineLine2': escapeHtml(content.hero.headlineLine2),
    'hero.subtext': escapeHtml(content.hero.subtext),
    'hero.primaryButtonText': escapeHtml(content.hero.primaryButtonText),
    'hero.secondaryButtonText': escapeHtml(content.hero.secondaryButtonText),
    'hero.backgroundImage': content.hero.backgroundImage,

    'offeringsSection.eyebrow': escapeHtml(content.offeringsSection.eyebrow),
    'offeringsSection.heading': escapeHtml(content.offeringsSection.heading),
    'offeringsSection.bodyText': escapeHtml(content.offeringsSection.bodyText),

    'about.eyebrow': escapeHtml(content.about.eyebrow),
    'about.headingLine1': escapeHtml(content.about.headingLine1),
    'about.headingLine2': escapeHtml(content.about.headingLine2),
    'about.leadText': escapeHtml(content.about.leadText),
    'about.highlightText': escapeHtml(content.about.highlightText),
    'about.bodyText': paragraphize(content.about.bodyText),
    'about.photo': content.about.photo,

    'statement.mainText': escapeHtml(content.statement.mainText),
    'statement.highlightText': escapeHtml(content.statement.highlightText),
    'statement.backgroundImage': content.statement.backgroundImage,

    'contact.eyebrow': escapeHtml(content.contact.eyebrow),
    'contact.heading': escapeHtml(content.contact.heading),
    'contact.bodyText': escapeHtml(content.contact.bodyText),
    'contact.email': escapeHtml(content.contact.email),
    'contact.phone': escapeHtml(content.contact.phone),
    'contact.phoneHref': digitsOnly(content.contact.phone),
    'contact.address': escapeHtml(content.contact.address),
    'contact.mapUrl': mapUrlFor(content.contact.address),
    'contact.facebookUrl': content.contact.facebookUrl,
    'contact.twitterUrl': content.contact.twitterUrl,
  };

  for (const [token, value] of Object.entries(replacements)) {
    html = html.replaceAll(`{{${token}}}`, value ?? '');
  }
  return html;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function build() {
  const distDir = path.join(__dirname, 'dist');
  const publicDir = path.join(__dirname, 'public');
  const templatePath = path.join(__dirname, 'src', 'index.template.html');

  mkdirSync(distDir, { recursive: true });

  // Copy every static passthrough file (CSS, JS, images, fonts) as-is.
  cpSync(publicDir, distDir, { recursive: true });

  const content = await loadContent();
  const template = readFileSync(templatePath, 'utf8');
  const html = renderTemplate(template, content);
  writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');

  // Preserve a custom domain across GitHub Pages deploys, if configured.
  const cnamePath = path.join(__dirname, 'CNAME');
  if (existsSync(cnamePath)) {
    cpSync(cnamePath, path.join(distDir, 'CNAME'));
  }

  console.log(`[build] Wrote ${path.join('dist', 'index.html')} and copied static assets.`);
}

build().catch(err => {
  console.error('[build] Failed:', err);
  process.exit(1);
});
