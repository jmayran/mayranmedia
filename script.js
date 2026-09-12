/* ==========================================================================
   Mayran Media — scroll reveal + Sliceball showcase video control
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

   2. Gates the Sliceball showcase's autoplaying gameplay video(s) behind
      `prefers-reduced-motion` and wires up each one's own pause/play
      toggle button. See that block below for why. There are two
      independent video/toggle pairs on the page now (iPhone + iPad
      cards, side by side) -- this loops over however many
      `.showcase__video-card`s it finds, so a third device card someday
      needs no JS change at all.
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
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px", // trigger slightly before full entry
    }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ==========================================================================
   Sliceball showcase video(s) — reduced motion + pause control
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
   `.showcase__video-toggle` button, wired up here.

   The showcase now has two independent device cards (iPhone + iPad),
   each its own `.showcase__video-card` containing one `<video
   class="showcase__video">` and one `.showcase__video-toggle` sibling —
   this loops over every `.showcase__video-card` and wires each pair up
   completely independently (pausing one never touches the other).
   ========================================================================== */
(function () {
  "use strict";

  var cards = document.querySelectorAll(".showcase__video-card");
  if (!cards.length) return;

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  cards.forEach(function (card) {
    var video = card.querySelector(".showcase__video");
    var toggle = card.querySelector(".showcase__video-toggle");
    if (!video || !toggle) return;

    function setToggleState(isPlaying) {
      toggle.setAttribute("data-state", isPlaying ? "playing" : "paused");
      toggle.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        (isPlaying ? "Pause " : "Play ") + toggle.dataset.label + " gameplay video"
      );
    }
    // Remember this toggle's own device name (from its initial aria-label,
    // e.g. "Pause iPhone gameplay video" -> "iPhone") so setToggleState can
    // rebuild an accurate label after every play/pause without hardcoding
    // "gameplay" text per-card here.
    var initialLabel = toggle.getAttribute("aria-label") || "";
    var labelMatch = initialLabel.match(/^(?:Pause|Play) (.+) gameplay video$/);
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
