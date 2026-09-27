# CLAUDE.md

This file gives Claude Code (claude.ai/code) guidance for working in this repository.

## What this is

A static marketing site for **Arekas Arena** (arekas.in), a 2.5-acre outdoor event venue in Rajanukunte, North Bangalore, run by KR Endeavours. It also covers **Bamboo Arcadia**, a sister property. There is no build step, framework, package manager or tests. Every page is a hand-written, self-contained `.html` file at the repo root.

## Running locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Layout

- `*.html` (repo root): one file per page, 18 in all. `index.html` (~160 KB) and `bamboo-arcadia.html` hold page-specific JavaScript and modals. The others follow a shared template.
- `assets/theme.css` and `assets/theme.js`: the "Forest & Gold" theme. It is a progressive layer that every page loads after its own inline `<style>`. It only adds presentation (section rail, heading ornaments, hero kicker, brand tagline, current-nav highlighting) and must not rewrite copy or remove markup.
- Media: `.webp` images at the root and in `venue/` (venue photos) and `aap/` (Bamboo Arcadia). Videos are `av*.mp4`, the reels in `rv/`, and `SetupVideo.webm` (~94 MB).
- SEO and AI discovery files: `sitemap.xml`, `robots.txt` (explicitly allows AI crawlers), `llms.txt` (a short index) and `llms-full.txt` (full facts, policies and FAQs).

## Page anatomy and conventions

Nothing is templated. The nav, footer, floating WhatsApp/call buttons and Google Analytics snippet are copy-pasted into every page. **A change to a shared element has to be made in every `.html` file.** Use `grep -l` to find all the copies and edit each one. Each page customizes its WhatsApp CTA text and footer tagline, so keep those per-page differences.

Each page's `<head>` follows this order:
1. `<title>`, `description` and `keywords` meta, then a `canonical` link to `https://arekas.in/<file>.html`
2. Open Graph and Twitter tags (`og:image` is usually `https://arekas.in/group-11.webp`)
3. Geo meta (`13.1149;77.5499`)
4. JSON-LD blocks: `Organization`, `BreadcrumbList` and a page-specific type (`EventVenue`, `FAQPage`, `Offer`, …)

When you add or rename a page:
- Give it a unique title, description and canonical URL, plus the JSON-LD blocks listed above.
- Add it to `sitemap.xml` and to `llms.txt`, and to `llms-full.txt` if it adds facts.
- Link it from the nav or footer on the other pages as needed. There is no `events.html`, so don't link to it.

## Keep facts consistent

Several places repeat the same business facts: page copy, the JSON-LD blocks, `llms.txt`, `llms-full.txt` and the FAQ (`faq.html`). These facts include prices (e.g. weddings from ₹1,80,000), guest capacity (up to 500), the phone number (+91-8951126633), the email address (arekas.arena@gmail.com), the address and the cancellation policy. When one of these changes, update every occurrence.

## Gotchas

- Videos (`*.mp4`, `*.webm`) are stored in Git LFS (see `.gitattributes`). Anyone who clones the repo needs `git lfs install`, or they get pointer files instead of videos. Note that GitHub Pages does not serve LFS files, so the videos need a host that does, such as Netlify, Vercel or Cloudflare Pages with LFS enabled.
- Some filenames contain spaces (`group 14.webp`, `rv/Reel 1.mp4`). Quote them in shell commands and URL-encode them in `src` attributes.
