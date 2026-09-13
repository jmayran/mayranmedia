# Mayran Media — Design Spec (v1)

This is the contract for everyone building on this site after this pass:
the Sliceball product page, `sliceball/privacy/`, `sliceball/support/`, and
any future game's page. Follow it and new pages will look like they came
from the same designer with zero coordination. It documents exactly what
exists in `tokens.css`, `style.css`, `script.js` and `index.html` — nothing
here is aspirational.

## Philosophy

Apple-style restraint: mostly calm, static typography and layout, ONE
well-executed animated moment (the Sliceball scene on the homepage card),
not motion on every element. Monochrome UI plus exactly one accent color
(green). Zero build step, zero dependencies — plain HTML/CSS/vanilla JS
only, no frameworks, no CDNs, no icon fonts. Every new page should load
only `tokens.css`, `style.css`, and (if it needs scroll reveal)
`script.js` — nothing else.

**The site always renders in the light theme, regardless of the visitor's
OS setting.** This was a deliberate call (not a bug or an oversight): a
bright, white-by-default page reads as more inviting, closer to how
apple.com's own product pages present — see "Color tokens" below for the
mechanism. The Sliceball page's hero also deliberately carries no visual
mockup at all now — just the headline, subhead and CTAs — because the
page's one big visual moment is the real gameplay video in `#showcase`
just below it; see that section for why a second, competing visual
(an earlier CSS-drawn abstract scene) was removed from the hero.

**One deliberate exception:** a game's own dedicated page may use real,
optimized local screenshot files (`.webp`, no CDN, no build step) once
the game has them — see `.showcase` below. This does NOT relax the
`.app-card` rule on the homepage (still abstract-only pre-launch); it
only applies to a game's own page, where showing the real thing is the
point.

## Files

| File | Purpose |
|---|---|
| `tokens.css` | All design tokens (custom properties). Load first. |
| `style.css` | Reset, base type, layout primitives, shared components (header, footer, buttons, badges, `.app-card`, `.reveal`, hero). Load second. |
| `script.js` | IntersectionObserver wiring for `.reveal`. Nothing else lives here — keep it that way. |
| `index.html` | Homepage. Also the reference implementation for every pattern below. |

A new page (e.g. `sliceball/index.html`) should link `../tokens.css`,
`../style.css`, `../script.js` (adjust relative paths) and reuse
`.site-header`/`.site-footer` markup verbatim from `index.html` so nav and
branding stay identical site-wide. It must also copy the small
synchronous (not `defer`) inline `<script>document.documentElement.classList.add("js")</script>`
that every page currently has right after the viewport `<meta>` tag — see
the `.reveal` section below for why. Skipping it means every `.reveal`
element on that page silently never appears at all (it stays at its
`html.js`-gated hidden state forever, since nothing ever adds the `js`
class) — this is easy to forget and easy to miss visually if you always
test with JS enabled, so double-check it's present on any new page.

## Color tokens

