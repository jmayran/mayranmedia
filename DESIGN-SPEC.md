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
mechanism. The Sliceball page's hero is headline, subhead, the store
block and ONE phone playing real footage (`#showcase`), hanging down
over the section below it — see "Sliceball page (direction C)" for the
layout and for why every screen on that page sits in the same generic
device frame.

**One deliberate exception:** a game's own dedicated page may use real,
optimized local screenshot files (`.webp`, no CDN, no build step) once
the game has them — see "Sliceball page" below. This does NOT relax the
`.app-card` rule on the homepage (still abstract-only pre-launch); it
only applies to a game's own page, where showing the real thing is the
point.

## Files

| File | Purpose |
|---|---|
| `tokens.css` | All design tokens (custom properties). Load first. |
| `style.css` | Reset, base type, layout primitives, shared components (header, footer, buttons, badges, `.app-card`, `.reveal`, hero). Load second. |
| `script.js` | IntersectionObserver wiring for `.reveal`, plus the Sliceball page's video pause/play chips and their `prefers-reduced-motion` gate. Nothing else lives here — keep it that way. |
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
| `--color-accent-soft` | `rgba(20,102,58,.1)` | Decorative fills ONLY — never behind text (see note below). Also used for the `.hero` ambient background glow — see that section. |
| `--color-on-accent` | `#ffffff` | Text/icons placed on a solid `--color-accent` surface |
| `--color-focus-ring` | `#14663a` | Alias of `--color-accent`, used by `:focus-visible` |
| `--shadow-color` | `rgba(0,0,0,.3)` | Elevation `box-shadow`s (`.app-card:hover`, `.device`) — never hardcode a shadow color |

**Why `--color-on-accent` is its own token, not `var(--color-bg)`:** they
happen to resolve to the same white today, but they mean conceptually
different things (text-on-accent vs. page background) — a future change
to one should not silently break the other. Use `--color-on-accent`
explicitly wherever text sits on a solid accent fill.

**Why `--color-accent-soft` is decorative-only:** measured contrast of
accent-colored text against a `--color-accent-soft`-tinted card
background does not clear AA. Use it for non-text decoration (the
Sliceball ball's glow ring, the subtle radial wash in
`.app-card__visual`, the hero ambient glow) — never as a fill
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

**Launch state as of 2026-09-15 (iOS and Android both live).** iOS 4.0
was approved 2026-09-13, READY_FOR_SALE, public at
`https://apps.apple.com/us/app/sliceball-ball-drop-game/id6809610482`
(device compatibility confirmed via the live listing: iPhone AND iPad,
both `Requires iOS/iPadOS 15.0 or later`). The homepage `.app-card`
carries a plain `.badge` reading "Game" (category, unchanged) with
`.app-card__platforms` now reading "iOS · Android". The Sliceball hero's
`.store-block` carries **both** official badges — Apple's "Download on
the App Store" FIRST (`assets/store/apple-app-store-badge.svg`, Apple's
placement rule; pulled from Apple's own badge-generator endpoint,
`tools.applemediaservices.com`, with Jonathan's OK, 2026-09-15;
unmodified, same as the Play badge rule), then Google's Play badge —
see "Badge sizing" below for exactly how tall each renders and why
they're deliberately NOT the same `<img>` height.

