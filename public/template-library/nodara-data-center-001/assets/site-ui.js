(() => {
  "use strict";
  let started = false;
  let dispose = () => {};
  const memory = { heroPaused: false, heroOptIn: false, tickerPaused: false };
  function boot() {
    if (started) dispose();

    const events = new AbortController();
    const eventOptions = { signal: events.signal };
    const observers = [];
    const timers = new Set();
    const mediaPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const connection = navigator.connection;
    const prefersLessMotion = () =>
      mediaPreference.matches || Boolean(connection?.saveData);
    const later = (callback, duration) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, duration);
      timers.add(timer);
      return timer;
    };
    const visible = (element) =>
      Boolean(element?.isConnected && element.getClientRects().length);

    // The header changes once the hero passes beneath the fixed navigation.
    const header = document.querySelector("#site-header");
    const hero =
      document.querySelector("#hero") ||
      document.querySelector("#hero-video")?.closest("section");
    let headerObserver;
    let headerHeight = -1;
    const observeHeader = () => {
      if (!header || !hero) return;
      const height = Math.ceil(header.getBoundingClientRect().height);
      if (height === headerHeight) return;
      headerHeight = height;
      headerObserver?.disconnect();
      header.classList.toggle(
        "is-scrolled",
        hero.getBoundingClientRect().bottom <= height,
      );
      if (!("IntersectionObserver" in window)) return;
      headerObserver = new IntersectionObserver(
        ([entry]) => {
          header.classList.toggle(
            "is-scrolled",
            !entry.isIntersecting && entry.boundingClientRect.bottom <= height,
          );
        },
        { rootMargin: `-${height}px 0px 0px 0px`, threshold: 0 },
      );
      headerObserver.observe(hero);
    };
    observeHeader();
    if (header && "ResizeObserver" in window) {
      const observer = new ResizeObserver(observeHeader);
      observer.observe(header);
      observers.push(observer);
    }

    // Menu state remains separate from native dialog state.
    const menu = document.querySelector("#services-menu");
    const menuToggles = [...document.querySelectorAll("[data-menu-toggle]")];
    let menuOpener = null;
    const closeMenu = (returnFocus = false) => {
      if (!menu) return;
      menu.hidden = true;
      menu.classList.remove("is-open");
      header?.classList.remove("is-menu-open");
      menuToggles.forEach((toggle) =>
        toggle.setAttribute("aria-expanded", "false"),
      );
      if (returnFocus && visible(menuOpener)) menuOpener.focus();
    };
    const openMenu = (opener) => {
      if (!menu) return;
      menuOpener = opener;
      menu.hidden = false;
      menu.classList.add("is-open");
      header?.classList.add("is-menu-open");
      menuToggles.forEach((toggle) =>
        toggle.setAttribute("aria-expanded", "true"),
      );
    };
    closeMenu();
    menuToggles.forEach((toggle) => {
      toggle.addEventListener(
        "click",
        () => {
          if (menu?.hidden) openMenu(toggle);
          else closeMenu();
        },
        eventOptions,
      );
      toggle.addEventListener(
        "keydown",
        (event) => {
          if (event.key !== "ArrowDown" || !menu) return;
          event.preventDefault();
          openMenu(toggle);
          menu.querySelector("a, button, [tabindex='0']")?.focus();
        },
        eventOptions,
      );
    });
    document.addEventListener(
      "pointerdown",
      (event) => {
        if (
          menu?.hidden ||
          menu?.contains(event.target) ||
          menuToggles.some((toggle) => toggle.contains(event.target))
        )
          return;
        closeMenu();
      },
      eventOptions,
    );
    document.addEventListener(
      "focusin",
      (event) => {
        if (
          menu?.hidden ||
          menu?.contains(event.target) ||
          menuToggles.some((toggle) => toggle.contains(event.target))
        )
          return;
        closeMenu();
      },
      eventOptions,
    );
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" && menu && !menu.hidden) {
          event.preventDefault();
          closeMenu(true);
        }
      },
      eventOptions,
    );

    const dialogs = [...document.querySelectorAll("dialog")];
    const returnTargets = new WeakMap();
    const mobileMenu = document.querySelector("#mobile-menu");
    const consultation = document.querySelector("#consultation-dialog");
    const mobileToggle = document.querySelector("#mobile-menu-toggle");
    let savedOverflow = null;
    const syncDialogLock = () => {
      const hasOpenDialog = dialogs.some((dialog) => dialog.open);
      if (hasOpenDialog && savedOverflow === null) {
        savedOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";
        document.documentElement.classList.add("dialog-open");
      } else if (!hasOpenDialog && savedOverflow !== null) {
        document.documentElement.style.overflow = savedOverflow;
        savedOverflow = null;
        document.documentElement.classList.remove("dialog-open");
      }
      mobileToggle?.setAttribute(
        "aria-expanded",
        String(Boolean(mobileMenu?.open)),
      );
    };
    const openDialog = (dialog, opener) => {
      if (!(dialog instanceof HTMLDialogElement)) return;
      closeMenu();
      if (dialog.open) return;
      returnTargets.set(dialog, opener || document.activeElement);
      dialog.showModal();
      syncDialogLock();
    };
    const closeDialog = (dialog) => {
      if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;
      dialog.close();
      syncDialogLock();
    };
    syncDialogLock();
    mobileToggle?.addEventListener(
      "click",
      () => openDialog(mobileMenu, mobileToggle),
      eventOptions,
    );
    dialogs.forEach((dialog) => {
      dialog.addEventListener(
        "close",
        () => {
          syncDialogLock();
          if (dialogs.some((item) => item.open)) return;
          const target = returnTargets.get(dialog);
          if (visible(target)) target.focus({ preventScroll: true });
          else if (visible(mobileToggle))
            mobileToggle.focus({ preventScroll: true });
        },
        eventOptions,
      );
      dialog.addEventListener(
        "click",
        (event) => {
          if (event.target !== dialog) return;
          const box = dialog.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            closeDialog(dialog);
        },
        eventOptions,
      );
    });
    document.addEventListener(
      "click",
      (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) return;
        const close = target.closest("[data-close-dialog]");
        if (close) {
          closeDialog(
            close.closest("dialog") ||
              document.getElementById(close.getAttribute("data-close-dialog")),
          );
          return;
        }
        const consult = target.closest("[data-consult]");
        if (consult) {
          event.preventDefault();
          const service = consult.getAttribute("data-service");
          const serviceField = document.querySelector("#request-service");
          if (
            service &&
            serviceField instanceof HTMLSelectElement &&
            [...serviceField.options].some((option) => option.value === service)
          ) {
            if (serviceField.value !== service) clearDraft();
            serviceField.value = service;
            serviceField.setCustomValidity("");
          }
          closeDialog(mobileMenu);
          openDialog(consultation, consult);
          return;
        }
        if (target.closest("a[href]") && target.closest("#mobile-menu"))
          closeDialog(mobileMenu);
        if (target.closest("a[href]") && target.closest("#services-menu"))
          closeMenu();
      },
      eventOptions,
    );
    const desktopMenuQuery = window.matchMedia("(min-width: 1024px)");
    desktopMenuQuery.addEventListener(
      "change",
      (event) => {
        closeMenu();
        if (event.matches) closeDialog(mobileMenu);
      },
      eventOptions,
    );

    // Autoplay is conditional; an explicit visitor choice can opt back into motion.
    const video = document.querySelector("#hero-video");
    const heroToggle = document.querySelector("#hero-motion-toggle");
    const heroLabel = heroToggle?.querySelector("[data-motion-label]");
    let heroVisible = true;
    let heroPausedByVisitor = memory.heroPaused;
    let heroMotionOptIn = memory.heroOptIn;
    let heroPlayPending = null;
    let heroUnavailable = false;
    const setHeroLabel = (text) => {
      if (heroLabel) heroLabel.textContent = text;
      else if (heroToggle) heroToggle.textContent = text;
      heroToggle?.setAttribute(
        "aria-label",
        text === "Video tidak tersedia" ? text : `${text} latar`,
      );
    };
    const refreshHero = () => {
      if (!(video instanceof HTMLVideoElement)) return;
      const designerEnabled =
        hero?.dataset.videoEnabled !== "false" &&
        video.dataset.videoEnabled !== "false";
      const blocked =
        !designerEnabled || (prefersLessMotion() && !heroMotionOptIn);
      const paused = heroPausedByVisitor || blocked || heroUnavailable;
      video.dataset.userPlay = String(heroMotionOptIn);
      video.hidden = blocked || heroUnavailable;
      video.autoplay = !blocked;
      hero?.classList.toggle("is-motion-paused", paused);
      heroToggle?.setAttribute("aria-pressed", String(paused));
      if (heroToggle) {
        heroToggle.disabled = heroUnavailable;
        heroToggle.hidden = !designerEnabled;
      }
      setHeroLabel(
        heroUnavailable
          ? "Video tidak tersedia"
          : paused
            ? "Putar video"
            : "Jeda video",
      );
      const shouldPlay = !paused && heroVisible && !document.hidden;
      if (!shouldPlay) {
        video.pause();
        return;
      }
      if (!video.paused || heroPlayPending) return;
      heroPlayPending = video.play();
      if (heroPlayPending?.catch) {
        heroPlayPending
          .catch((error) => {
            if (events.signal.aborted) return;
            if (
              error?.name === "AbortError" ||
              !heroVisible ||
              document.hidden ||
              (prefersLessMotion() && !heroMotionOptIn)
            )
              return;
            heroPausedByVisitor = true;
            refreshHero();
          })
          .finally(() => {
            heroPlayPending = null;
            if (
              !events.signal.aborted &&
              !heroPausedByVisitor &&
              heroVisible &&
              !document.hidden &&
              !(prefersLessMotion() && !heroMotionOptIn) &&
              !heroUnavailable
            )
              refreshHero();
          });
      } else heroPlayPending = null;
    };
    if (video instanceof HTMLVideoElement) {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.addEventListener(
        "error",
        () => {
          heroUnavailable = true;
          refreshHero();
        },
        eventOptions,
      );
      video.addEventListener(
        "loadeddata",
        () => {
          heroUnavailable = false;
          refreshHero();
        },
        eventOptions,
      );
      heroToggle?.addEventListener(
        "click",
        () => {
          if (
            heroPausedByVisitor ||
            (prefersLessMotion() && !heroMotionOptIn)
          ) {
            heroPausedByVisitor = false;
            heroMotionOptIn = true;
          } else heroPausedByVisitor = true;
          memory.heroPaused = heroPausedByVisitor;
          memory.heroOptIn = heroMotionOptIn;
          refreshHero();
        },
        eventOptions,
      );
      if (hero && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            heroVisible = entry.isIntersecting;
            refreshHero();
          },
          { threshold: 0.01 },
        );
        observer.observe(hero);
        observers.push(observer);
      }
      document.addEventListener("visibilitychange", refreshHero, eventOptions);
      refreshHero();
    }

    // The image stage follows the reading position without a continuous scroll listener.
    const chapters = [
      ...document.querySelectorAll(".story-chapter[data-chapter]"),
    ];
    const chapterLinks = [...document.querySelectorAll("[data-chapter-link]")];
    const storyLayers = [
      ...document.querySelectorAll(".story-layer[data-story-image]"),
    ];
    const activateChapter = (index) => {
      chapters.forEach((chapter) =>
        chapter.classList.toggle(
          "is-active",
          chapter.dataset.chapter === String(index),
        ),
      );
      chapterLinks.forEach((link) => {
        const active = link.dataset.chapterLink === String(index);
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "step");
        else link.removeAttribute("aria-current");
      });
      storyLayers.forEach((layer) => {
        const active = layer.dataset.storyImage === String(index);
        layer.classList.toggle("is-active", active);
        layer.setAttribute("aria-hidden", String(!active));
      });
      document
        .querySelector("#layanan")
        ?.setAttribute("data-active-chapter", String(index));
    };
    activateChapter(0);
    let chapterObserver;
    const updateChapter = () => {
      const readingLine = window.innerHeight * 0.35;
      const positions = chapters.map((chapter) => ({
        chapter,
        box: chapter.getBoundingClientRect(),
      }));
      const crossing = positions.find(
        ({ box }) => box.top <= readingLine && box.bottom > readingLine,
      );
      const nearest =
        crossing ||
        positions
          .filter(
            ({ box }) =>
              box.bottom > headerHeight && box.top < window.innerHeight,
          )
          .sort(
            (a, b) =>
              Math.abs(a.box.top - readingLine) -
              Math.abs(b.box.top - readingLine),
          )[0];
      if (nearest) activateChapter(nearest.chapter.dataset.chapter);
    };
    if (chapters.length && "IntersectionObserver" in window) {
      const observeChapters = () => {
        chapterObserver?.disconnect();
        const top = Math.round(window.innerHeight * 0.35);
        // Pixel margins keep the reading band tied to viewport height at every aspect ratio.
        chapterObserver = new IntersectionObserver(updateChapter, {
          rootMargin: `-${top}px 0px -${Math.max(0, window.innerHeight - top - 1)}px 0px`,
          threshold: 0,
        });
        chapters.forEach((chapter) => chapterObserver.observe(chapter));
        updateChapter();
      };
      observeChapters();
      observers.push({ disconnect: () => chapterObserver?.disconnect() });
      window.addEventListener("resize", observeChapters, eventOptions);
    }
    chapterLinks.forEach((link) => {
      link.addEventListener(
        "click",
        () => activateChapter(link.dataset.chapterLink),
        eventOptions,
      );
    });

    // SSR content and the first viewport stay visible. Only unseen content is armed.
    const revealElements = [...document.querySelectorAll("[data-reveal]")];
    let revealObserver;
    const reveal = (element) => {
      element.classList.remove("reveal-pending");
      element.classList.add("is-revealed");
      revealObserver?.unobserve(element);
    };
    const revealAll = () => revealElements.forEach(reveal);
    if (
      window.parent !== window ||
      prefersLessMotion() ||
      !("IntersectionObserver" in window)
    )
      revealAll();
    else {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) reveal(entry.target);
          });
        },
        { rootMargin: "0px 0px -32px 0px", threshold: 0.08 },
      );
      revealElements.forEach((element) => {
        if (element.getBoundingClientRect().top < window.innerHeight)
          reveal(element);
        else {
          element.classList.add("reveal-pending");
          revealObserver.observe(element);
        }
      });
      observers.push(revealObserver);
    }
    document.addEventListener(
      "focusin",
      (event) => {
        if (!(event.target instanceof Element)) return;
        let element = event.target.closest("[data-reveal]");
        while (element) {
          reveal(element);
          element = element.parentElement?.closest("[data-reveal]");
        }
      },
      eventOptions,
    );

    const ticker = document.querySelector(".ticker-track");
    const tickerToggle = document.querySelector("#ticker-toggle");
    const tickerLabel = tickerToggle?.querySelector("[data-ticker-label]");
    let tickerPausedByVisitor = memory.tickerPaused;
    let tickerFocused = false;
    const refreshTicker = () => {
      if (!ticker) return;
      const blocked = prefersLessMotion();
      const paused = tickerPausedByVisitor || blocked;
      ticker.classList.toggle(
        "is-paused",
        paused || tickerFocused || document.hidden,
      );
      tickerToggle?.setAttribute("aria-pressed", String(paused));
      if (tickerToggle) tickerToggle.disabled = blocked;
      const text = blocked
        ? "Animasi teks dinonaktifkan"
        : paused
          ? "Lanjutkan teks layanan bergerak"
          : "Jeda teks layanan bergerak";
      if (tickerLabel) tickerLabel.textContent = text;
      else if (tickerToggle) tickerToggle.textContent = text;
      tickerToggle?.setAttribute("aria-label", text);
    };
    tickerToggle?.addEventListener(
      "click",
      () => {
        tickerPausedByVisitor = !tickerPausedByVisitor;
        memory.tickerPaused = tickerPausedByVisitor;
        refreshTicker();
      },
      eventOptions,
    );
    const tickerRegion = ticker?.closest(".ticker") || ticker?.parentElement;
    [tickerRegion, tickerToggle].filter(Boolean).forEach((element) => {
      element.addEventListener(
        "focusin",
        () => {
          tickerFocused = true;
          refreshTicker();
        },
        eventOptions,
      );
      element.addEventListener(
        "focusout",
        (event) => {
          if (
            tickerRegion?.contains(event.relatedTarget) ||
            tickerToggle?.contains(event.relatedTarget)
          )
            return;
          tickerFocused = false;
          refreshTicker();
        },
        eventOptions,
      );
    });
    document.addEventListener("visibilitychange", refreshTicker, eventOptions);
    refreshTicker();
    const policyChanged = () => {
      heroMotionOptIn = false;
      memory.heroOptIn = false;
      if (prefersLessMotion()) revealAll();
      refreshHero();
      refreshTicker();
    };
    mediaPreference.addEventListener("change", policyChanged, eventOptions);
    connection?.addEventListener?.("change", policyChanged, eventOptions);
    document.addEventListener("nodara:policy", refreshHero, eventOptions);

    // This demonstration prepares a local draft; it never sends a request.
    const form = document.querySelector("#consultation-form");
    const result = document.querySelector("#consultation-result");
    const summaryField = document.querySelector("#request-summary");
    const formStatus = document.querySelector("#form-status");
    const copyRequest = document.querySelector("#copy-request");
    const downloadRequest = document.querySelector("#download-request");
    let summary =
      result && !result.hidden && summaryField ? summaryField.value : "";
    const announce = (text) => {
      if (formStatus) formStatus.textContent = text;
    };
    const clearDraft = () => {
      if (!summary) return;
      summary = "";
      if (summaryField) summaryField.value = "";
      if (result) result.hidden = true;
      announce("Form berubah. Buat ringkasan lagi untuk memasukkan perubahan.");
    };
    if (form instanceof HTMLFormElement) {
      form.addEventListener(
        "input",
        (event) => {
          event.target.setCustomValidity?.("");
          clearDraft();
        },
        eventOptions,
      );
      form.addEventListener(
        "change",
        (event) => {
          event.target.setCustomValidity?.("");
          clearDraft();
        },
        eventOptions,
      );
      form.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();
          [...form.querySelectorAll("[required]")].forEach((field) => {
            field.setCustomValidity?.(
              String(field.value).trim() ? "" : "Lengkapi bidang ini.",
            );
          });
          if (!form.reportValidity()) return;
          const values = new FormData(form);
          const value = (name) => String(values.get(name) || "").trim();
          const businessName =
            document
              .querySelector('[data-bind="business.name"]')
              ?.textContent?.trim() || "Bisnis";
          const detail = {
            templateId: "nodara-data-center-001",
            formId: "infrastructure-consultation",
            values: Object.fromEntries(
              ["name", "company", "email", "service", "message"].map((name) => [
                name,
                value(name),
              ]),
            ),
          };
          form.dispatchEvent(
            new CustomEvent("pagiverse:form-submit", {
              bubbles: true,
              cancelable: true,
              detail,
            }),
          );
          if (window.parent !== window)
            window.parent.postMessage(
              { type: "pagiverse:form-submit", ...detail },
              window.location.origin,
            );
          summary = [
            `Permintaan konsultasi ${businessName}`,
            "",
            `Nama: ${value("name")}`,
            `Perusahaan: ${value("company") || "Belum diisi"}`,
            `Email: ${value("email")}`,
            `Layanan: ${value("service")}`,
            "",
            "Kebutuhan:",
            value("message") || "Belum diisi",
            "",
            `Draft permintaan. Belum dikirim ke ${businessName}.`,
          ].join("\n");
          if (summaryField) summaryField.value = summary;
          if (result) result.hidden = false;
          announce(
            "Ringkasan siap. Belum ada data yang dikirim. Salin atau unduh untuk ditinjau.",
          );
          summaryField?.focus({ preventScroll: true });
          result?.scrollIntoView({
            behavior: prefersLessMotion() ? "instant" : "smooth",
            block: "nearest",
          });
        },
        eventOptions,
      );
    }
    copyRequest?.addEventListener(
      "click",
      async () => {
        if (!summary) return;
        let copied = false;
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(summary);
            copied = true;
          }
        } catch {
          // A selected local text field also supports browser clipboard restrictions.
        }
        if (!copied && summaryField) {
          summaryField.focus();
          summaryField.select();
          try {
            copied = document.execCommand("copy");
          } catch {
            copied = false;
          }
        }
        announce(
          copied
            ? "Ringkasan disalin. Permintaan belum dikirim."
            : "Teks ringkasan dipilih. Salin dengan Ctrl+C atau Command+C.",
        );
        if (copied) copyRequest.focus({ preventScroll: true });
      },
      eventOptions,
    );
    downloadRequest?.addEventListener(
      "click",
      () => {
        if (!summary) return;
        const url = URL.createObjectURL(
          new Blob(["\uFEFF", summary], { type: "text/plain;charset=utf-8" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = "permintaan-konsultasi.txt";
        document.body.append(link);
        link.click();
        link.remove();
        later(() => URL.revokeObjectURL(url), 1000);
        announce(
          "File ringkasan dibuat di perangkatmu. Permintaan belum dikirim.",
        );
      },
      eventOptions,
    );

    window.addEventListener(
      "pagehide",
      (event) => {
        video?.pause();
        if (event.persisted) return;
        events.abort();
        headerObserver?.disconnect();
        observers.forEach((observer) => observer.disconnect());
        timers.forEach((timer) => window.clearTimeout(timer));
      },
      eventOptions,
    );
    window.addEventListener(
      "pageshow",
      () => {
        refreshHero();
        refreshTicker();
      },
      eventOptions,
    );
    dispose = () => {
      video?.pause();
      events.abort();
      headerObserver?.disconnect();
      observers.forEach((observer) => observer.disconnect());
      timers.forEach((timer) => window.clearTimeout(timer));
      revealElements.forEach((element) =>
        element.classList.remove("reveal-pending"),
      );
      if (savedOverflow !== null) {
        document.documentElement.style.overflow = savedOverflow;
        savedOverflow = null;
      }
      started = false;
    };
    started = true;
  }
  document.addEventListener("nodara:render", (event) => {
    if (!started || event.detail?.rebuildUI) boot();
  });
  window.setTimeout(() => {
    if (!started) boot();
  }, 1500);
})();