Defined in `tokens.css` under `:root`. **The site forces the light
palette always — there is no dark-mode override anymore.** An earlier
version of `tokens.css` had a `@media (prefers-color-scheme: dark) {
:root {...} }` block redefining every token below for visitors with OS
dark mode on; that block was removed outright (Jonathan's explicit call:
he wants the page bright and inviting, like an apple.com product page,
regardless of the visitor's system setting). `:root` also sets
`color-scheme: light;` so native form controls and scrollbars stay light
too, and every page's `<meta name="theme-color">` is a single
unconditional `#ffffff` tag (previously two conditional light/dark tags)
so mobile browser chrome matches. **If dark mode is ever wanted back**,
the removed override block's exact values are recoverable from git
history — `tokens.css` is the single place they'd need to return to;
don't reintroduce them piecemeal elsewhere.

Never hardcode a hex color in a stylesheet or inline style — reference
the token instead, even for a color that "matches" one already in
`tokens.css` — that keeps every color change a one-line edit to
`tokens.css` instead of a find-and-replace.

| Token | Value | Use for |
|---|---|---|
| `--color-bg` | `#ffffff` | Page background, badge fill |
| `--color-bg-elevated` | `#f5f5f7` | Cards, header/footer surfaces |
| `--color-bg-overlay` | `rgba(255,255,255,.8)` | Sticky header (with `backdrop-filter`) |
| `--color-text` | `#1d1d1f` | Primary text |
| `--color-text-secondary` | `#6e6e73` | Meta/secondary text (5.07:1 on bg) |
| `--color-border` | `rgba(0,0,0,.1)` | Hairline dividers |
| `--color-border-strong` | `rgba(0,0,0,.45)` | Card borders, hover states, AND any component boundary that must independently clear WCAG 3:1 non-text contrast (`.btn-secondary`, `.badge`) — measured ≥3.3:1 against both `--color-bg` and `--color-bg-elevated` |
| `--color-accent` | `#14663a` | **The** one accent — links, CTAs, badges, focus ring |
| `--color-accent-soft` | `rgba(20,102,58,.1)` | Decorative fills ONLY — never behind text (see note below). Also used for the `.hero`/`.showcase` ambient background glow — see that section. |
| `--color-on-accent` | `#ffffff` | Text/icons placed on a solid `--color-accent` surface |
| `--color-focus-ring` | `#14663a` | Alias of `--color-accent`, used by `:focus-visible` |
| `--shadow-color` | `rgba(0,0,0,.3)` | Elevation `box-shadow`s (`.app-card:hover`, `.showcase__video-card`) — never hardcode a shadow color |

**Why `--color-on-accent` is its own token, not `var(--color-bg)`:** they
happen to resolve to the same white today, but they mean conceptually
different things (text-on-accent vs. page background) — a future change
to one should not silently break the other. Use `--color-on-accent`
explicitly wherever text sits on a solid accent fill.

**Why `--color-accent-soft` is decorative-only:** measured contrast of
accent-colored text against a `--color-accent-soft`-tinted card
background does not clear AA. Use it for non-text decoration (the
Sliceball ball's glow ring, the subtle radial wash in
`.app-card__visual`, the hero/showcase ambient glow) — never as a fill
sitting behind `--color-accent` (or any) text. The `.badge` component
fills with `--color-bg` instead for exactly this reason — see its
section below.

All pairings actually used in this pass were verified with real relative-
luminance contrast math (not eyeballed): body text ≥16:1, secondary text
≥5:1, accent-vs-background ≥6.6:1, all comfortably clearing the 4.5:1
(body) / 3:1 (large text, UI borders) WCAG AA bars.

## Spacing scale

4px-rooted. Use these for every margin/padding/gap instead of a raw
`rem`/`px` value — consistent rhythm is the whole point.

`--space-3xs` 4px · `--space-2xs` 8px · `--space-xs` 12px · `--space-sm`
16px · `--space-md` 24px · `--space-lg` 32px · `--space-xl` 48px ·
`--space-2xl` 64px · `--space-3xl` 96px · `--space-section`
`clamp(4rem, 3rem + 5vw, 8rem)` — the fluid vertical gap between major
page sections (applied via `.section`'s `padding-block`).

## Type scale

Fluid, `clamp()`-based, two families:

- `--font-display` — for headlines (`h1`–`h4`, card titles).
- `--font-text` — for body copy, nav, buttons, labels.

Both resolve to the system stack (`-apple-system, "SF Pro Display"/"SF Pro
Text", system-ui, sans-serif`) — no webfont ever loads.

**Display tier** (confident, big): `--text-display-1` (hero H1, ~40→76px),
`--text-display-2` (section H2, ~32→52px), `--text-display-3` (card/H3
titles, ~22→30px).

**Text tier** (calm, readable): `--text-body-lg` (lead paragraphs,
~18→22px), `--text-body` (default copy, ~16→18px — this is also `body`'s
base size), `--text-small` (nav, meta, badges, captions, ~13→15px).

Line-height tokens: `--leading-tight` (1.08, headlines), `--leading-snug`
(1.3, lead paragraphs), `--leading-normal` (1.6, body copy) — `h1`–`h4`
and `body` already apply these; only reach for the token directly on a
custom element.

`h1`/`h2`/`h3` map straight to `--text-display-1`/`-2`/`-3` in `style.css`
— just use a real heading tag and get the right size for free. The
`.text-display-1`/`.text-display-2` utility classes exist for the rare
case a non-heading element needs display-scale size (e.g. a `<p>` used as
a big stat number).

## Layout primitives

- `.container` — `max-width: var(--container-max)` (1120px), centered,
  fluid inline padding. Every section's direct content wrapper.
- `.section` — fluid vertical rhythm via `--space-section`. Wrap each
  homepage-style section's content in `<section class="section" id="...">`.
- `.section-header` — centered intro block (eyebrow + H2 + optional lead),
  capped at `--measure` and centered. Use for the top of any section.
- `.measure` — `max-width: var(--measure)` (640px). Apply to any freestanding
  block of body copy so line length stays readable; don't let paragraphs
  run the full `.container` width.
- `.eyebrow` — small uppercase accent-colored kicker label above a heading.

## Buttons & links

- `.btn` — base pill button, 44px min-height (touch target), `--text-small`,
  weight 600. Never used bare — always with a variant:
  - `.btn-primary` — solid `--color-accent` fill, `--color-on-accent` text.
    Use sparingly (one per view, the single most important action).
  - `.btn-secondary` — outlined, transparent fill. **This is the default**
    — reach for it far more often than primary.
- `.link-cta` — inline text + trailing arrow (`<span class="arrow">→</span>`),
  accent-colored, `--text-small`, weight 600. Two usage patterns:
  1. As a real `<a class="link-cta" href="...">` when it's a standalone link.
  2. As a decorative `<span class="link-cta" aria-hidden="true">` when it
     sits inside an element that is *already* a link via the stretched-link
     pattern (see `.app-card` below) — never nest a real `<a>` inside
     another link's clickable area.
  `a.link-cta` (the real-anchor case only, tag-qualified on purpose) gets
  `min-height: 44px` — a standalone link needs the same touch target as a
  button. The decorative `<span class="link-cta">` case is intentionally
  NOT given that min-height: it isn't itself interactive (the whole card
  is already the click target via the stretched-link pattern), so forcing
  44px there would just add unwanted height/spacing inside cards for no
  accessibility benefit.

## Badges

- `.badge` — pill chip, `--color-bg` fill (not a tinted fill — see the
  accent-soft contrast note above), `--color-border-strong` border,
  `--color-text` text. Generic/neutral badge.
- `.badge--coming-soon` — same shape, `--color-accent` text + border.
  Use for any not-yet-released product or platform. Once a product
  ships, swap to a plain `.badge` (or drop the badge) rather than
  inventing a new class.

**Launch state as of 2026-09-13 (Android live, iOS still in review):**
the homepage `.app-card` carries a plain `.badge` reading "Out now" with
`.app-card__platforms` reading "Android · iOS coming soon". The Sliceball
hero's `.hero__actions` holds one `.btn-primary` linking straight to the
Play listing (`https://play.google.com/store/apps/details?id=com.mayranmedia.sliceball`,
plain text "Get it on Google Play" — no external badge artwork, per the
no-external-assets rule) beside a `.badge--coming-soon` reading
"App Store · Coming soon". `.hero__actions` gained `align-items: center`
for exactly this mix, since a 44px button and a 28px badge would
otherwise stretch to the same height and the badge would read as a
second button. **When iOS is approved:** replace that badge with a
second link to the App Store listing as a `.btn-secondary` (one primary
per view — Google Play keeps primary only because it shipped first; it
is fine to make them both secondary), change the card's platforms text
to "iOS · Android", and update the footer line and both meta
descriptions, which currently read "out now on Android, coming soon to
iOS" on every page.

## `.reveal` — scroll reveal utility

Add `class="reveal"` to any element that should fade + slide up
(`translateY(var(--reveal-distance))` → `none`, opacity 0 → 1) the first
time it scrolls into view. `script.js` observes every `.reveal` element on
the page with a single shared `IntersectionObserver` and adds
`.is-visible` once, permanently, as soon as any pixel of it comes within
300px of the bottom of the viewport (see the timing note below).

**Group + stagger:** wrap a set of sibling `.reveal` elements in a parent
with `class="reveal-group"` to stagger their transition-delay (90ms steps,
`.reveal-group > .reveal:nth-child(1..5)`; add more `nth-child` rules in
`style.css` if a group ever needs a 6th staggered child).

**Restraint rule:** don't put `.reveal` on every individual element in a
section — that's "animation on every element," which this design
explicitly avoids. Prefer one `.reveal` on a section's intro block, or one
on a small, deliberate `.reveal-group` (like the hero), over decorating
a whole grid item-by-item. In this pass, the games grid reveals as a
single card (there's only one), and the contact grid reveals as one block,
not card-by-card — follow that pattern as more cards are added, i.e. put
`.reveal` on `.games-grid` itself (or stagger only the first few cards) rather
than adding it to every `.app-card`.

**`.reveal`'s default (no media query at all) is fully visible — and stays
that way if JS never runs.** An earlier version of this rule set
`opacity: 0` unconditionally and relied entirely on
`prefers-reduced-motion: reduce` to restore visibility for the one group
of visitors CSS alone can detect. That left a gap: `prefers-reduced-motion`
only ever reports an OS setting, never whether `script.js` actually ran —
so a visitor with motion allowed (the default "no preference" setting,
i.e. most visitors) whose JS was blocked or failed to load got a page
full of permanently invisible content, since only `script.js`'s
IntersectionObserver ever added `.is-visible`.

A CSS media query genuinely cannot close that gap on its own — motion
preference and script availability are two independent, unrelated
signals. The fix is the standard progressive-enhancement pattern for
exactly this problem: every page's `<head>` runs one tiny **synchronous**
(not `defer`) inline `<script>` — `document.documentElement.classList.add("js")`
— before first paint, and the hidden starting state is scoped to
`html.js` on top of the motion check:

```css
.reveal { opacity: 1; transform: none; } /* unconditional default */

@media (prefers-reduced-motion: no-preference) {
  html.js .reveal { opacity: 0; transform: translateY(var(--reveal-distance)); transition: ...; }
  html.js .reveal.is-visible { opacity: 1; transform: none; }
}
```

Now `.reveal` is only ever hidden when BOTH motion is allowed AND that
inline script actually ran (proving JS works) — if it didn't run, `html`
never gets the `js` class, `html.js .reveal` never matches, and the
element sits at its visible default forever. `script.js` (the deferred
external file that does the actual scroll-triggered reveal) still also
checks `matchMedia('(prefers-reduced-motion: reduce)')` directly and
short-circuits to `.is-visible` for reduced-motion visitors, redundant
with the CSS but harmless.

**Copy the same shape for any future JS-driven visual state** — not just
`.reveal` — whenever a media query alone can't tell you if the JS that's
supposed to flip that state will actually run: unconditional visible/safe
default, then gate the "waiting on JS" state behind `html.js` (plus
whatever media query is also relevant). A purely CSS-driven animation
(like the Sliceball scene below, which needs no JS at all — the
`@keyframes` themselves drive every visual state) only needs the
motion-based media query, no `html.js` gate.

**Timing (retuned 2026-09-13):** the first cut observed with
`threshold: 0.15` and `rootMargin: "0px 0px -40px 0px"`, fading over
`--duration-slow` (800ms). That combination meant a section had to be
15% inside an already-shrunk viewport before its fade even *started*,
then took most of a second to finish — so at normal scrolling speed the
reader arrived at a section before it had faded in and saw a blank or
ghosted band. Three changes, all in the direction of "the content is
there before you get to it":

- `script.js` observes with `threshold: 0` and a **positive** bottom
  `rootMargin` of `300px`, so the fade starts ~300px before the section
  scrolls into view.
- `tokens.css` adds `--duration-reveal: 350ms` (0ms under reduced
  motion) and `.reveal` transitions on that instead of
  `--duration-slow`. 800ms stays reserved for the ambient glows and
  other things that are meant to feel slow; a scroll reveal should
  finish before you can notice it.
- `script.js` also runs a `revealInView()` safety net immediately and
  again on `window.load`: anything already at or near the viewport gets
  `.is-visible` directly, without waiting on an observer callback. The
  `html.js` gate above covers "JS never ran"; this covers the other
  failure — JS ran, so content is hidden, but the observer callback
  never arrives (a restored scroll position, a `#hash` deep link, a tab
  that loaded while hidden). Neither case can leave a section
  permanently invisible now.

**Verifying this in an automated browser is a trap.** Both Claude in
Chrome and the desktop browser pane report `innerHeight: 0`, so nothing
can ever intersect the viewport, the observer never fires, and every
`.reveal` measures at `opacity: 0` — indistinguishable from a real bug.
Two sessions chased that. If a reveal looks broken in automation, create
a fresh `IntersectionObserver` on the page: if it also stays silent, the
tab is the problem. Real verification is headless Chromium (Playwright)
against a clone of the repo.

## Storefront hero (`.hero--storefront`, homepage only)

Chosen 2026-09-13 from three rendered directions (a centered "quiet
catalog", this "storefront", and a "help-first" split with an app
finder panel). Jonathan picked storefront so the newest app is the first
thing a visitor sees.

**The hero features exactly ONE app: the most recently shipped one.**
`.hero__content` becomes a two-column grid — `.hero__copy` (eyebrow, H1,
lead, `.hero__actions`) on the left, `.hero__featured` holding a single
`.app-card` on the right — collapsing to one column under 800px. The
primary button is that app's direct store link ("Get Sliceball on Google
Play"); the secondary is "Get help" → `#help`. **When a new app ships,
replace the card and the primary button with the new app, and move the
previous app's card into the `#apps` grid** — never put two apps in the
hero. The hero is a spotlight, the grid is the complete catalog.

**The `#apps` "All apps" grid is dormant while only one app exists.**
With a single app it would show the hero card a second time, which
Jonathan explicitly did not want (2026-09-13). The whole section is kept
in `index.html` as an HTML comment (with inner comment markers escaped
as `<!~~ ~~>`), and the nav/hub "Apps" links point at `#top` for now.
When the second app ships: move app one's card into the grid, put app
two in the hero, uncomment the section, and point "Apps" back at
`#apps`. The footer's Apps column and both hubs list every app
regardless.

Wording is "apps", not "games", everywhere the studio is described
(Jonathan's call, 2026-09-13, so a future non-game fits without a copy
pass). The `.games-grid` class name is kept for stability. Each card's
`.badge` is now a **category label** ("Game" today; "Utility" etc. later)
rather than a launch-state badge — launch state lives in
`.app-card__platforms` ("Google Play · App Store soon").

## Help strip (`.help-strip`, homepage only)

A slim hairline-bordered band right under the hero: one sentence
("Need a hand with an app?") and `.help-strip__links`, a `ul[class]` of
real `a.link-cta`s — Support hub, Privacy hub, `hello@`. It exists so
help is reachable above the fold without turning the homepage into a
help desk. Not a `.section` (no `--space-section` padding); don't give
it a fill.

## Hub pages (`/support/`, `/privacy/`)

Site-level index pages following the "hybrid" model Jonathan approved
2026-09-13 (what multi-app publishers do, minus a shared policy): each
hub has an intro, a `.contact-card` "Need a person?" callout with the
matching studio email, and a **"By app"** `.contact-grid` with one
`.contact-card` per app linking to that app's own detailed page. The
privacy hub also carries one `.legal-content` block stating what is true
of every app (no accounts, nothing sent to Mayran Media) — keep that
paragraph truthful when a new app changes it. **Per-app pages
(`sliceball/support/`, `sliceball/privacy/`) stay exactly where they
are** — those URLs are filed with both stores and GitHub Pages cannot
redirect. Adding an app = one card on each hub, one row in the footer's
Apps column, one `.app-card` in the grid, and (if newest) the hero swap.

Every hub reuses existing components only (`.contact-card`,
`.contact-grid`, `.legal-content`, `.measure`); no hub-specific CSS.

## `.app-card` — reusable product-card component

The card for the "Our Games" grid. Built and tested with exactly one
card (Sliceball) but intended to scale: dropping in a second, third,
fourth game is copy-pasting the `<article class="app-card">` block in
`index.html` with new content — no CSS or grid changes required.

**Grid:** `.games-grid` — CSS grid,
`repeat(auto-fit, minmax(min(300px, 100%), 400px))`, centered
(`justify-content: center`). One card centers itself at ~400px; many
cards wrap into a centered, responsive multi-column grid. Don't change
this to `1fr` columns — that's what stretches a single card too wide.
The `min(300px, 100%)` floor (not a bare `300px`) matters: a bare `300px`
minimum track overflows the viewport horizontally below ~340px wide,
since `.container`'s padding floor leaves less than 300px of content
width there — `min(300px, 100%)` lets the track shrink to whatever room
is actually available instead of forcing a scrollbar. Keep this pattern
for any future grid that has a fixed-px minmax floor.

`.games-grid` (the grid itself, NOT each individual `.app-card`) carries
`.reveal` — see the restraint rule above. Don't put `.reveal` back on the
`<article>`.

**Required markup shape** (see `index.html` for the live example):

```html
<article class="app-card">
  <div class="app-card__visual">
    <!-- game-specific abstract visual goes here, e.g. .sliceball-scene -->
  </div>
  <div class="app-card__body">
    <div class="app-card__meta">
      <span class="badge badge--coming-soon">Coming soon</span>
      <span class="app-card__platforms">iOS · Android</span>
    </div>
    <h3 class="app-card__title">
      <a class="app-card__link" href="gamename/">Game Name</a>
    </h3>
    <p class="app-card__description">One or two sentences, real copy only.</p>
    <div class="app-card__footer">
      <span class="link-cta" aria-hidden="true">Learn more <span class="arrow">→</span></span>
    </div>
  </div>
</article>
```

**Rules for every future card:**
- Exactly **one** real `<a>` per card — the title link
  (`.app-card__link`). Its `::after` is stretched (`position:absolute;
  inset:0`) against `.app-card` (the nearest `position:relative`
  ancestor), so the *entire card* is clickable, not just the title text.
  Do not add a second real link (e.g. don't also make the "Learn more"
  span a link) — that breaks the single-accessible-link-per-card contract
  and screen-reader users would hear the destination announced twice.
- `.app-card__visual` is a flex-centered `aspect-ratio: 4/3` box with a
  very subtle accent-tinted radial wash (`--color-accent-soft`, decorative
  only, not behind text) — put the game's abstract visual inside it,
  sized to fit (see the Sliceball scene for a working example at
  `width: min(220px, 100%)`).
- **Shipped app: a real screenshot.** Since 2026-09-13 the Sliceball
  card's visual is `.app-card__shot` — the `.showcase__video-card` glass
  ring copied as-is, stretched to the 4:3 box's height with the image's
  own `aspect-ratio` (store shots are 900x1955) so nothing crops — holding
  one of the privacy-screened store screenshots already in
  `sliceball/assets/showcase/` (`showcase-03-slicing.webp`, the action
  shot). No new asset pipeline: reuse the gallery's webp files.
- **Unreleased app: no real screenshots/video** on this compact card —
  build an abstract CSS-only visual instead (no external image/video
  files, no CDN) and swap to `.app-card__shot` at launch. The
  `.sliceball-scene` CSS stays in `style.css` as the worked example. Give it its own class namespace, e.g.
  `.puzzlename-scene`, following the `.sliceball-scene` pattern below,
  and follow the reduced-motion pattern (static default, animation added
  only under `no-preference`). This is specifically about the small
  homepage card — a game's own dedicated page is a different context and
  may use real screenshots once captured; see `.showcase` below.
- `.app-card__platforms` is plain text ("iOS · Android") — no icon fonts.
- Badge: `.badge--coming-soon` pre-launch; swap to a plain `.badge` (or
  remove it) once real store links exist.

## `.sliceball-scene` — Sliceball's abstract visual

Pure CSS (no images, no SVG file, no icon font): a phone silhouette
(`.sliceball-scene__phone`) containing a card stack
(`.sliceball-scene__stack` > three `.sliceball-scene__card` spans, tapered
widths) and a ball (`.sliceball-scene__ball`) above a floor line
(`.sliceball-scene__floor`).

Default (unconditional, no media query) is a **static mid-slice frame** —
top card at 40% opacity/scaled/offset, ball translated down 14px — this
doubles as the reduced-motion fallback. Under
`@media (prefers-reduced-motion: no-preference)`, three `@keyframes`
(`sliceball-drop`, `sliceball-slice-1`, `sliceball-slice-2`) animate
`infinite alternate` on a shared 7s timeline: the ball drops one level
each time a card fades/slides away, then the whole thing reverses
smoothly and repeats. This is the site's signature animated moment —
don't add more animated flourishes elsewhere; the hero's subtle
`view-timeline` parallax (progressively enhanced, `@supports`-guarded,
nothing depends on it) is the only other one, and both are intentionally
the ONLY two motion moments on the page.

**Do not reuse `.sliceball-scene` classes for a different game.** Each
future game gets its own `.<gamename>-scene` namespace built the same
way (phone silhouette + abstracted mechanic + static-first/animate-second
reduced-motion pattern), sized to fit inside `.app-card__visual` the same
way.

## `.showcase` — real gameplay video (game page only, not the homepage card)

Unlike `.sliceball-scene` (abstract, pre-launch, lives on the homepage
card), `.showcase` is Sliceball's *second* visual on its own dedicated
page — this section's whole point is showing the real, playable game.
A future game's page gets its own `.<gamename>-showcase`-prefixed copy
of this pattern, not a shared class — see the "don't reuse scene
classes" rule above; the same reasoning applies here.

**History, briefly, because it explains why the markup looks the way it
does:** this section went through four real designs in this pass, each
one a direct response to Jonathan looking at the last one:
1. A scroll-scrubbed crossfade through six screenshots inside a
   CSS-drawn phone chassis (`view-timeline` + six `@keyframes`).
   Jonathan felt the image-to-image motion looked "robotic."
2. Swapped the six crossfading images for a real, muted/looping/
   autoplaying `<video>` of actual Simulator gameplay — but kept it
   inside the same CSS phone chassis (bezel, notch, side buttons, glass
   highlight). Jonathan said to get rid of the mockup phone too: a
   hand-drawn fake frame around genuine footage read as *more* like a
   mockup than the plain screenshots it replaced, not less.
3. Dropped the chassis entirely — the video sat by itself in a plain
   rounded card, nothing pretending to be a physical device.
4. **Current design:** Jonathan asked to bring a "real phone" frame back
   after all. Rather than guess, three genuinely different options were
   mocked up side by side (as their own review artifact, not in this
   codebase) and shown to him before touching this file: (a) the plain
   card from step 3, kept as a baseline; (b) a refined photorealistic-
   style device bezel (metal-edge gradient, soft pill cutout, one
   diagonal glass sheen — deliberately not the illustrated step-2
   chassis, no drawn seams or glossy buttons); (c) a minimal glass edge —
   just a thin translucent ring and a soft floating shadow, no notch, no
   buttons, no claim to a specific phone model. Jonathan picked (c). See
   `.showcase__video-card` below for the implementation.

   **Reconfirmed, locked in:** revisited later when Jonathan was deciding
   between (a) and (c) again for a different reason — he specifically
   wants the showcase to read as generic mobile gameplay, not tied to
   iPhone or Android. (c)'s complete lack of device-specific chrome (no
   notch/Dynamic Island shape, no button cutouts) already made it the
   platform-neutral choice — it still reads as "a real phone playing
   this" without implying a brand, whereas (a) is neutral only because it
   doesn't imply "phone" at all. **This is the final treatment — don't
   revisit it again without a real reason**, and if a future device card
   ever needs the same treatment, copy `.showcase__video-card` as-is
   rather than reopening the frame-style question.

**Markup** (see `sliceball/index.html`, `#showcase` section — this
example shows one device card; the live page has two side by side, see
"Two-device showcase" below for the wrapping `.showcase__device` +
label markup):

```html
<div class="showcase__stage reveal">
  <div class="showcase__device">
    <div class="showcase__video-card">
      <video class="showcase__video" autoplay muted loop playsinline
             poster="assets/showcase/gameplay-iphone-poster.webp"
             aria-label="Real Sliceball gameplay on iPhone: slicing down through a stack and clearing the level.">
        <source src="assets/showcase/gameplay-iphone.mp4" type="video/mp4">
      </video>
      <button type="button" class="showcase__video-toggle" data-state="playing"
              aria-pressed="true" aria-label="Pause iPhone gameplay video">
        <span class="showcase__video-toggle-icon showcase__video-toggle-icon--pause" aria-hidden="true"></span>
        <span class="showcase__video-toggle-icon showcase__video-toggle-icon--play" aria-hidden="true"></span>
      </button>
    </div>
  </div>
  <!-- a second .showcase__device for iPad sits alongside this one -->
</div>
```

- `.showcase__video-card` — the minimal glass edge, per the history
  note above. `position: relative`, `width: min(220px, 42vw)` (sized
  for two side by side; was `min(300px, 78vw)` back when there was only
  one), `padding: 5px` (this padding **is** the ring's thickness — the
  video sits inset from it; don't remove it without rethinking the
  whole ring), `border-radius: var(--radius-lg)`, `overflow: hidden`, a
  translucent `linear-gradient(160deg, rgba(255,255,255,.55),
  rgba(255,255,255,.05))` background, a `1px solid var(--color-border)`
  edge, and a soft `box-shadow` (an `inset` highlight plus the standard
  `0 30px 60px -30px var(--shadow-color)` floor shadow) — deliberately
  no notch, no side buttons, nothing claiming a specific device model.
  `aspect-ratio` is set per-card to that card's own recording's native
  ratio (iPhone: `498/1080`; iPad: `720/960` — see
  `.showcase__device:nth-child(n) .showcase__video-card` in
  `style.css`) — match this to whatever a future recording's actual
  dimensions are, don't assume either existing ratio applies to a third
  device; a mismatched ratio forces `object-fit: cover` to crop the
  footage, which is exactly the bug this design avoids by construction.
- `.showcase__video` — the "screen" inside the ring: `width/height:
  100%`, `object-fit: cover`, `display: block`, its own slightly
  smaller `border-radius: calc(var(--radius-lg) - 5px)` so the ring
  reads as a frame around it, and `background: #000` (a dark backdrop
  before the video's first frame paints — this used to live on
  `.showcase__video-card` back when that element was the screen itself
  rather than the ring around it). `object-fit: cover` is a safety net
  for a future re-recording at a slightly different ratio, not
  something either current recording actually needs cropping from.
- **Asset pipeline**: the iPad recording came from Unity's iOS
  Simulator build (`Builds/iOSSimulator/.../Sliceball.app`, an
  architecture-generic `arm64-simulator` build — installable on any
  booted simulator device), captured via the Simulator's own screen
  recording. The iPhone recording is genuine on-device footage (see
  "Two-device showcase" below). Both were trimmed/compressed with
  `ffmpeg` to a matching `-poster.webp` first-frame poster (shown while
  the video buffers, and to `prefers-reduced-motion: reduce` visitors —
  see below). Follow the same "record on-device or on-Simulator, trim,
  compress, ship a matching poster" recipe for any future game's
  showcase — never a screen-captured desktop Unity Editor session,
  which looks nothing like the real on-device game.
- **Privacy: screen every real-device recording before it ships.** A
  real iPhone screen recording can carry things a Simulator recording
  never would — a Game Center "Signed in as `<name>`" toast, a
  notification banner, a real name in a TestFlight/App Store listing
  screen if the recording starts there. Before trimming any raw
  on-device recording down to a showcase clip, scan the WHOLE thing
  (an `ffmpeg` contact-sheet — tile a grid of thumbnails at 1-4fps — is
  fast and catches this at a glance) for anything identifying, not just
  for a clean action window. This bit Jonathan's real-iPhone recording
  for this pass — see "Two-device showcase" below — and the fix going
  forward is to make this scan a standard step, not a one-off
  after-the-fact catch.
- **Pause control (WCAG 2.2.2)**: `.showcase__video-toggle`, an
  absolutely-positioned circular button bottom-right of the card
  (`rgba(0,0,0,.45)` fill, `var(--radius-full)`), toggles play/pause.
  Required because the video auto-loops indefinitely — any auto-starting
  motion lasting more than 5 seconds needs a visible way to stop it.
  `script.js` wires the click handler and keeps `data-state`/
  `aria-pressed`/`aria-label` in sync via the video's own `play`/`pause`
  events (not a one-time synchronous `video.paused` check at script
  load — that's unreliable because the browser's autoplay start is
  asynchronous relative to script execution).
- **`prefers-reduced-motion` gating**: the HTML `autoplay` attribute
  can't itself be conditioned on a media query, so `script.js` explicitly
  does `video.removeAttribute("autoplay"); video.pause();` when
  `matchMedia("(prefers-reduced-motion: reduce)").matches` — those
  visitors see the static poster image and can press play manually.

**Ambient background glow** — `.showcase::before` (mirroring
`.hero::before`, see the dedicated section below) adds a very subtle
`--color-accent-soft` radial wash behind this section, `position:
relative` on `.showcase` itself to contain it.

**The six screenshots didn't disappear** — they moved out of the phone
chassis and into their own section right below, `.showcase-gallery`
(`id="screens"`): a plain horizontally-swipeable, scroll-snap strip
(`.showcase-gallery__strip { display:flex; overflow-x:auto; scroll-snap-type:x mandatory }`,
each `.showcase-gallery__shot { flex:0 0 auto; width:min(220px,55vw);
aspect-ratio:900/1955; object-fit:cover }`) — the same peek/snap pattern
this page already used elsewhere, reused rather than inventing a new
gallery mechanism. Each `<img>` has its own real, distinct `alt` text
(these are now standalone informative images, not decorative chrome, so
they are NOT `aria-hidden`) — e.g. "The Sliceball main menu", "Gameplay:
a ball dropping onto a card stack". Source screenshots came from the
Unity project's own `StoreAssets/` folder (real App Store/Play Store
marketing shots — never generate placeholder/fake screenshots), resized
to 900px wide and converted to `.webp` at quality 82 with Pillow
(`im.save(path, "WEBP", quality=82, method=6)`); files live at
`sliceball/assets/showcase/showcase-NN-name.webp`. Follow this same
resize+webp recipe, and the same real/distinct-`alt`-text rule, for any
future game's gallery strip.

