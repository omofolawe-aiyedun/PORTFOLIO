(function () {
  function setupImageSkeletons() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));
    var lazyObserver = "IntersectionObserver" in window ? new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          start(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "320px 0px" }) : null;

    function finish(image, state) {
      image.classList.remove("is-image-loading");
      image.classList.toggle("is-image-error", state === "error");
      image.setAttribute("data-image-state", state);
    }
    function start(image) {
      if (image.complete) {
        finish(image, image.naturalWidth > 0 ? "loaded" : "error");
        return;
      }
      image.classList.add("is-image-loading");
      image.setAttribute("data-image-state", "loading");
      image.addEventListener("load", function () { finish(image, "loaded"); }, { once: true });
      image.addEventListener("error", function () { finish(image, "error"); }, { once: true });
    }
    images.forEach(function (image) {
      if (image.loading === "lazy" && lazyObserver) {
        if (image.complete && image.naturalWidth > 0) {
          finish(image, "loaded");
          return;
        }
        image.addEventListener("load", function () { finish(image, "loaded"); }, { once: true });
        image.addEventListener("error", function () { finish(image, "error"); }, { once: true });
        lazyObserver.observe(image);
      } else if (image.complete) {
        finish(image, image.naturalWidth > 0 ? "loaded" : "error");
      } else {
        start(image);
      }
    });
  }
  setupImageSkeletons();

  function setupBackgroundSkeletons() {
    Array.prototype.forEach.call(document.querySelectorAll(".hero, .page-hero"), function (section) {
      var match = window.getComputedStyle(section).backgroundImage.match(/url\((?:"|')?([^"')]+)(?:"|')?\)/);
      if (!match) return;
      var probe = new Image();
      function finish(success) {
        section.classList.remove("is-background-loading");
        section.classList.toggle("is-background-error", !success);
      }
      section.classList.add("is-background-loading");
      probe.onload = function () { finish(true); };
      probe.onerror = function () { finish(false); };
      probe.src = match[1];
      if (probe.complete) finish(probe.naturalWidth > 0);
    });
  }
  setupBackgroundSkeletons();

  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll(".hero > div:not(.hero-overlay), .section-header, .split > *, .feature-grid > *, .menu-grid > *, .gallery-grid > *, .info-grid > *, .form-card, .hours-card, .page-hero");
    var observer = new IntersectionObserver(function (entries, activeObserver) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          activeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -28px 0px" });

    Array.prototype.forEach.call(targets, function (target, index) {
      target.classList.add("motion-reveal");
      target.style.setProperty("--motion-delay", String((index % 3) * 60) + "ms");
      observer.observe(target);
    });
  }

  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    function closeMenu() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open pages");
    }

    toggle.addEventListener("click", function () {
      toggle.setAttribute("aria-label", nav.classList.contains("is-open") ? "Close pages" : "Open pages");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (event) {
      if (nav.classList.contains("is-open") && !nav.contains(event.target) && !toggle.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860 && nav.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  var progressQueued = false;
  function updateScrollProgress() {
    if (progressQueued) return;
    progressQueued = true;
    window.requestAnimationFrame(function () {
      var root = document.documentElement;
      var maxScroll = Math.max(root.scrollHeight - window.innerHeight, 0);
      var progress = maxScroll ? Math.min(1, window.scrollY / maxScroll) : 0;
      root.style.setProperty("--scroll-progress", progress.toFixed(4));
      progressQueued = false;
    });
  }
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress, { passive: true });
  updateScrollProgress();
})();
