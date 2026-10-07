/* KV Furniture — interactions. Vanilla JS. Restrained, premium motion. */
(function () {
  "use strict";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header state */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  document.querySelectorAll(".mobile-menu a").forEach(function (a) {
    a.addEventListener("click", function () { document.body.classList.remove("menu-open"); });
  });

  /* Active nav */
  try {
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
    });
  } catch (e) {}

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll("[data-reveal], .stagger");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* Hero image settle */
  window.addEventListener("load", function () {
    document.querySelectorAll(".hero-media").forEach(function (el) { el.classList.add("loaded"); });
  });
  setTimeout(function () {
    document.querySelectorAll(".hero-media").forEach(function (el) { el.classList.add("loaded"); });
  }, 1200);

  /* Gentle parallax (desktop, fine pointers only) */
  var pxEls = document.querySelectorAll("[data-parallax]");
  if (pxEls.length && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        pxEls.forEach(function (el) {
          var r = el.getBoundingClientRect();
          var mid = r.top + r.height / 2 - window.innerHeight / 2;
          var off = Math.max(-60, Math.min(60, mid * -0.06 * parseFloat(el.dataset.parallax || "1")));
          el.style.transform = "translateY(" + off.toFixed(1) + "px)";
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* Magnetic buttons (subtle, desktop only) */
  var magnets = document.querySelectorAll(".btn");
  if (!prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    magnets.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.08;
        var y = (e.clientY - r.top - r.height / 2) * 0.12;
        btn.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* Lazy video play/pause on visibility */
  var vids = document.querySelectorAll("video[data-lazy]");
  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        } else { v.pause(); }
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* Lightbox */
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    var lbCount = lb.querySelector(".lb-count");
    var galImgs = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox] img"));
    var idx = 0;
    function show(i) {
      if (!galImgs.length) return;
      idx = (i + galImgs.length) % galImgs.length;
      lbImg.src = galImgs[idx].src;
      lbImg.alt = galImgs[idx].alt || "KV Furniture gallery image";
      if (lbCount) lbCount.textContent = (idx + 1) + " / " + galImgs.length;
    }
    document.querySelectorAll("[data-lightbox]").forEach(function (fig, i) {
      fig.addEventListener("click", function () { lb.classList.add("open"); show(i); document.body.style.overflow = "hidden"; });
      fig.setAttribute("tabindex", "0");
      fig.addEventListener("keydown", function (e) { if (e.key === "Enter") { lb.classList.add("open"); show(i); document.body.style.overflow = "hidden"; } });
    });
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (o) {
        o.classList.remove("open"); o.querySelector(".faq-a").style.maxHeight = null;
        o.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* Animated counters (gentle) */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && !prefersReduced && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; cio.unobserve(el);
        var target = parseFloat(el.dataset.count);
        var suffix = el.dataset.suffix || "";
        var t0 = null, dur = 1400;
        function tick(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* Forms: validate + WhatsApp fallback */
  var WA_NUMBER = "919599275475";
  document.querySelectorAll("form[data-enquiry]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (input) {
        var field = input.closest(".field");
        var val = (input.value || "").trim();
        var ok = val.length > 0;
        if (ok && input.type === "tel") ok = /^[+\d][\d\s\-()]{7,}$/.test(val);
        if (ok && input.type === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        if (field) {
          field.classList.toggle("error", !ok);
          var msg = field.querySelector(".fmsg");
          if (msg) msg.textContent = ok ? "" : "Please complete this field correctly.";
        }
        if (!ok) valid = false;
      });
      if (!valid) {
        var firstErr = form.querySelector(".field.error input, .field.error select, .field.error textarea");
        if (firstErr) firstErr.focus();
        return;
      }
      var data = {};
      form.querySelectorAll("input, select, textarea").forEach(function (i) {
        if (i.name) data[i.name] = (i.value || "").trim();
      });
      var lines = ["Hello KV Furniture, I would like to discuss a design."];
      ["Name", "Phone", "Email", "City", "Furniture Type", "Requirement", "Dimensions", "Message"].forEach(function (k) {
        var key = k.toLowerCase().replace(/ /g, "_");
        var v = data[key] || data[k] || "";
        if (v) lines.push(k + ": " + v);
      });
      var url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      var okBox = form.parentElement.querySelector(".form-ok") || form.querySelector(".form-ok");
      if (okBox) okBox.classList.add("show");
      form.querySelector("button[type=submit]").textContent = "Opening WhatsApp…";
      setTimeout(function () { window.open(url, "_blank", "noopener"); }, 600);
    });
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field) { field.classList.remove("error"); var m = field.querySelector(".fmsg"); if (m) m.textContent = ""; }
      });
    });
  });

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