## Ambient background glow (`.hero::before`, `.showcase::before`)

A very subtle radial-gradient wash sitting behind the hero and the
showcase section, added as part of the "make the page brighter/more
inviting, like apple.com" pass. Both sections get `position: relative`
and a `::before` pseudo-element:

```css
.hero::before, .showcase::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(<shape/size> at <position>, var(--color-accent-soft), transparent <fade%>);
}
```

Deliberately reuses the existing `--color-accent-soft` token (already
used for `.app-card__visual`'s wash) rather than introducing a new
color — same reasoning as everywhere else in this spec: one accent,
referenced everywhere, never a new one-off value. `z-index: -1` plus
`pointer-events: none` keeps it purely decorative — it never intercepts
clicks or appears above real content. The effect is intentionally
subtle (the token itself is only ~10% opacity) — the goal is a soft
glow a visitor feels more than consciously sees, not a visible colored
panel. Any future section that wants this same "soft glow behind a major
moment" treatment should copy this exact pattern (own `::before`, same
token, `position: relative` on the section) rather than inventing a new
gradient recipe.

## Header / footer / nav

- `.site-header` — sticky, translucent (`--color-bg-overlay` +
  `backdrop-filter: blur`), bottom hairline border. Contains `.wordmark`
  (logo, links to `#top`/home) and `.site-nav` (`<ul>` of anchor links —
  homepage: Apps · Support · Privacy · Contact; hubs: Home · Apps · the
  other hub · Contact; app pages keep their own per-app nav).
  Reuse this exact block verbatim on every future page, adjusting the
  `.wordmark` `href` to point at the site root (e.g. `../` from a
  sub-page) and the nav links to match what that page actually has.