**Badge sizing — deliberately NOT the same `<img>` height (fixed
2026-09-15).** First pass set `.store-badge img { height: 60px }` for
both — same box height, which sounds like the obviously-correct way to
match two badges, and is what most "how to add app store badges" guides
say to do. Jonathan looked at the live result and flagged that Apple's
badge still looked visibly bigger than Google's despite that. He was
right, and it's not a rendering bug: measured the actual pixel content
of each asset (PIL alpha-bbox on `google-play-badge.png`; the SVG
rendered onto a solid-color background at 10x scale via headless Chrome,
then bbox'd against that background, since headless `--screenshot`
doesn't preserve real transparency) — **Google's PNG bakes in a lot of
built-in clear space: the visible black pill is only ~67% of the PNG's
own canvas height** (168px of 250px). **Apple's SVG has NO built-in
padding at all — the pill IS the full canvas**, edge to edge (confirmed:
content bbox = the entire viewBox). So a 60px `<img>` gave Apple a 60px
pill and Google only a ~40px pill — the two boxes matched, the two
pills didn't, and the pill is what a visitor actually sees as "the
badge." Fix: `.store-badge--apple img { height: 46px }` (an extra
modifier class on Apple's `<a class="store-badge">` in both `index.html`
and `sliceball/index.html`), base `.store-badge img` raised to
`68.45px` for Google. 46px pill (Apple, 100% fill) ≈ 68.45 × 168/250 ≈
46px pill (Google) — the two VISIBLE PILLS now match; the two `<img>`
boxes deliberately don't. Both still clear their own company's rule:
Apple's ≥40pt minimum (46 > 40), and Google's "not smaller than the App
Store badge" (its 68.45px container is now the larger of the two, even
though the visible pills are equal). If either badge asset is ever
replaced, re-measure its content bbox the same way before assuming a
shared height will look right — don't just copy 46/68.45 forward blind.

Each badge sits in its own `.store-block__store` group directly beside
that store's own QR code (`.store-block__store` = badge + `.store-block__qr`,
divider between the two GROUPS via `.store-block__store + .store-block__store`,
not between badge and QR). **This replaced an earlier layout** (one row
of both badges, a separate row of both QR codes below) that Jonathan
flagged same-day as ambiguous — a visitor couldn't tell which QR opened
which store. Fitting two full groups on one line at desktop widths
needed `.hero--story .hero__content`'s `max-width` bumped from the base
840px to 900px (two groups measure ~831px plus their gap, a hair over
840); h1/lead stay centred and short regardless of the extra width, so
this doesn't affect their readability.

**The two groups are equal width (`flex: 1 1 0`), not their natural
content width — fixed 2026-09-15, same day, after the badge-sizing
fix above.** Apple's badge got narrower (46px height) and Google's got
wider (68.45px) in that fix, so the two groups' NATURAL widths went from
close-ish to visibly unequal (~374px vs ~437px at the time). Centering
the `.store-block` as a whole still centers the total content, but the
divider between the groups — the thing a visitor's eye actually reads as
"the center" — sat well off the true center because one side was wider
than the other. `flex: 1 1 0` makes both groups claim equal space so the
divider lands within a few px of true center regardless of how the two
badges' natural widths compare (verified: divider at 635.5px against a
true center of 640px in a 900px block, i.e. within a single hairline).
**This needs a `min-width: 340px` floor** on `.store-block__store` —
without it, `flex-basis: 0` lets a group shrink past its content's
natural size on a narrow container (the homepage's ~440px copy column),
and text starts wrapping mid-word inside the QR caption instead of the
whole group wrapping to its own line the way it used to. 340px sits
comfortably below both groups' natural width (so it never kicks in on
the 900px Sliceball hero, where the equal-split math above still holds)
and comfortably above what a badge+QR pair needs to lay out cleanly (so
it reliably forces a two-line stack instead of a squeeze on anything
narrower). **On coarse-pointer/narrow devices this floor gets dropped
back to 0** (same `@media (pointer: coarse), (max-width: 640px)` block
that hides the QR) — with no QR in the group, a bare badge is only
~140-220px wide, so keeping the 340px floor there forced an unnecessary
vertical stack; dropping it restores the badges sitting side by side
with their divider, same as before either QR component existed.

