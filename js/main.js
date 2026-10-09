(function () {
  "use strict";

  // Avisa o HTML que o script carregou (ver o aviso no <head>)
  window.__revealReady = true;

  var root = document.documentElement;
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("menu");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Menu no celular ---------- */
  function setMenu(open) {
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Fechar menu" : "Abrir menu";
  }

  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      toggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 880) setMenu(false);
  });

  /* ---------- Rolagem: barra de progresso, sombra e parallax ---------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle("is-scrolled", y > 8);
    root.style.setProperty("--p", max > 0 ? Math.min(y / max, 1).toFixed(4) : 0);

    if (reduceMotion) return;
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0;
      var offset = (r.top + r.height / 2 - vh / 2) * speed;
      el.style.translate = "0 " + offset.toFixed(1) + "px";
    });
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();

  /* ---------- Revelação dos elementos ao aparecer na tela ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  // atraso escalonado para itens de uma mesma lista
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    Array.prototype.slice.call(group.children).forEach(function (child, i) {
      child.style.setProperty("--d", i * 110 + "ms");
    });
  });

  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Galeria com foto ampliada ---------- */
  var box = document.querySelector(".lightbox");
  if (box && typeof box.showModal === "function") {
    var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
    var lbImg = box.querySelector("img");
    var current = 0;

    var show = function (i) {
      current = (i + shots.length) % shots.length;
      var shot = shots[current];
      var img = shot.querySelector("img");
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
    };

    shots.forEach(function (shot, i) {
      shot.addEventListener("click", function () {
        show(i);
        box.showModal();
        document.body.classList.add("lb-open");
      });
    });

    box.querySelector(".lb-close").addEventListener("click", function () { box.close(); });
    box.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
    box.addEventListener("close", function () { document.body.classList.remove("lb-open"); });
    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* ---------- Ano do rodapé ---------- */
  var year = document.getElementById("ano");
  if (year) year.textContent = new Date().getFullYear();
})();
