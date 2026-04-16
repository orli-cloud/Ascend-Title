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

  /* ---------- Magnetic buttons ---------- */
  if (hasFinePointer && !prefersReduced) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const strength = 0.25;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
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

  /* ---------- Scroll progress bar + nav scrolled state ---------- */
  const progressBar = document.querySelector('.progress span');
  const navEl = document.querySelector('.nav');
  if (progressBar || navEl) {
    let progPending = false;
    const tick = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (navEl) navEl.classList.toggle('is-scrolled', h.scrollTop > 30);
      progPending = false;
    };
    tick();
    window.addEventListener('scroll', () => {
      if (progPending) return;
      progPending = true;
      requestAnimationFrame(tick);
    }, { passive: true });
  }

  /* ---------- Nav floating indicator ---------- */
  const navLinksWrap = document.querySelector('.nav-links');
  const indicator = document.querySelector('.nav-indicator');
  if (navLinksWrap && indicator) {
    const allLinks = navLinksWrap.querySelectorAll('.nav-link');
    const moveTo = (el) => {
      if (!el) return;
      const wrapBox = navLinksWrap.getBoundingClientRect();
      const linkBox = el.getBoundingClientRect();
      indicator.style.setProperty('--ind-x', `${linkBox.left - wrapBox.left}px`);
      indicator.style.setProperty('--ind-w', `${linkBox.width}px`);
    };
    const syncToActive = () => {
      const a = navLinksWrap.querySelector('.nav-link.active');
      if (a) moveTo(a);
    };
    syncToActive();
    allLinks.forEach((l) => {
      l.addEventListener('mouseenter', () => moveTo(l));
    });
    navLinksWrap.addEventListener('mouseleave', syncToActive);
    window.addEventListener('resize', syncToActive);
  }
})();
