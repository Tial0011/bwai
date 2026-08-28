# BWAI — Build MVPs with AI

Production package for **https://bwai0.netlify.app/**.

## What BWAI teaches

BWAI is a beginner-friendly practical learning platform. The goal is not to overwhelm learners with advanced software engineering. We start with the fundamentals, then show learners how AI can help them build.

### Core curriculum

1. **HTML Basics** — webpage structure, semantic HTML, links, images, forms.
2. **CSS Basics** — selectors, spacing, typography, layout, Flexbox, responsive design.
3. **JavaScript Basics** — variables, functions, events, DOM manipulation, and simple interactivity.
4. **GitHub Basics** — repositories, commits, pushing code, and project organization.
5. **Netlify Deployment** — publishing a website and understanding the basic deployment workflow.
6. **Firebase Basics** — introduction to connecting a web app to authentication and a database.
7. **Build With AI** — using AI to plan, write, explain, debug, improve, and iterate on code.

The learning philosophy is: **understand the basics → use AI as a building partner → build real projects.**

## Stack

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub
- Netlify
- Firebase (future cohort/project integration)
- AI coding assistants

No framework or CSS library is required for the core site.

## Production deployment

This is a static site with no build step.

### Netlify

The production site is configured for:

`https://bwai0.netlify.app/`

The deploy/publish directory is:

`buildmvps/`

If deploying through Netlify's Git integration, point the publish directory to `buildmvps` and leave the build command empty.

## Project structure

```text
buildmvps/
├── index.html
├── netlify.toml
├── robots.txt
├── sitemap.xml
├── .gitignore
├── README.md
├── GOOGLE-SEARCH-CONSOLE.md
├── css/
│   ├── style.css
│   ├── responsive.css
│   ├── nav.css
│   ├── hero.css
│   ├── problem.css
│   ├── what-we-teach.css
│   ├── mvp-journey.css
│   ├── why-ai.css
│   ├── who-its-for.css
│   ├── about.css
│   ├── cohort.css
│   ├── faq.css
│   ├── final-cta.css
│   ├── footer.css
│   └── scroll-reveal.css
├── js/
│   ├── app.js
│   ├── cohort-form.js
│   └── firebase-config.example.js
├── assets/
├── favicon/
└── ...
```

## Future Firebase cohort form

The current cohort CTA remains **Coming Soon**. Firebase is intentionally scaffolded but not connected to a live project.

### When registration opens

1. Create a Firebase project.
2. Register a web app.
3. Copy `js/firebase-config.example.js` to `js/firebase-config.js`.
4. Add the real web-app configuration.
5. Enable only the Firebase services required by the cohort.
6. Add a Firestore collection such as `cohortLeads`.
7. Add strict Firestore Security Rules.
8. Build and validate the registration form.
9. Test submissions before switching the public CTA from "Coming Soon" to the live form.

**Important:** frontend Firebase config is not a place for private Admin SDK credentials or service-account keys.

## SEO

The production domain has been applied to:

- canonical URL
- Open Graph URL
- Open Graph image
- Twitter/X image
- JSON-LD organization URL
- JSON-LD website URL
- `robots.txt`
- `sitemap.xml`

Submit the sitemap in Google Search Console after the site is live:

`https://bwai0.netlify.app/sitemap.xml`

## Final QA checklist

Before launch, verify:

- [ ] Homepage loads on desktop and mobile.
- [ ] All navigation links scroll to an existing section.
- [ ] Mobile navigation opens/closes correctly.
- [ ] Escape closes the mobile menu.
- [ ] Theme toggle works and persists.
- [ ] Cohort modal opens, closes, and traps focus.
- [ ] FAQ buttons expand/collapse correctly.
- [ ] Footer year updates automatically.
- [ ] Scroll-reveal animations respect reduced-motion settings.
- [ ] No missing CSS, JS, image, or favicon assets.
- [ ] Canonical/SEO URLs point to `bwai0.netlify.app`.
- [ ] `robots.txt` points to the production sitemap.
- [ ] Sitemap uses the production URL.
- [ ] No real Firebase secrets are committed.
- [ ] Final deployed site has no browser-console errors.

## Local testing

Because this is a static site, no package installation is required.

```bash
python3 -m http.server 8000
```

Then open:

`http://localhost:8000/`

from inside `buildmvps/`.

## Status

**D18 — Finalization**

- README/documentation: complete
- Firebase future scaffolding for cohort form: complete
- Production domain configuration: complete
- Final static QA: complete
- Cleanup: complete
- Production ZIP: ready
