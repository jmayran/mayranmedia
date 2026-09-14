/* ==========================================================================
   Mayran Media — scroll reveal + Sliceball gameplay video control
   --------------------------------------------------------------------------
   Two small, independent pieces of JS on this site (each its own IIFE
   below, each a no-op if the elements it looks for aren't on the page):

   1. Wires up the ".reveal" utility class (see style.css) to an
      IntersectionObserver so elements fade/slide in the first time they
      scroll into view.

      Reduced motion: style.css already gives every ".reveal" element a
      fully visible, non-animated fallback under
      `prefers-reduced-motion: reduce` (belt) — this script additionally
      skips observing entirely for those users (suspenders), so no
      transition ever fires for them even if a future style change forgets
      the CSS fallback.

   2. Gates the Sliceball page's autoplaying gameplay video(s) behind
      `prefers-reduced-motion` and wires up each one's own pause/play
      toggle chip. See that block below for why. There are two
      independent video/toggle pairs on the page (the hero phone and
      the tablet band) -- this loops over however many `.device-figure`s
      hold a <video>, so a third clip someday needs no JS change at all.
   ========================================================================== */
(function () {
  "use strict";

  var revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Reduced motion, or no IntersectionObserver support: show everything
  // immediately and do nothing else.
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // reveal once; don't re-hide on scroll-up
        }
      });
    },
    {
      // Reveal as soon as any sliver of the element approaches the viewport.
      // The previous values (threshold 0.15 + a NEGATIVE bottom rootMargin)
      // required a section to be 15% inside an already-shrunk viewport before
      // its fade even started, so at normal scrolling speed the reader reached
      // the section first and saw a blank/ghosted band of page. An any-pixel
      // threshold plus a generous POSITIVE bottom margin starts the fade ~300px
      // before the section scrolls in, so it is fully opaque on arrival.
      threshold: 0,
      rootMargin: "0px 0px 300px 0px",
    }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });

  // Safety net. Anything already at/near the viewport right now -- first paint,
  // or a scroll position restored by a refresh or a #hash link -- is revealed
  // immediately instead of waiting on an observer callback that may not fire
  // until the next scroll. Also guarantees content can never be left
  // permanently invisible if a single observer callback is missed.
  function revealInView() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach(function (el) {
      if (el.classList.contains("is-visible")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh + 300 && r.bottom > -300) {
        el.classList.add("is-visible");
        observer.unobserve(el);
      }
    });
  }
  revealInView();
  window.addEventListener("load", revealInView);
})();


/* ==========================================================================
   Sliceball gameplay video(s) — reduced motion + pause control
   --------------------------------------------------------------------------
   The `<video>` markup itself is unconditionally `autoplay muted loop
   playsinline` (see sliceball/index.html) — HTML attributes can't check a
   media query, so a user who has set `prefers-reduced-motion: reduce`
   would otherwise get looping motion started for them regardless. This
   script is what actually respects that preference, matching the same
   "never assume motion is wanted by default" rule the .reveal script
   above follows for scroll animations.

   Separately, since each clip loops indefinitely once playing, it also
   needs a visible way to stop it (WCAG 2.2.2, Pause/Stop/Hide applies to
   any auto-starting motion lasting more than 5 seconds) — that's the
   `.video-toggle` chip under each device, wired up here. The chip's
   visible text and glyph (pause/play variants) are swapped purely by
   CSS off `data-state`, so this script only flips attributes.

   Each clip lives in its own `.device-figure`: a `.device` holding one
   `<video class="device__screen">`, then a `.video-toggle` sibling. Only
   the two video figures (hero phone, tablet band) carry that class — the
   feature rows' screenshots sit in `.feature-row__device`, which this
   never selects — and each pair is wired up completely independently
   (pausing one never touches the other). The `if (!video || !toggle)`
   guard is just defence against a future figure without a clip.

   The toggle's aria-label must stay in the form
   "Pause video (<qualifier>)" / "Play video (<qualifier>)": the visible
   chip text ("Pause video" / "Play video") has to be a prefix of the
   accessible name (WCAG 2.5.3 Label in Name, so a speech-control user
   saying "click Pause video" hits it), and the qualifier that tells the
   two chips apart goes in parentheses after it. The qualifier is parsed
   out below and the whole label rebuilt on every state change.
   ========================================================================== */
(function () {
  "use strict";

  var figures = document.querySelectorAll(".device-figure");
  if (!figures.length) return;

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  figures.forEach(function (figure) {
    var video = figure.querySelector("video.device__screen");
    var toggle = figure.querySelector(".video-toggle");
    if (!video || !toggle) return;

    function setToggleState(isPlaying) {
      toggle.setAttribute("data-state", isPlaying ? "playing" : "paused");
      toggle.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        (isPlaying ? "Pause" : "Play") + " video (" + toggle.dataset.label + ")"
      );
    }
    // Remember this toggle's own qualifier (from its initial aria-label,
    // e.g. "Pause video (phone gameplay)" -> "phone gameplay") so
    // setToggleState can rebuild an accurate label after every play/pause
    // without hardcoding per-figure text here.
    var initialLabel = toggle.getAttribute("aria-label") || "";
    var labelMatch = initialLabel.match(/^(?:Pause|Play) video \((.+)\)$/);
    toggle.dataset.label = labelMatch ? labelMatch[1] : "";

    if (prefersReducedMotion) {
      // Don't auto-start motion for these users -- leave the poster frame
      // showing (a static image, same as any other screenshot on the page)
      // until they choose to play it themselves via the toggle button.
      video.removeAttribute("autoplay");
      video.pause();
    }
    setToggleState(!video.paused);

    // The browser's own autoplay start (and any play()/pause() call, from
    // the toggle below or anywhere else) fires these events -- listening
    // here instead of only reacting to our own click keeps the button
    // honest even though `autoplay` starts playback asynchronously, after
    // this script has already run once.
    video.addEventListener("play", function () {
      setToggleState(true);
    });
    video.addEventListener("pause", function () {
      setToggleState(false);
    });

    toggle.addEventListener("click", function () {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });
  });
})();
