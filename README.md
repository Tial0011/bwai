# Project Overview

This is the official website for an educational platform that teaches
people how to use AI to build Minimum Viable Products (MVPs). The
platform is not an agency — it teaches people to build MVPs themselves,
starting with web development.

# Tagline

Build MVPs with AI.

# Vision

To empower anyone with a great idea to use AI to build and test an MVP
before needing a technical team, making it easier to solve problems and
build businesses.

# Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Firebase — future
- Netlify — deployment

No frameworks (React, Next.js, Vue, Angular) or CSS libraries
(Tailwind, Bootstrap) are used.

# Current Stage

**Deliverable 17 — SEO** ✅ Complete

The closing CTA section (deep navy, "Your idea deserves a first
version.") has been added after the FAQ. Its "Join the Next Cohort"
button reuses the Cohort section's "Coming Soon" modal via the shared
`.js-cohort-trigger` hook in `js/app.js` — no duplicate modal or
handler was introduced.

# Folder Structure

```
/
├── index.html            Base HTML shell (no sections yet)
├── css/
│   ├── style.css         Design tokens, typography, base reset
│   └── responsive.css    Breakpoint foundation
├── js/
│   └── app.js            Minimal JS entry point
├── assets/
│   ├── images/           Future images
│   ├── icons/            Future icons
│   └── logo/             logo.jpeg (provided logo — do not modify)
├── favicon/              Favicon files go here
├── netlify.toml          Static site deploy config
└── README.md             This file
```

# Local Development

This is a static site — no build step or dependencies required.

1. Open `index.html` directly in a browser, **or**
2. Serve the folder locally, e.g.:
   ```
   npx serve .
   ```
   or
   ```
   python3 -m http.server
   ```
3. Visit the local address shown in your terminal.

# Design System

Color, typography, spacing, radius, shadow, transition, and layout
tokens are defined as CSS custom properties in `css/style.css`. Both
light theme (default) and dark theme (`[data-theme="dark"]`) tokens
exist, but theme-switching logic (toggle, persistence, system
preference detection) is not implemented yet.

Typefaces: **Space Grotesk** (display/headings), **Inter** (body),
**IBM Plex Mono** (captions/data — a nod to the platform's coding
and AI focus).

# SEO

SEO setup is included in Deliverable 17:
- Page title and meta description
- Canonical URL placeholder
- Open Graph and Twitter/X metadata
- JSON-LD structured data
- Favicon set
- `robots.txt`
- `sitemap.xml`
- Google Search Console setup guide

**Important:** replace `https://your-domain.example/` with the real production domain before launch.

# Future Development

Remaining work: Firebase scaffolding, final QA, accessibility polish, and the complete production README/package.
