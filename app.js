(() => {
  "use strict";

  const config = window.invitationConfig || {};
  const root = document.documentElement;
  const motion = config.motion || {};
  const reducedMotionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const debug = new URLSearchParams(location.search).has("debug");

  const cover = document.getElementById("cover");
  const bowButton = document.getElementById("bowButton");
  const skipButton = document.getElementById("skipButton");
  const invitation = document.getElementById("invitation");
  const heroHeading = document.getElementById("heroNames");
  const hero = document.querySelector(".hero");
  const heroSafe = document.querySelector(".hero__safe");
  const replayButton = document.getElementById("debugReplay");

  const prefersReducedMotion = () => Boolean(reducedMotionQuery && reducedMotionQuery.matches);
  const ms = (value, fallback) => (Number.isFinite(value) ? value : fallback);

  /* ───────── Content ───────── */

  const lookup = (path) => path.split(".").reduce((value, key) => (value == null ? value : value[key]), config);

  function applyContent() {
    document.querySelectorAll("[data-text]").forEach((element) => {
      const value = lookup(element.dataset.text);
      if (typeof value === "string" || typeof value === "number") element.textContent = String(value);
    });
    document.querySelectorAll("[data-alt]").forEach((element) => {
      const value = lookup(element.dataset.alt);
      if (typeof value === "string") element.alt = value;
    });

    const copy = config.copy || {};
    const couple = config.couple || {};
    if (copy.openButton) bowButton.setAttribute("aria-label", copy.openButton);
    if (couple.firstName && couple.secondName) {
      document.title = `${couple.firstName} ${couple.separator || "&"} ${couple.secondName}`;
    }

    const assets = config.assets || {};
    const setSource = (selector, src) => {
      if (!src) return;
      document.querySelectorAll(selector).forEach((image) => {
        if (image.getAttribute("src") !== src) image.src = src;
      });
    };
    setSource(".door__art", assets.cover);
    setSource(".seal__ribbon--left", assets.ribbonLeft);
    setSource(".seal__ribbon--right", assets.ribbonRight);
    setSource(".seal__knot", assets.ribbonKnot);
    setSource(".hero__art", assets.namesFrame);
    setSource(".setting__art", assets.mantap);
    setSource(".rsvp__art", assets.rsvp);
    setSource(".ending__art", assets.endingFrame);
    document.querySelector(".setting").classList.toggle("setting--transparent-art", Boolean(assets.mantapTransparent));
    if (assets.linenTile) root.style.backgroundImage = `url("${assets.linenTile}")`;
  }

  function applyTheme() {
    const theme = config.theme || {};
    const colors = theme.colors || {};
    const fonts = theme.fonts || {};
    const style = root.style;
    ["ivory", "linen", "ink", "body", "sage", "gold"].forEach((name) => {
      if (colors[name]) style.setProperty(`--${name}`, colors[name]);
    });
    if (fonts.display) style.setProperty("--font-display", fonts.display);
    if (fonts.body) style.setProperty("--font-body", fonts.body);

    // One timing definition: config → CSS custom properties.
    style.setProperty("--ribbon-ms", `${ms(motion.ribbonFall, 2000)}ms`);
    style.setProperty("--ribbon-lag", `${ms(motion.ribbonLag, 180)}ms`);
    style.setProperty("--label-ms", `${ms(motion.labelFade, 450)}ms`);
    style.setProperty("--door-delay", `${ms(motion.doorDelay, 1300)}ms`);
    style.setProperty("--door-ms", `${ms(motion.doorDuration, 2500)}ms`);
    style.setProperty("--names-delay", `${ms(motion.namesDelay, 4050)}ms`);
    style.setProperty("--names-ms", `${ms(motion.namesDuration, 1500)}ms`);
    style.setProperty("--names-step", `${ms(motion.namesStagger, 1500)}ms`);
    style.setProperty("--names-distance", `${ms(motion.namesDistance, 36)}px`);
    style.setProperty("--reveal-ms", `${ms(motion.revealDuration, 1300)}ms`);
    style.setProperty("--reveal-step", `${ms(motion.revealStagger, 140)}ms`);
    style.setProperty("--reveal-distance", `${ms(motion.revealDistance, 24)}px`);
  }

  /* ───────── Loading ───────── */

  const waitForImage = (image) => {
    if (!image) return Promise.resolve(false);
    const decoded = () => (image.decode ? image.decode().then(() => true, () => image.naturalWidth > 0) : true);
    if (image.complete) return Promise.resolve(image.naturalWidth > 0 ? decoded() : false);
    return new Promise((resolve) => {
      image.addEventListener("load", () => resolve(decoded()), { once: true });
      image.addEventListener("error", () => resolve(false), { once: true });
    });
  };

  const waitForFonts = () => {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load("600 56px 'Cormorant Garamond'"),
      document.fonts.load("italic 500 18px 'Cormorant Garamond'"),
      document.fonts.load("500 13px Jost"),
    ]).catch(() => undefined);
  };

  const withTimeout = (promise, time, fallback) =>
    Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(fallback), time))]);

  /* ───────── Cover lifecycle: loading → closed-ready → opening → opened ───────── */

  let state = "loading";
  let pendingOpen = false;
  let runToken = 0;
  let savedScrollRestoration = null;

  const setState = (next) => {
    state = next;
    root.dataset.cover = next;
  };

  function lockPage() {
    if ("scrollRestoration" in history) {
      savedScrollRestoration = history.scrollRestoration;
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    root.classList.add("cover-active");
    invitation.inert = true;
    invitation.setAttribute("aria-hidden", "true");
  }

  function unlockPage() {
    root.classList.remove("cover-active");
    invitation.inert = false;
    invitation.removeAttribute("aria-hidden");
    if (savedScrollRestoration) history.scrollRestoration = savedScrollRestoration;
  }

  function finishOpening(token) {
    if (token !== runToken || state === "opened") return;
    setState("opened");
    unlockPage();
    heroHeading.focus({ preventScroll: true });
    fitHeroText();
    observeReveals();
  }

  function startOpening({ instant = false } = {}) {
    if (state === "opened" || state === "opening") return;
    if (state === "loading" && !instant) {
      pendingOpen = true; // one tap is remembered; opens as soon as artwork is ready
      return;
    }

    const token = ++runToken;
    const animate = !instant && motion.coverAnimation !== false && !prefersReducedMotion();
    if (!animate) {
      root.classList.add("instant-open");
      cover.classList.add("is-opening");
      finishOpening(token);
      return;
    }

    setState("opening");
    fitHeroText(); // settle the layout before the text starts animating
    cover.classList.add("is-opening");
    // Keyboard focus stays in the dialog on Skip until the doors finish.
    if (document.activeElement === bowButton) skipButton.focus({ preventScroll: true });

    const rightDoor = cover.querySelector(".door--right");
    const onEnd = (event) => {
      if (event.target !== rightDoor || event.propertyName !== "transform") return;
      rightDoor.removeEventListener("transitionend", onEnd);
      finishOpening(token);
    };
    rightDoor.addEventListener("transitionend", onEnd);
    // Bounded fallback if transitionend never arrives (tab hidden, cancelled transition).
    const total = ms(motion.doorDelay, 1300) + ms(motion.doorDuration, 2500) + 250;
    setTimeout(() => {
      rightDoor.removeEventListener("transitionend", onEnd);
      finishOpening(token);
    }, total);
  }

  function skip() {
    if (state === "opened") return;
    root.classList.add("instant-open");
    startOpening({ instant: true });
    // Mid-opening skip: the running token is still current, so finish it now.
    finishOpening(runToken);
  }

  function markReady(coverLoaded) {
    if (state !== "loading") return;
    if (!coverLoaded) {
      // Without cover artwork there is nothing to open: go straight to readable content.
      skip();
      return;
    }
    setState("closed-ready");
    if (pendingOpen) startOpening();
  }

  function prepare() {
    const coverImages = Array.from(cover.querySelectorAll(".door__art"));
    const coverReady = Promise.all(coverImages.map(waitForImage)).then((results) => results.every(Boolean));
    // A failed cover needs no further waiting: show readable content straight away.
    coverReady.then((loaded) => { if (!loaded) markReady(false); });
    const critical = Promise.all([
      coverReady,
      ...Array.from(cover.querySelectorAll(".seal img")).map(waitForImage),
      waitForImage(document.querySelector(".hero__art")),
      waitForFonts(),
    ]).then(([coverLoaded]) => coverLoaded);

    // A slow network must not trap the guest; after the timeout, open with what has loaded.
    withTimeout(critical, ms(motion.readyTimeout, 3500), null).then((coverLoaded) => {
      const loadedNow = coverLoaded === null ? coverImages.every((image) => image.naturalWidth > 0) : coverLoaded;
      markReady(loadedNow);
    }, () => markReady(false));
  }

  function resetCover() {
    // Debug replay only.
    runToken += 1;
    pendingOpen = false;
    root.classList.add("no-transition");
    root.classList.remove("instant-open");
    cover.classList.remove("is-opening");
    lockPage();
    void cover.offsetWidth;
    root.classList.remove("no-transition");
    setState("closed-ready");
    bowButton.focus({ preventScroll: true });
  }

  /* ───────── Names fitting ───────── */

  function fitHeroText() {
    if (!hero || !heroSafe) return;
    const text = heroSafe.querySelector(".hero__text");
    const after = hero.querySelector(".hero__after");
    const opening = hero.querySelector(".hero__opening");
    const meta = hero.querySelector(".hero__meta");
    // Start with everything inside the oval; move supporting lines out only if it overflows.
    // Only touch the DOM when a line actually changes place: re-inserting a node cancels its
    // entrance transition and makes it pop in early.
    if (opening.parentElement !== text) text.prepend(opening);
    if (meta.parentElement !== text) text.append(meta);
    if (text.scrollHeight > heroSafe.clientHeight + 1) after.append(opening, meta);
  }

  /* ───────── Countdown ───────── */

  function initCountdown() {
    const section = document.querySelector(".countdown");
    const target = Date.parse((config.dates || {}).countdownTarget || "");
    if (!section || !(config.sections || {}).countdown || !Number.isFinite(target)) return;
    section.hidden = false;
    const grid = section.querySelector(".countdown__grid");
    const done = section.querySelector(".countdown__done");
    const units = {};
    section.querySelectorAll("[data-unit]").forEach((element) => { units[element.dataset.unit] = element; });
    const pad = (value) => String(value).padStart(2, "0");
    let timer = null;

    const tick = () => {
      const remaining = target - Date.now();
      if (remaining <= 0) {
        grid.hidden = true;
        done.hidden = false;
        clearInterval(timer);
        return;
      }
      const seconds = Math.floor(remaining / 1000);
      units.days.textContent = String(Math.floor(seconds / 86400));
      units.hours.textContent = pad(Math.floor(seconds / 3600) % 24);
      units.minutes.textContent = pad(Math.floor(seconds / 60) % 60);
      units.seconds.textContent = pad(seconds % 60);
    };
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ───────── Events (built from config.events) ───────── */

  function renderEvents() {
    const section = document.querySelector(".events");
    const template = document.getElementById("eventTemplate");
    const events = Array.isArray(config.events) ? config.events : [];
    if (!section || !template || !events.length) return;
    const list = section.querySelector(".events__list");
    const dates = config.dates || {};
    const year = dates.year || 2026;
    const zone = dates.timezone || "Asia/Kolkata";
    const mapLabel = (config.copy || {}).eventMapButton || "Directions";
    const assets = config.assets || {};
    const pad = (value) => String(value).padStart(2, "0");

    events.forEach((event) => {
      const item = template.content.firstElementChild.cloneNode(true);
      const [hours, minutes] = String(event.startTime || "00:00").split(":").map(Number);
      // Wall-clock values in the venue's time zone, formatted without converting to the viewer's.
      const wall = new Date(Date.UTC(year, event.month - 1, event.day, hours, minutes));
      const format = (options) => wall.toLocaleString("en-GB", { timeZone: "UTC", ...options });
      const time = item.querySelector("time");
      time.dateTime = `${year}-${pad(event.month)}-${pad(event.day)}T${pad(hours)}:${pad(minutes)}`;
      time.querySelector(".event__date").textContent = format({ weekday: "long", day: "numeric", month: "long" });
      time.querySelector(".event__time").textContent = format({ hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
      time.title = zone;

      item.classList.add(`event--${event.palette || event.id}`);
      item.id = `event-${event.id}`;
      item.querySelector(".event__title").textContent = event.title || "";
      item.querySelector(".event__venue").textContent = event.venue || "";
      const subtitle = item.querySelector(".event__subtitle");
      if (event.subtitle) { subtitle.textContent = event.subtitle; subtitle.hidden = false; }

      const image = item.querySelector(".event__img");
      if (event.image) { image.src = event.image; image.alt = event.alt || ""; }
      else item.querySelector(".event__art").remove();

      const divider = item.querySelector(".event__divider");
      if (assets.eventDivider) divider.src = assets.eventDivider;
      else divider.remove();

      const attire = item.querySelector(".event__attire");
      if (event.attire) {
        attire.querySelector(".event__attire-label").textContent = `${(config.copy || {}).dressCodeLabel || "Dress code"}:`;
        attire.querySelector(".event__attire-text").textContent = event.attire;
      } else attire.remove();

      const map = item.querySelector(".event__map");
      if (event.mapUrl) { map.href = event.mapUrl; map.textContent = mapLabel; map.hidden = false; }
      else map.remove(); // no URL, no action

      list.append(item);
    });
    section.hidden = false;
  }

  /* ───────── Setting reveals ───────── */

  let observeReveals = () => {};

  function initReveals() {
    const targets = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!("IntersectionObserver" in window) || prefersReducedMotion()) return; // content stays visible
    root.classList.add("reveal-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 }
    );
    // Observe only once the cover is gone, so the scene's entrance is actually seen.
    observeReveals = () => {
      targets.forEach((target) => observer.observe(target));
      observeReveals = () => {};
    };
  }

  /* ───────── Boot ───────── */

  applyTheme();
  applyContent();
  lockPage();
  setState("loading");
  initCountdown();
  renderEvents(); // before initReveals, so the new [data-reveal] items are observed

  // Maps CTA: points at venue.campusMapUrl once it is filled in.
  const mapLink = document.getElementById("mapLink");
  const mapUrl = (config.venue || {}).campusMapUrl;
  if (mapLink && mapUrl) mapLink.href = mapUrl;

  // RSVP: optional note under the embroidered heading.
  const rsvpNote = document.querySelector(".rsvp__note");
  if (rsvpNote && (config.rsvp || {}).note) rsvpNote.hidden = false;
  initReveals();

  bowButton.addEventListener("click", () => startOpening());
  skipButton.addEventListener("click", skip);
  cover.addEventListener("keydown", (event) => {
    if (event.key === "Escape") skip();
    if (event.key !== "Tab" || state === "opened") return;
    // Keep focus within the cover while it is showing.
    const focusable = [bowButton, skipButton].filter((button) => !button.closest(".is-opening") || button === skipButton);
    const index = focusable.indexOf(document.activeElement);
    const next = focusable[(index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length];
    event.preventDefault();
    next.focus();
  });

  if (debug) {
    replayButton.hidden = false;
    replayButton.addEventListener("click", resetCover);
  }
  // Development only: ?opened starts past the cover, ?scene=setting also scrolls to the Mantap.
  const params = new URLSearchParams(location.search);
  if (params.has("opened") || params.has("scene")) {
    skip();
    if (params.get("scene") === "setting") {
      root.classList.remove("reveal-ready");
      requestAnimationFrame(() => document.querySelector(".setting").scrollIntoView());
    }
  }

  window.addEventListener("resize", () => {
    if (state === "opened") fitHeroText();
  });

  prepare();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeroText);
  window.addEventListener("load", fitHeroText);
  window.inviteBooted = true;
})();