- `.wordmark` — `Mayran <span class="accent">Media</span>` — "Mayran" in
  `--color-text`, "Media" in `--color-accent`. This exact two-span pattern
  is the only correct way to render the studio name; never recolor both
  words the same or invert which word is the accent.
- `.site-footer` — columns are now (2026-09-13) wordmark · **Apps** (one
  row per app) · **Help** (Support hub, Privacy hub, Contact) · **Email**
  (the three addresses), identical on every page; the old per-app
  "Sliceball" column is gone. `.footer-grid` (explicit `repeat(4, minmax(0,1fr))`
  equal-width columns — not `auto-fit`, which sized columns unevenly
  depending on leftover space and read as lopsided — collapsing to 2
  columns at 700px and 1 at 420px; `.footer-col` each with an `<h3>`
  label + link list) plus `.footer-bottom` (copyright + one-line note).
  The Studio/Sliceball/Contact link lists are deliberately compact:
  `.footer-col a` uses a 32px (not the site's usual 44px) touch target
  and `.footer-col ul` uses a tight `--space-3xs` (4px) gap — Jonathan
  asked for these columns visually tighter, closer to how apple.com's
  own dense footer reads. 32px still clears WCAG 2.2's 24×24px AA
  minimum target size; the 44px used elsewhere (nav, buttons, contact
  cards) is Apple HIG's stricter recommendation, not an AA requirement,
  so relaxing it here for a secondary, already-large link list is a
  legitimate, deliberate exception to the 44px rule below — don't treat
  it as license to shrink primary interactive elements the same way.
  Column labels are `<h3>`, not `<h4>` — every page's main
  content only goes as deep as `<h2>`/`<h3>` (section headers / card and
  sub-question titles), so `<h3>` is the correct next level for the
  footer and keeps the whole document's heading outline sequential with
  no skipped level. If a future page's content ever goes one level deeper
  (introduces a real `<h4>` inside `.legal-content`, say), re-check
  whether the footer still needs to be `<h3>` or should become `<h4>` to
  stay one step below the deepest heading actually used above it — don't
  just copy `<h3>` blindly once that changes.
- Each page's own entry in its own `.footer-col` link list should point
  at that page with a same-document anchor (`#top`), not a full relative
  path to itself — the extra path works, but causes a needless full page
  reload. `sliceball/index.html` does this by linking its own "Overview"
  row to `#top` (it already has `id="top"` on its hero `<section>`).
  `sliceball/support/index.html` and `sliceball/privacy/index.html`
  follow the same convention: their intro `<section>` carries `id="top"`,
  and their own footer row (`Support`/`Privacy` respectively) links to
  `#top` instead of `../support/`/`../privacy/`. Give any new page's
  first `<section>` `id="top"` and use `#top` for that page's own footer
  entry, for the same reason.
  The footer already links `sliceball/`, `sliceball/support/`,
  `sliceball/privacy/` — those pages must exist at exactly those relative
  paths for the links to resolve once built.

## Contact section

`.contact-grid` (auto-fit cards) of `.contact-card` blocks, each a
`.contact-card__label` (what the address is for) + a real `mailto:` link
styled in `--color-accent`. Real addresses only, always all three, never
invented ones: `hello@mayranmedia.com` (general/press),
`support@mayranmedia.com` (player support), `privacy@mayranmedia.com`
(privacy questions). Reuse this component as-is on the support/privacy
pages if they need a contact block (e.g. privacy page → privacy@ front and
center; support page → support@ front and center).

**Email display text needs a `<wbr>` after the `@`.** The global `body {
overflow-wrap: anywhere }` plus `.contact-card a { word-break:
break-word }` (needed elsewhere for long unbroken strings — see the
Accessibility checklist) combine badly on these specific narrow cards: at
common desktop widths a `.contact-card a` box is only ~254px against
~280px+ needed to fit "hello@mayranmedia.com" on one line, and the browser's
only "wrap anywhere" option is an arbitrary mid-word break (e.g.
"hello@mayranmedia.co" / "m"). Don't fix this by touching the wrap
properties — they're doing real work for other content. Instead every
mailto display string, in both `.contact-card` links and the footer's
email list, is written with an explicit break point:
`hello@<wbr>mayranmedia.com`. `<wbr>` gives the browser a sensible,
designer-chosen wrap point ("hello@" / "mayranmedia.com") that it prefers
over an arbitrary mid-word split, without changing wrap behavior for
anything else. Any new page that lists these addresses (in a
`.contact-card`, a footer, or inline in copy) should use the same
`<wbr>`-after-`@` convention rather than plain email text.

## Links inside `.legal-content` prose

Any plain in-paragraph `<a>` inside `.legal-content` (the privacy/support
pages' body copy — e.g. the Google policy links, or a cross-link like
"see the privacy policy") automatically gets `color: var(--color-accent)`
and an underline via the `.legal-content a` rule in `style.css`. This
exists because the global reset sets `a { color: inherit; text-decoration:
none; }`, and without an override, a plain prose link is visually
indistinguishable from surrounding text — no color, weight, or
underline difference — giving the reader no signal it's clickable. Every
other link pattern on the site (`.link-cta`, `.contact-card a`,
`.footer-col a`, `.site-nav a`) already has an explicit accent treatment;
this rule brings plain in-paragraph links on the legal pages into line
with that. Any future page that adds prose links inside `.legal-content`
gets this for free — don't re-style them individually.

## Accessibility checklist for new pages

- Start every page with a `.skip-link` (`<a class="skip-link" href="#main">Skip to content</a>`) as the very first element in `<body>`, and give the main
  landmark `id="main"`.
- Every interactive element needs a visible `:focus-visible` state — this
  is handled globally in `style.css`, don't override `outline` on a
  specific selector without also providing an equally visible replacement.
- Touch targets ≥44×44px — every nav link, button, and footer/contact link
  already enforces `min-height: 44px`; keep that on any new interactive
  element.
- Respect `prefers-reduced-motion: reduce` for any new animation, using
  the static-default/animate-in-`no-preference`-media-query pattern
  described above — never the inverse (animating by default and trying to
  cancel it under `reduce`).
- Verify any new color pairing's contrast the way this pass did (compute
  actual relative luminance, don't eyeball it) — 4.5:1 for body text, 3:1
  for large text (≥24px, or ≥18.66px bold) and UI component borders.
  `--color-border-strong` is calibrated to clear 3:1 against both
  `--color-bg` and `--color-bg-elevated` in both themes specifically so
  it's safe to use for a border that is the ONLY cue marking a control's
  edge (`.btn-secondary`, `.badge`) — the plain `--color-border` token is
  NOT held to that bar and must not be substituted in for that purpose.
- Any grid/flex track with a fixed-pixel `minmax()` floor (like
  `.games-grid`'s) must let that floor shrink on very narrow viewports —
  wrap it as `minmax(min(Npx, 100%), Mpx)` rather than a bare `minmax(Npx, Mpx)`,
  or it will force horizontal scroll below roughly (`Npx` + the
  `.container` padding it sits inside).
- Long unbroken strings (URLs, tokens, etc.) in body copy are already
  handled globally — `body` sets `overflow-wrap: anywhere`, inherited
  everywhere — so you shouldn't need a per-element fix, but keep it in
  mind if you ever reset `overflow-wrap` back to `normal` on something.

## Current status / what's still ahead

`sliceball/index.html`, `sliceball/privacy/index.html`, and
`sliceball/support/index.html` all exist now and are live at the paths
`index.html`'s footer/nav already pointed at. The Sliceball page has
gone through several rounds of real-content passes since the v1 layout
this spec originally described (see `.showcase`'s history note above)
— it's no longer a placeholder page.

**Two-device showcase, built:** `.showcase__stage` now holds two
`.showcase__device` cards side by side (iPhone + iPad), each with its
own labeled `.showcase__video-card` — see `.showcase`'s markup example
above and `.showcase__stage`/`.showcase__device`
in `style.css`. The iPad card (`gameplay-ipad.mp4`,
`aspect-ratio: 720/960`) is a fresh iPad Simulator recording, genuinely
at default state (`CASH $0`, `Level 1`, no shop purchases) — this is
what Jonathan asked for when he flagged that a different clip looked
"upgraded": the default ball and note-card stack, not a purchased skin.
`script.js`'s video/pause logic loops over every `.showcase__video-card`
on the page independently (see its own top comment), so a future third
device card needs no JS change.

The iPhone card's asset went through its own incident worth recording
in full, because it changes what this clip is FOR:

1. The original iPhone recording was genuine footage from an actual
   iPhone (not a Simulator) — screen-recorded on the device itself and
   transferred over, the most literal possible answer to Jonathan's
   original ask for this to look like "a real phone playing the game."
   It showed `CASH $10`, `Level 5`, and a purchased ball/stack skin —
   Jonathan pointed out this was an upgraded/purchased look, not the
   default new-player state the showcase should lead with.
2. Separately, a full-recording scan (see the "Privacy" note above,
   added *because of* this) turned up a Game Center "Signed in as
   `<name>`" toast baked into the raw footage from roughly t=2.75s to
   t=5.75s — Jonathan's real Apple ID / Game Center handle, visible in
   the clip that had already been trimmed and used. Every other raw
   recording used on this page (the iPad Simulator clip, the six
   `StoreAssets/` screenshots) was checked too and came back clean —
   this was specific to the on-device recording.
3. **Fix applied:** the exposed clip was re-trimmed to start at t=6.2s
   (safely after the toast is gone, verified with a fresh frame-by-frame
   scan) through its original end, re-encoded, and a new poster
   generated from its new first frame. This trimmed, safe version is
   what `gameplay-iphone.mp4` / `gameplay-iphone-poster.webp` are now —
   it's live in the primary showcase card as a placeholder. The original
   exposed file was never deleted (per the "never delete without
   approval" rule) — it's sitting in `_to_delete/` named
   `gameplay-iphone-original-exposed-gamecenter-username.mp4`, and
   should stay there until Jonathan says to remove it, given what it
   contains.
4. **Not a real fix for the "upgraded skin" problem, just the privacy
   one:** the trimmed clip still shows the purchased stack, because
   that's the only footage that existed. Jonathan asked to keep this
   specific clip anyway — recontextualized as a *future* "here's what
   you can earn" moment (it ends on `Level Complete +$10`, which fits
   that framing) rather than the primary "real gameplay" demo. It's
   saved as its own asset, `gameplay-iphone-earn.mp4` /
   `gameplay-iphone-earn-poster.webp` (identical content to the current
   `gameplay-iphone.mp4`, just under a name that says what it's for),
   not yet wired into any section — there's no "what you can earn"
   section on the page yet to put it in.
5. **Resolved: genuine default-state iPhone footage now live.** Jonathan
   recorded a fresh clip himself directly on his iPhone
   (`ScreenRecording_09-12-2026 14-25-39_1.mov`, dropped on his Desktop)
   specifically to replace the upgraded-skin placeholder from point 4.
   Following the "screen every real-device recording before it ships"
   rule, a full-file privacy scan of this new recording caught a
   **second, separate** Game Center username exposure — a "Signed in as
   `<name>`" toast around t=45–47s of the source file, distinct from the
   incident in point 2 (different clip, different session, same bug
   pattern: the OS briefly flashes the signed-in Game Center handle on a
   cold sign-in). A clean 11-second slicing segment was identified at
   source t=49.5–60.5s — after the Game Center toast, before a later
   Claude-app notification banner (t≈81–90s), and clear of every "Level
   Failed" screen in the recording — then the trimmed OUTPUT clip itself
   was re-scanned frame-by-frame (4fps) to confirm zero residual exposure
   before shipping it. This is now `gameplay-iphone.mp4` /
   `gameplay-iphone-poster.webp`: genuine default-state gameplay (default
   ball/stack, no purchased skin), recorded on actual iPhone hardware,
   matching the iPad card's default-state treatment. The previous
   upgraded-skin placeholder was not deleted — it's backed up in
   `sliceball/assets/showcase/_to_delete/` as
   `gameplay-iphone-placeholder-upgraded-skin-backup.mp4` (and matching
   `-poster.webp`), per the "never delete without approval" rule.

**Homepage rebuilt as a multi-app hub (2026-09-13):** storefront hero with
one featured app, help strip, "All apps" grid, About, Contact; new
`/support/` and `/privacy/` hub pages; shared four-column footer on all
six pages; "apps" wording site-wide. See "Storefront hero", "Help strip"
and "Hub pages" above.

**Android launch reflected on the site (2026-09-13):** every page's
footer line, both meta descriptions, the homepage hero lead, the
homepage card badge/platforms, and the Sliceball hero actions now say
Android is out and iOS is coming soon — see the "Launch state" note
under Badges for exactly what changes again when Apple approves.

**Known pending / left behind, not yet resolved:**
- ~~The primary iPhone showcase card still needs real default-state
  footage~~ — **resolved**, see point 5 above: genuine default-state
  footage recorded on actual iPhone hardware is now live as
  `gameplay-iphone.mp4`. The `gameplay-iphone-earn.mp4` asset from point
  4 is still unused, saved for a possible future "what you can earn"
  section.
- The old single-card assets (`gameplay.mp4`, `gameplay-poster.webp`)
  are no longer referenced by any page but were left in place rather
  than deleted, per the "never delete without approval" rule — safe to
  remove once Jonathan confirms he doesn't want to keep them.
- Stray intermediate PNGs and the original exposed iPhone clip (raw
  frame grabs already converted to their final `.webp` posters, plus
  `gameplay-iphone-original-exposed-gamecenter-username.mp4` and
  `gameplay-iphone-poster-original.webp` — see point 3 above) were
  moved into `sliceball/assets/showcase/_to_delete/` rather than
  deleted outright, for the same reason — Jonathan can delete that
  folder himself, or ask for it to be removed.

If a genuinely new pattern is needed for a future page (e.g. an FAQ
accordion), add it to `style.css` following the existing naming
convention (`.block-name__element`, `.block-name--modifier`) and
document it here.