**The tablet band's "iPad · Out now" pill is a real link now, not just
a `<span>`** (2026-09-15) — same App Store URL as the phone badges,
since Sliceball is one universal listing covering both iPhone and iPad
(confirmed via the live listing: `Requires iPadOS 15.0 or later`, no
separate iPad SKU). `a.badge` gets the same invisible-hit-area-extension
treatment as `.video-toggle` (`::before` with `inset: -8px 0`) so it
clears the 44px touch-target rule without visually growing the 28px
pill — copy that pattern for any other `.badge` that becomes a real
link in the future rather than just adding `min-height` directly (which
would make the visible pill taller, not just its hit area).

The one-QR "device-aware link"
idea noted in an earlier version of this section was **not built** —
a UA-sniffing redirect page is bigger scope than "match the Android
badge/QR treatment, one QR per badge," which is what was actually asked
for, and Apple's own marketing guidelines say the App Store badge should
link straight to the listing, not through a redirector. If a real
device-aware smart link is wanted later, that's a separate, bigger task.
The Sliceball tablet band's pill
is now a plain `.badge` "iPad · Out now" (no longer `.badge--coming-soon`)
since the live App Store listing confirms iPad support — there is still
no Android-tablet pill (the game isn't offered as a tablet experience on
Android). The footer line and both meta descriptions now read "out now
on iOS and Android" everywhere.

