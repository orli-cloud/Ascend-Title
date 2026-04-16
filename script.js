/* =================================================================
   Ascend Title — Interactions
   ================================================================= */

(() => {
  'use strict';

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const stagger = parseInt(el.dataset.stagger || '0', 10);
          el.style.transitionDelay = `${stagger * 120}ms`;
          el.classList.add('in-view');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add('in-view'));
  }

  /* ---------- Number count-up ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (!prefersReduced && counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1400;
        const start = performance.now();
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          el.textContent = Math.floor(easeOut(progress) * target);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        };
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => countObserver.observe(c));
  } else {
    counters.forEach((c) => { c.textContent = c.dataset.count; });
  }

  /* ---------- Custom cursor ---------- */
  const cursor = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor-dot');
  const hasFinePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursor && dot && hasFinePointer && !prefersReduced) {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    const lerp = (a, b, n) => (1 - n) * a + n * b;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      document.body.classList.add('cursor-ready');
    });

    const loop = () => {
      cursorX = lerp(cursorX, mouseX, 0.18);
      cursorY = lerp(cursorY, mouseY, 0.18);
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    const interactiveSelectors = 'a, button, [data-magnetic], .service-row, .ex-card, .uw-cell, .serve-list li';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    window.addEventListener('mouseleave', () => document.body.classList.remove('cursor-ready'));
    window.addEventListener('mouseenter', () => document.body.classList.add('cursor-ready'));
  }

  /* Magnetic hover removed — buttons stay in place */

  /* ---------- Scroll cursor (shows over any .hero) ---------- */
  const scrollCursorWrap = document.querySelector('.scroll-cursor-wrap');
  const heroEls = document.querySelectorAll('.hero');
  if (scrollCursorWrap && heroEls.length && hasFinePointer && !prefersReduced) {
    let sMouseX = 0, sMouseY = 0;
    let sCurX = 0, sCurY = 0;
    const lerp2 = (a, b, n) => (1 - n) * a + n * b;
    window.addEventListener('mousemove', (e) => { sMouseX = e.clientX; sMouseY = e.clientY; });
    const show = () => {
      scrollCursorWrap.classList.add('is-visible');
      document.body.classList.add('has-scroll-cursor');
    };
    const hide = () => {
      scrollCursorWrap.classList.remove('is-visible');
      document.body.classList.remove('has-scroll-cursor');
    };
    heroEls.forEach((heroEl) => {
      heroEl.addEventListener('mouseenter', show);
      heroEl.addEventListener('mouseleave', hide);
      heroEl.querySelectorAll('a, button, [role="button"]').forEach((el) => {
        el.addEventListener('mouseenter', hide);
        el.addEventListener('mouseleave', (e) => {
          if (heroEl.contains(e.relatedTarget)) show();
        });
      });
    });
    const loopS = () => {
      sCurX = lerp2(sCurX, sMouseX, 0.2);
      sCurY = lerp2(sCurY, sMouseY, 0.2);
      scrollCursorWrap.style.transform = `translate(${sCurX}px, ${sCurY}px)`;
      requestAnimationFrame(loopS);
    };
    loopS();
  }

  /* ---------- Hero parallax ---------- */
  const heroBg = document.querySelector('.hero-bg .bg-image');
  if (heroBg && !prefersReduced) {
    let rafPending = false;
    window.addEventListener('scroll', () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          heroBg.style.transform = `translateY(${y * 0.25}px) scale(${1.04 + y * 0.0001})`;
        }
        rafPending = false;
      });
    }, { passive: true });
  }

  /* ---------- Scroll-based nav active state ---------- */
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.4 });
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- Mobile toggle (basic show/hide) ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('is-open');
    });
  }


  /* ---------- Hero scroll morph (parallelogram clip-path) ---------- */
  const setupHeroMorph = (section, direction) => {
    const image = section.querySelector('.hero-image');
    const sticky = section.querySelector('.hero-sticky');
    if (!image || !sticky) return;
    const ease = (t) => 1 - Math.pow(1 - t, 2.6);
    const update = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const raw = Math.max(0, Math.min(1, -rect.top / total));
      const p = ease(Math.min(1, raw / 0.75));
      let scale;
      if (direction === 'shrink') {
        // Reverse: start full image (scale 41), shrink to thin slant (scale 1)
        scale = 41 - p * 40;
        // Text comes in as image shrinks
        sticky.classList.toggle('show-sub', raw > 0.35);
        sticky.classList.toggle('show-btn', raw > 0.5);
      } else {
        // Grow: thin slant → full image
        scale = 1 + p * 40;
        sticky.classList.toggle('show-sub', raw > 0.08);
        sticky.classList.toggle('show-btn', raw > 0.18);
      }
      image.style.setProperty('--s', scale.toFixed(3));
    };
    update();
    let pending = false;
    window.addEventListener('scroll', () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { update(); pending = false; });
    }, { passive: true });
    window.addEventListener('resize', update);
  };

  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    if (!prefersReduced) {
      setupHeroMorph(heroEl, 'grow');
    } else {
      const image = heroEl.querySelector('.hero-image');
      const sticky = heroEl.querySelector('.hero-sticky');
      if (image) image.style.setProperty('--s', 41);
      if (sticky) sticky.classList.add('show-sub', 'show-btn');
    }
  }


  /* ---------- Scroll-fill text, letter by letter (about section) ---------- */
  const splitFillEls = document.querySelectorAll('[data-split-fill]');
  splitFillEls.forEach((el) => {
    const text = el.textContent.trim();
    el.innerHTML = text.split('').map((c) => (
      c === ' ' ? ' ' : `<span class="char">${c}</span>`
    )).join('');
  });
  if (splitFillEls.length && !prefersReduced) {
    const chars = [];
    splitFillEls.forEach((el) => {
      el.querySelectorAll('.char').forEach((c) => chars.push(c));
    });
    const updateFill = () => {
      const vh = window.innerHeight;
      chars.forEach((ch) => {
        const rect = ch.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const t = 1 - Math.max(0, Math.min(1, (mid - vh * 0.30) / (vh * 0.50)));
        const alpha = 0.12 + t * 0.88;
        ch.style.color = `rgba(14, 41, 62, ${alpha.toFixed(3)})`;
      });
    };
    updateFill();
    let fillPending = false;
    window.addEventListener('scroll', () => {
      if (fillPending) return;
      fillPending = true;
      requestAnimationFrame(() => { updateFill(); fillPending = false; });
    }, { passive: true });
    window.addEventListener('resize', updateFill);
  }

  /* ---------- Services accordion (always one open, first default) ---------- */
  const serviceRows = document.querySelectorAll('.service-row');
  if (serviceRows.length) {
    serviceRows[0].classList.add('is-open');
    serviceRows.forEach((row) => {
      row.addEventListener('click', () => {
        if (row.classList.contains('is-open')) return;
        serviceRows.forEach((r) => r.classList.remove('is-open'));
        row.classList.add('is-open');
      });
    });
  }

  /* ---------- Side drawer ---------- */
  const drawer = document.getElementById('drawer');
  const menuBtn = document.querySelector('.menu-btn');
  if (drawer && menuBtn) {
    const openDrawer = () => {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('drawer-open');
    };
    const closeDrawer = () => {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('drawer-open');
    };
    menuBtn.addEventListener('click', openDrawer);
    drawer.querySelectorAll('[data-drawer-close]').forEach((el) => {
      el.addEventListener('click', closeDrawer);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
    });
  }
})();
