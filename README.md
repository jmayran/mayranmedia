# mayranmedia.com

Static site for Mayran Media, served by GitHub Pages from the `main` branch.

This repository is public because the pages it serves have to be publicly
reachable — both app stores and AdMob fetch them. It contains no game source;
Sliceball lives in its own private repository.

## Layout

| Path | Purpose |
| --- | --- |
| `index.html` | Landing page |
| `sliceball/` | Sliceball product page |
| `sliceball/privacy/` | Privacy policy — **required** by the App Store and Google Play |
| `sliceball/support/` | Support page — the App Store **requires** a support URL to submit |
| `app-ads.txt` | Declares AdMob as an authorised seller of this publisher's inventory |
| `style.css` | Shared stylesheet |

Plain HTML and CSS, no build step and no dependencies. Edit a file, commit,
and GitHub Pages redeploys within about a minute.

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
