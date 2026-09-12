# mayranmedia.com

Static site for Mayran Media, served by GitHub Pages from the `main` branch.

This repository is public because the pages it serves have to be publicly
reachable — both app stores and AdMob fetch them. It contains no game source
or build assets; Sliceball lives in its own private Unity project.

## Layout

| Path | Purpose |
| --- | --- |
| `index.html` | Studio landing page |
| `tokens.css` | Shared design tokens (colors, type, spacing) used by every page |
| `style.css` | Shared component styles, built on `tokens.css` |
| `script.js` | Shared scroll-reveal / video behavior, loaded with `defer` |
| `sliceball/` | Sliceball product page and its `assets/` (screenshots, gameplay clips) |
| `sliceball/privacy/` | Privacy policy — **required** by the App Store and Google Play |
| `sliceball/support/` | Support page — the App Store **requires** a support URL to submit |
| `app-ads.txt` | Declares AdMob as an authorised seller of this publisher's inventory |
| `DESIGN-SPEC.md` | Design decision log — tokens, components, and the history of what was tried and why. Keep it current as the site changes, not just at launch. |

Plain HTML, CSS, and JS — no build step, no dependencies, no external
scripts or trackers. Edit a file, commit, and GitHub Pages redeploys within
about a minute.

## Security baseline

Every page's `<head>` carries a meta-tag Content Security Policy
(`default-src 'self'`, no external sources). This is the strongest
protection achievable in plain HTML — GitHub Pages cannot serve custom HTTP
response headers on any plan, even on a custom domain with HTTPS enforced,
so there is no real HSTS, `X-Frame-Options`, or `Permissions-Policy` at the
platform level. If header-level hardening is ever needed, the standard fix
is putting the domain behind Cloudflare's free tier as a DNS-level reverse
proxy in front of GitHub Pages (not a hosting move).

## app-ads.txt

Must stay at the domain root (`https://mayranmedia.com/app-ads.txt`) and the
domain must match the developer website declared in the store listings, or
crawlers will not associate it with the apps. Google can take up to 7 days to
pick up changes, and will only crawl once the apps are live and serving.

## Custom domain

`mayranmedia.com` is registered through Wix, which also hosts its DNS. Pointing
it here needs four A records at the apex plus a `www` CNAME; the `CNAME` file in
this repository must not be added until those records resolve, because it makes
Pages redirect `jmayran.github.io` to the custom domain.

## Email

`privacy@`, `support@`, and `hello@` are handled by iCloud+ Custom Email Domain,
not by anything in this repository.
