document.documentElement.classList.add("js-enabled");

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
const menuLabel = document.querySelector(".menu-toggle-label");

function closePortfolioMenu(returnFocus) {
    if (!menuToggle || !siteNav) return;
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    if (menuLabel) menuLabel.textContent = "Menu";
    if (returnFocus) menuToggle.focus();
}

if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", function () {
        const isOpen = siteNav.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
        if (menuLabel) menuLabel.textContent = isOpen ? "Close" : "Menu";
        if (isOpen) {
            const firstLink = siteNav.querySelector("a");
            if (firstLink) firstLink.focus();
        }
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () { closePortfolioMenu(false); });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
            closePortfolioMenu(true);
        }
    });

    document.addEventListener("click", function (event) {
        const outside = !siteNav.contains(event.target) && !menuToggle.contains(event.target);
        if (outside && siteNav.classList.contains("is-open")) closePortfolioMenu(false);
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 800 && siteNav.classList.contains("is-open")) closePortfolioMenu(false);
    });
}

const year = document.querySelector("[data-current-year]");
if (year) year.textContent = new Date().getFullYear();

function initializeImageSkeletons() {
    const images = Array.from(document.querySelectorAll("img"));
    const lazyObserver = "IntersectionObserver" in window ? new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                beginImageLoading(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: "320px 0px" }) : null;

    function settleImage(image, state) {
        image.classList.remove("is-image-loading");
        image.classList.toggle("is-image-error", state === "error");
        image.dataset.imageState = state;
    }

    function beginImageLoading(image) {
        if (image.complete) {
            settleImage(image, image.naturalWidth > 0 ? "loaded" : "error");
            return;
        }
        image.classList.add("is-image-loading");
        image.dataset.imageState = "loading";
        image.addEventListener("load", function () { settleImage(image, "loaded"); }, { once: true });
        image.addEventListener("error", function () { settleImage(image, "error"); }, { once: true });
    }

    images.forEach(function (image) {
        if (image.loading === "lazy" && lazyObserver) {
            if (image.complete && image.naturalWidth > 0) {
                settleImage(image, "loaded");
                return;
            }
            image.addEventListener("load", function () { settleImage(image, "loaded"); }, { once: true });
            image.addEventListener("error", function () { settleImage(image, "error"); }, { once: true });
            lazyObserver.observe(image);
        } else if (image.complete) {
            settleImage(image, image.naturalWidth > 0 ? "loaded" : "error");
        } else {
            beginImageLoading(image);
        }
    });
}
initializeImageSkeletons();

function initializeBackgroundSkeletons() {
    document.querySelectorAll(".hero, .page-hero").forEach(function (section) {
        const match = window.getComputedStyle(section).backgroundImage.match(/url\((?:"|')?([^"')]+)(?:"|')?\)/);
        if (!match) return;
        const probe = new Image();
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
initializeBackgroundSkeletons();

const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const selectors = [
        "main > section", ".hero-content", ".page-intro", ".project-card", ".card", ".panel", ".step",
        ".contact-list > li", ".contact-form > *", ".site-footer > *"
    ].join(", ");
    const targets = document.querySelectorAll(selectors);
    const variants = ["reveal-rise", "reveal-left", "reveal-right", "reveal-zoom"];
    const observer = new IntersectionObserver(function (entries, activeObserver) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                activeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -28px 0px" });

    targets.forEach(function (target, index) {
        target.classList.add("reveal-on-scroll", variants[index % variants.length]);
        target.style.setProperty("--reveal-delay", String((index % 4) * 55) + "ms");
        observer.observe(target);
    });
}

let progressQueued = false;
function updateScrollProgress() {
    if (progressQueued) return;
    progressQueued = true;
    window.requestAnimationFrame(function () {
        const root = document.documentElement;
        const maxScroll = Math.max(root.scrollHeight - window.innerHeight, 0);
        const progress = maxScroll ? Math.min(100, (window.scrollY / maxScroll) * 100) : 0;
        root.style.setProperty("--scroll-progress", (progress / 100).toFixed(4));
        progressQueued = false;
    });
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress, { passive: true });
updateScrollProgress();
