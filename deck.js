/* ============================================================
   AI for Developers — deck navigation
   Vanilla JS, no dependencies. Handles: nav, deep-linking,
   progress, speaker notes, overview grid, help, fullscreen, swipe.
   ============================================================ */
(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const total  = slides.length;
  let current  = 0;

  // chrome elements
  const bar        = document.getElementById("progress-bar");
  const curEl      = document.getElementById("cur");
  const totalEl    = document.getElementById("total");
  const notesPanel = document.getElementById("notes-panel");
  const notesBody  = document.getElementById("notes-content");
  const overview   = document.getElementById("overview");
  const ovGrid     = document.getElementById("overview-grid");
  const help       = document.getElementById("help");
  const menuBtn    = document.getElementById("menu-btn");

  totalEl.textContent = total;

  /* ---------- core navigation ---------- */
  function show(i, push) {
    current = Math.max(0, Math.min(total - 1, i));
    slides.forEach((s, idx) => s.classList.toggle("active", idx === current));

    // each slide starts at the top (slides scroll vertically on small screens)
    slides[current].scrollTop = 0;

    bar.style.width = (total > 1 ? (current / (total - 1)) * 100 : 100) + "%";
    curEl.textContent = current + 1;

    // sync speaker notes if open
    const note = slides[current].querySelector(".notes");
    notesBody.textContent = note ? note.textContent.trim() : "(no notes for this slide)";

    // highlight current card in overview
    if (!overview.hidden) markOverviewCurrent();

    // deep-link: #/<n> (1-based)
    if (push !== false) {
      const hash = "#/" + (current + 1);
      if (location.hash !== hash) history.replaceState(null, "", hash);
    }
  }

  const next = () => show(current + 1);
  const prev = () => show(current - 1);

  /* ---------- overlays ---------- */
  function toggleNotes()    { notesPanel.hidden = !notesPanel.hidden; if (!notesPanel.hidden) show(current, false); }
  function closeOverlays()  { notesPanel.hidden = true; overview.hidden = true; help.hidden = true; }

  function toggleHelp() {
    const willOpen = help.hidden;
    closeOverlays();
    help.hidden = !willOpen;
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  /* ---------- overview grid ---------- */
  function buildOverview() {
    ovGrid.innerHTML = "";
    slides.forEach((s, idx) => {
      const title = s.dataset.title || "Slide " + (idx + 1);
      const card = document.createElement("div");
      card.className = "ov-card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Go to slide " + (idx + 1) + ": " + title);
      card.innerHTML =
        '<span class="ov-card__n">' + String(idx + 1).padStart(2, "0") + "</span>" +
        '<span class="ov-card__t">' + title + "</span>";
      const go = () => { overview.hidden = true; show(idx); };
      card.addEventListener("click", go);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
      ovGrid.appendChild(card);
    });
  }
  function markOverviewCurrent() {
    Array.from(ovGrid.children).forEach((c, idx) => c.classList.toggle("current", idx === current));
  }
  function toggleOverview() {
    const willOpen = overview.hidden;
    closeOverlays();
    if (willOpen) {
      overview.hidden = false;
      markOverviewCurrent();
      // land keyboard focus on the current slide's card so it's reachable
      ovGrid.children[current]?.focus();
    }
  }

  /* ---------- keyboard ---------- */
  document.addEventListener("keydown", (e) => {
    // let modifier combos (copy, devtools, etc.) pass through
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    // While a modal overlay is open, don't drive the slides underneath it.
    // Esc closes it; its own toggle key still works; focused cards handle
    // Enter/Space themselves. (Notes panel is exempt — it follows the slide.)
    if (!overview.hidden || !help.hidden) {
      switch (e.key) {
        case "Escape": e.preventDefault(); closeOverlays(); break;
        case "o": case "O": e.preventDefault(); toggleOverview(); break;
        case "?": e.preventDefault(); toggleHelp(); break;
      }
      return;
    }

    switch (e.key) {
      case "ArrowRight": case " ": case "PageDown":
        e.preventDefault(); next(); break;
      case "ArrowLeft": case "PageUp":
        e.preventDefault(); prev(); break;
      case "Home": e.preventDefault(); show(0); break;
      case "End":  e.preventDefault(); show(total - 1); break;
      case "n": case "N": toggleNotes(); break;
      case "o": case "O": toggleOverview(); break;
      case "f": case "F": toggleFullscreen(); break;
      case "?": toggleHelp(); break;
      case "Escape": closeOverlays(); break;
    }
  });

  /* ---------- mouse / touch ---------- */
  document.getElementById("nav-next").addEventListener("click", next);
  document.getElementById("nav-prev").addEventListener("click", prev);
  if (menuBtn) menuBtn.addEventListener("click", toggleOverview);
  [overview, help].forEach((el) =>
    el.addEventListener("click", (e) => { if (e.target === el) closeOverlays(); })
  );

  let touchX = null, touchY = null;
  document.addEventListener("touchstart", (e) => {
    // ignore pinch-zoom, and gestures that belong to scrollable code blocks or
    // open overlays (so those scroll/interact instead of flipping slides)
    if (e.touches.length > 1 || e.target.closest(".code, #overview, #notes-panel, #help")) {
      touchX = null; return;
    }
    touchX = e.changedTouches[0].clientX;
    touchY = e.changedTouches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
    touchX = touchY = null;
  }, { passive: true });

  /* ---------- deep-linking ---------- */
  function fromHash() {
    const m = /#\/?(\d+)/.exec(location.hash);
    return m ? parseInt(m[1], 10) - 1 : 0;
  }
  window.addEventListener("hashchange", () => {
    const i = fromHash();
    if (i !== current) show(i, false);
  });

  /* ---------- init ---------- */
  buildOverview();
  show(fromHash(), false);
})();