QR generation: same method as the Play QR — `segno`, `dark="#1d1d1f"`
(the `--color-text` token), `light="#fff"`, `scale=4` — via a throwaway
venv (`segno` isn't installed system-wide on this Mac). The App Store
URL is longer than the Play one so segno picked a bigger QR version
(45 modules / 180px intrinsic vs Play's 41 modules / 164px) — harmless,
since `.store-block__qr img` is fixed at 72×72 by CSS regardless of the
source SVG's intrinsic size.

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
primary action is that app's `.store-block` (see the "Store block"
comment in `style.css`): Google's official "Get it on Google Play"
badge linking straight to the listing, the "Get help" `.btn-secondary`
(→ `#help`) beside it, and a QR code for the same listing underneath.
**When a new app ships, replace the card and the store block with the
new app, and move the previous app's card into the `#apps` grid** —
never put two apps in the hero. The hero is a spotlight, the grid is the
complete catalog.

**Primary action is the official Play badge + QR, not a green button
(2026-09-13, "direction C" mockup).** A visitor on a desktop cannot tap
through to a phone store, so the old `.btn-primary` ("Get Sliceball on
Google Play") mostly led to a page they could not use; the badge is the
artwork people already recognise as "this is on Google Play", and the QR
is the way to actually get it onto the phone from a desktop. The QR
(`.store-block__qr`) hides itself on coarse-pointer devices and under
640px — a phone cannot scan itself. On the homepage the QR always sits
on its own row under the badge row with no left divider
(`.hero--storefront .store-block__badges { flex-basis: 100% }` plus a
divider-less `.hero--storefront .store-block__qr`): the copy column is
~500px wide in the two-column hero and the three pieces need ~535px on
one line, so rather than let the shared component wrap by accident
(which left a divider hanging off the second row, and put the QR inline
again between 640 and 800px), the wrap is forced at every width and the
divider dropped. The basis sits on the badge row, not the QR, because
the QR's `max-width` clamps its own flex-basis before line-breaking.
The badge (60px) and the 44px secondary button share one
centre line via `align-items: center`; measured centre delta 0px in
both engines at 1280 and 375. `.hero__actions` is no longer used by any
page (the Sliceball hero moved to the same `.store-block` on
2026-09-13); its CSS rule is left in place for a future page that needs
a plain button row. **When iOS ships:**
add Apple's official App Store badge FIRST in `.store-block__badges`
(Apple's rule), keep the Play badge at least as large (Google's rule),
and point the QR at a device-aware link rather than one store — see the
"Store block" comment in `style.css`.

**The scroll parallax fades the copy column only, never the featured
card.** `hero-parallax` (opacity → 0.4 over the first 400px of scroll)
is scoped to `.hero__copy` on the storefront hero and to `.hero__content`
everywhere else. The card is ~760px tall and sits under the copy on a
phone, so fading the whole content block dimmed the screenshot before it
had even reached the viewport — Jonathan flagged it 2026-09-13 ("fades
too quickly"). Verify any change here by reading the card's computed
opacity at several scroll positions at 375px wide, not just at scroll 0.

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
    <!-- unreleased: a game-specific abstract visual, e.g. .sliceball-scene
         shipped:    <div class="device device--phone app-card__device">
                       <img class="device__screen" src="…/screen-03-slicing.webp"
                            alt="…" width="900" height="1843" decoding="async">
                     </div> -->
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
  `width: min(220px, 100%)`). It carries an explicit `width: 100%`
  **for Safari**: without it WebKit resolves the 4:3 ratio from the
  content height instead of the card width, so the box came out 666px
  wide inside a 400px card and the centered screenshot was shoved right
  and clipped (Jonathan's Safari screenshot, 2026-09-13). Chrome never
  showed it. Test card layout changes in WebKit, not just Chrome — see
  README → verification for the headless WebKit renderer.
- **Shipped app: a real screenshot in the generic phone frame.** Since
  2026-09-13 the Sliceball card's visual is the shared `.device
  .device--phone` frame (see "Generic device frames" in `style.css`) with
  the extra class `.app-card__device`, which only sets
  `--device-w: min(180px, 100%)` — the widest the phone can be while the
  card still reads as a card (Jonathan approved this from the
  "direction C" mockup, 2026-09-13, replacing the earlier
  `.app-card__shot` glass ring, which is gone). Inside it is a
  `.device__screen` <img> with real `width`/`height` attributes, so the
  frame's height comes from the file and the 4:3 visual box grows to fit
  — nothing crops, and nothing is sized by height (a height-based size
  is not definite for a flex child and fell back to the image's 900px
  natural width once already). **Use the island-free crops**
  (`sliceball/assets/showcase/screen-*.webp`, 900x1843 — the store shots
  with the iPhone island cropped off the top), never the raw
  `showcase-*.webp` store shots: the frame is deliberately generic (no
  island, notch, buttons or camera housing, per Apple's marketing
  guidelines on generic devices), and an island inside a generic frame
  would give the game away as "an iPhone". The 250px `.device--phone`
  default is for the Sliceball page; the card override is
  `.app-card__visual .app-card__device` (two classes) because
  `.device--phone` sets its own `--device-w` later in the file at
  single-class specificity and would otherwise win on source order.
- **Unreleased app: no real screenshots/video** on this compact card —
  build an abstract CSS-only visual instead (no external image/video
  files, no CDN) and swap to the `.device--phone` frame at launch. The
  `.sliceball-scene` CSS stays in `style.css` as the worked example. Give it its own class namespace, e.g.
  `.puzzlename-scene`, following the `.sliceball-scene` pattern below,
  and follow the reduced-motion pattern (static default, animation added
  only under `no-preference`). This is specifically about the small
  homepage card — a game's own dedicated page is a different context and
  may use real screenshots once captured; see "Sliceball page" below.
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

## Skim placeholder (2026-09-14)

Skim (Unity project `apps/skip`, GitHub `jmayran/Skim`, renamed from
"Skip") is a second game, still early in development — no store listing,
no captured screenshots or footage, no support/privacy needs finalized
yet. Jonathan asked for a placeholder for it on the site, explicitly
choosing to have it **take over the homepage hero right now**, ahead of
its actual release — a deliberate, one-time exception to the storefront
hero rule above ("features exactly ONE app: the most recently shipped
one"). Sliceball, the previous hero app, moved into the `#apps` grid
(the grid is no longer dormant) with its normal shipped-app card
unchanged.

**What's different from a normal app addition, and why:**
- The hero's `.store-block` has no Play/App Store badge or QR — there is
  nothing to link to yet. It's a single `.badge--coming-soon` reading
  "In development" next to the existing "Get help" button.
- The homepage `.app-card` visual is `.skim-scene` — a new abstract
  CSS-only illustration (stone, ripples, waterline) following the
  `.sliceball-scene` pattern for an unreleased app, per the `.app-card`
  rules above. **Unlike `.sliceball-scene`, it has no animation at all**
  — a single static frozen frame. The site's motion budget was
  deliberately capped at two moments (`.sliceball-scene` and the hero
  parallax — see the note at the end of the `.sliceball-scene` section);
  adding a third animated flourish would break that restraint, so
  `.skim-scene` stays still on purpose.
- `skim/index.html` exists as a minimal placeholder page — Sliceball's
  "direction C" hero shape (centred copy + one visual as a sibling of
  `.hero__content`), with `.skim-scene` sized up (`min(280px, 70vw)`) in
  place of a device-framed video, no tablet band or feature rows (there's
  no content for them yet), a short "What it is" blurb, and a contact
  section that points at the *studio-wide* `/support/` and `/privacy/`
  hubs rather than dedicated `skim/support/`/`skim/privacy/` pages —
  those don't exist yet and shouldn't be invented before Skim actually
  has something to disclose.
- **Skim is intentionally NOT added to the `/support/` or `/privacy/`
  hub's "By app" `.contact-grid`** — those cards link to a per-app
  support/privacy page, and Skim doesn't have one. It IS added to every
  page's footer "Apps" column (linking to `skim/`, a real page) and to
  the homepage `#apps` grid.
- Nav "Apps" links site-wide now point at `#apps` again (grid no longer
  dormant), matching the "when the second app ships" instruction above —
  even though Skim itself hasn't shipped, the grid itself is no longer
  single-card.

**When Skim actually ships:** follow the normal flow — real screenshots
replace `.skim-scene` on its own page (the "one deliberate exception" for
a game's own page), the homepage card gets the real screenshot per the
shipped-app `.app-card` rule (or stays in the hero if it's still the
newest release), the store block gets real badges/QR, and
`skim/support/`, `skim/privacy/` get built and added to both hubs — at
that point this section's exceptions stop applying and Skim is just
another app on the site.

**Hero reverted to Sliceball, 2026-09-15, one day after the above.**
After the App Store badge/QR update went live, Jonathan looked at the
live site and asked whether the hero-jump was actually a good idea. The
honest answer: no — a first-time visitor was landing on "In development"
with no real store link and no way to actually get anything, while the
real, live, downloadable Sliceball was one click away in the grid instead
of front and center, and Skim's page has no email-capture or "notify me"
hook, so the hero slot wasn't doing anything for it either. He asked for
that recommendation to be carried out. **Reverted:** Sliceball is back in
the homepage hero (real screenshot card, both live store badges each
paired with their own QR in `.store-block__store` groups — see "Launch
state" above), Skim moved into the `#apps` grid with its `.skim-scene`
card. Meta description and the hero's copy lead with Sliceball again.
Nothing else from the original placeholder work changed — `skim/index.html`
still exists as-is, still not linked from support/privacy hubs, still no
store links, per the "What's different" list above. **This is not a
reversal of the storefront hero rule** ("features the most recently
shipped app") — it's that rule holding again, now that the deliberate
one-time exception for Skim has been undone. If Skim gets a real
capture mechanism or gets closer to shipping, the hero-jump question can
be revisited on its own merits rather than by default.

## Sliceball page (direction C · "Story", 2026-09-13)

Jonathan chose this from three rendered directions on 2026-09-13
(A: a "product shot" hero with the old two-video showcase kept; B: a
"gallery" grid of framed screens; C: this "story" — one phone in the
hero, a tablet band, then three alternating feature rows that tell the
game in order). It replaces the previous `.showcase` two-video card
section, the `#screens` swipe strip and the `#how-it-works` step cards
in one pass; their CSS (`.showcase*`, `.showcase-gallery*`,
`.steps-grid`, `.step-card*`, the page's inline `<style>`) is gone.
The page is, top to bottom:

1. **`.hero.hero--story`** (`#top`) — centred `.hero__content`
   (eyebrow "A Mayran Media game", H1 "Sliceball" — the H1 stays the bare
   app name for search/store-preview reasons — lead, then the shared
   `.store-block`) and, as a SIBLING of `.hero__content`, a
   `.device-figure.hero__device` (`#showcase`) holding the phone clip at
   `--device-w: min(330px, 70vw)`. Sibling, not child, because the
   `hero-parallax` fade targets `.hero__content` on non-storefront heroes
   and must never dim the footage (the same rule the homepage's featured
   card follows). The figure sits entirely inside the hero on the base
   `.hero` background (no overlap into the next section — see the
   2026-09-13 note below).
2. **`.story-tablet`** (`#tablet`) — the `--color-bg-elevated` band below
   the hero, `padding-block: var(--space-section)`. Two-column grid (copy
   `1fr` | tablet `1.1fr`), copy-first single column and centred at 800px
   and below. Copy: eyebrow "Bigger screen", H2 "Made for the tablet on
   the couch, too.", one `.text-body-lg` line, and `.story-tablet__pills`
   holding a single `.badge--coming-soon` "iPad · Coming soon" — no
   Android-tablet pill; the game has no tablet-specific experience on
   Android, only on iPad. Tablet: `.device-figure.story-tablet__device` >
   `.device--tablet` at `--device-w: min(520px, 100%)` (percentage, not
   vw — at 1280 the grid column is ~500px and a fixed 520px spilled into
   the gutter) with its own pause chip.
3. **`.feature-rows`** (`#features`, white) — three `.feature-row`
   articles, each `.feature-row__copy` (`.feature-row__index` "01"/"02"/
   "03" in the old step-card counter style: `--text-small`, 700,
   `0.04em`, accent; H2; `.text-body-lg` paragraph) beside a
   `.feature-row__device` > `.device--phone` at `--device-w: min(260px,
   70vw)` holding one screenshot. Sides alternate text|phone,
   phone|text, text|phone via `order: 2` on even rows' copy — the DOM is
   always copy-then-image so reading order never changes. At 800px and
   below every row stacks copy-first, centred, phone at `min(220px,
   70vw)`. Row gap `--space-3xl` (desktop) / `--space-2xl` (stacked).
   Only the three island-free shots are used: `screen-03-slicing.webp`
   (01 "Slice through the stack."), `screen-02-gameplay.webp` (02 "Time
   it right and the ball drops clean."), `screen-05-shop-balls.webp` (03
   "Spend what you earn."). The old `showcase-0N.webp` files are still
   on disk, unreferenced by this page.
4. **`#contact`** — unchanged Support & Privacy cards.

Nav "How it works" now points at `#features`; nothing else in the repo
linked to `#screens` or `#how-it-works`.

**Device-frame rules (`.device`, shared with the homepage card).** Every
screen on the page — both clips and all three screenshots — sits in the
same generic `.device` (`.device--phone` or `.device--tablet`; see the
"Generic device frames" comment in `style.css`): one graphite bezel,
uniform rounded corners, and nothing else — no island, notch, buttons or
camera — so it reads as neither an iPhone nor a Pixel (Jonathan,
2026-09-13: "generic smart devices, not iPhone-looking ones with an
island"). Size ONLY via `--device-w` on a page-specific wrapper rule
(`.hero__device .device--phone`, `.story-tablet__device .device--tablet`,
`.feature-row__device .device--phone`) — bezel and radius scale from it.
The screen's height comes from the media's own `width`/`height`
attributes (`height: auto`), so every `<img>`/`<video>` inside MUST carry
its real pixel size (phone clip 444×960, tablet clip 720×960,
screenshots 900×1843) and nothing is ever cropped — verified 2026-09-13
in WebKit and Chrome at 1280 and 375: every `.device__screen`'s rendered
aspect equals its natural aspect, every `.device` is centred in its
parent to the pixel, no horizontal overflow.

**Overlap removed (2026-09-13, later the same day).** The hero phone
originally hung `--hero-overlap` (200px; 140px on phones) down into the
grey `.story-tablet` band via a negative bottom margin — see the history
note below for why. Jonathan flagged it live: with the phone straddling
the boundary, it was the only device on the page sitting on a mixed
white/grey backdrop instead of one flat color like the tablet (all grey)
and the three feature-row screenshots (all white). Fix: dropped
`--hero-overlap` entirely — `.hero__device` is a plain `margin-top`, in
flow, no negative margin, no `z-index`; `.story-tablet` went back to a
normal `padding-block: var(--space-section)`. The phone now sits fully
inside the hero's white background with a normal section gap before the
grey band starts. Re-verified in WebKit and Chrome at 1280 and 375.

**Pause chip (`.video-toggle`), and why it is OUTSIDE the screen.** Each
looping clip still needs a visible stop (WCAG 2.2.2), but the game's own
in-game pause button is visible in the footage, so the old glyph overlaid
bottom-right on the video read as a duplicate control. The toggle is now
a chip directly under the device inside the `.device-figure` (flex
column, `gap: var(--space-xs)`): `.badge--coming-soon` pill language
(`--color-border-strong` hairline, `--radius-full`, `--text-small`, 600)
in `--color-text-secondary` on a `--color-bg` fill (the pill is white in
both the white and the grey sections, so the text is always 5.07:1),
32px tall, with a transparent `::before` extending the hit area to 44px.
Visible text "Pause video"/"Play video" plus the pause/play glyph, both
drawn twice and swapped by CSS off `data-state` — `script.js` only flips
`data-state`/`aria-pressed`/`aria-label`. **Label-in-name rule (WCAG
2.5.3):** the visible chip text must be a prefix/substring of the
accessible name, so the `aria-label` is "Pause video (phone gameplay)" /
"Play video (phone gameplay)" and "… (tablet gameplay)" — the visible
"Pause video"/"Play video" first, the qualifier that tells the two chips
apart in parentheses after it. `script.js` parses the qualifier out of
the initial label with `/^(?:Pause|Play) video \((.+)\)$/` and rebuilds
the whole label on every state change; any new clip's chip must follow
the same form or its label stops updating. The `prefers-reduced-motion`
gate (no autoplay, poster shown until the visitor presses Play) is
unchanged. `script.js` loops over every `.device-figure` — only the two
video figures carry that class; the feature rows' screenshots sit in
`.feature-row__device` and are never selected — so a third clip in a
`.device-figure` needs no JS change.

**Store block rules (`.store-block`, both heroes).** Official badge
artwork only — Google's (`assets/store/google-play-badge.png`, 68.45px
tall) and Apple's (`assets/store/apple-app-store-badge.svg`, 46px tall
— see "Badge sizing" above for why they're deliberately different
`<img>` heights, not the same one), never recoloured/redrawn/cropped/
stretched/animated, Apple's placed first (its own placement rule) —
each paired with its own QR
(`assets/store/qr-app-store.svg` / `qr-google-play.svg`) in one
`.store-block__store` group per store, so it's unambiguous which QR
opens which listing. Both QRs are hidden on coarse-pointer devices and
under 640px — a phone cannot scan itself; only the two badges (and their
divider) remain at that point. On the Sliceball hero the block is
centred; `.hero--story .hero__content` widens to 900px (from the base
840px) so both full groups fit on one line at desktop widths. Full
detail, including the earlier one-row-of-badges/one-row-of-QRs layout
this replaced, is under "Launch state" in the Badges section above.

**History, kept so nobody reopens it.** Before direction C this section
was `.showcase`: two side-by-side "minimal glass edge" video cards
(iPhone + iPad) chosen from three frame mockups, after a CSS-drawn phone
chassis (rejected as "more mockup than the screenshots"), a plain card,
and before that a scroll-scrubbed six-screenshot crossfade (rejected as
"robotic"). The glass edge was the platform-neutral answer at the time;
the generic `.device` frame is the same answer with an actual bezel, and
Jonathan chose it explicitly. Do not bring back a notch, an island, side
buttons, or per-brand frames.

**Asset pipeline (still applies).** The tablet recording came from
Unity's iOS Simulator build, captured with the Simulator's own screen
recording; the phone recording is genuine on-device footage. Both were
trimmed/compressed with `ffmpeg` to a matching `-poster.webp` first
frame. **Screen every real-device recording frame-by-frame before it
ships** (an `ffmpeg` contact sheet at 1–4fps) for Game Center
"Signed in as <name>" toasts, notification banners, or a real name —
this caught two separate exposures on this page (see "Current status").
Screenshots are the `StoreAssets/` store shots resized to 900px wide,
`.webp` quality 82, with the island cropped off the top (112px; the pill occupies rows 30-104, and a first pass at 72px left its bottom third visible, which Jonathan caught on the live site) as
`screen-NN-name.webp`; never generate placeholder/fake screenshots.

## Ambient background glow (`.hero::before`)

A very subtle radial-gradient wash sitting behind the hero, added as
part of the "make the page brighter/more inviting, like apple.com"
pass. (The Sliceball page's old `.showcase::before` copy of it went
with that section on 2026-09-13; the grey `.story-tablet` band carries
no glow.) The section gets `position: relative` and a `::before`
pseudo-element:

```css
.hero::before {
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
this spec originally described (see the history note under "Sliceball
page" above) — it's no longer a placeholder page.

**Sliceball page rebuilt as direction C · "Story" (2026-09-13):** centred
hero with the shared `.store-block` and one generic-framed phone clip
hanging 200px (140px on phones) into a grey tablet band, then three
alternating feature rows using the three island-free screenshots. The
two-video `.showcase`, the `#screens` strip and the `#how-it-works`
cards are gone (markup and CSS); the pause control moved from an
overlay glyph to a chip under each device; `script.js` now drives
`.device-figure`/`.video-toggle`. Verified in WebKit and Chrome at 1280
and 375 — see the "Sliceball page" section for the numbers. The tablet
clip (`gameplay-ipad.mp4`, 720×960) is the iPad Simulator recording at
genuine default state (`CASH $0`, `Level 1`, no shop purchases) — what
Jonathan asked for when he flagged that a different clip looked
"upgraded".

The phone clip's asset went through its own incident worth recording
in full, because it changes what this clip is FOR:

1. The original iPhone recording was genuine footage from an actual
   iPhone (not a Simulator) — screen-recorded on the device itself and
   transferred over, the most literal possible answer to Jonathan's
   original ask for this to look like "a real phone playing the game."
   It showed `CASH $10`, `Level 5`, and a purchased ball/stack skin —
   Jonathan pointed out this was an upgraded/purchased look, not the
   default new-player state the page should lead with.
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
   it's live in the hero phone as a placeholder. The original
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
   matching the tablet clip's default-state treatment. The previous
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

**Homepage hero: official Play badge + QR, generic phone frame
(2026-09-13, "direction C"):** the hero's green "Get Sliceball on Google
Play" button became the shared `.store-block` (Google's badge artwork
from `assets/store/`, "Get help" beside it, QR on its own row), and the
featured card's glass-ring screenshot became the shared `.device--phone`
frame at 180px holding the island-free `screen-03-slicing.webp`.
`.app-card__shot` was removed from `style.css`; the old
`showcase-03-slicing.webp` is still on disk, just unreferenced by the
homepage. Copy, help strip, About, Contact and footer are unchanged.
Verified in WebKit and Chrome at 1280 and 375 (no horizontal overflow,
frame centred in the visual, screenshot ratio uncropped). See
"Storefront hero" and the `.app-card` rules above.

**Known pending / left behind, not yet resolved:**
- ~~The hero phone clip still needs real default-state
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
