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
  const isNarrow = () => window.matchMedia('(max-width: 960px)').matches;
  if (heroEl) {
    const direction = heroEl.classList.contains('hero-reverse') ? 'shrink' : 'grow';
    const setStatic = () => {
      const image = heroEl.querySelector('.hero-image');
      const sticky = heroEl.querySelector('.hero-sticky');
      // Let the CSS --s value win on narrow viewports
      if (image) image.style.removeProperty('--s');
      if (sticky) sticky.classList.add('show-sub', 'show-btn');
    };
    if (prefersReduced || isNarrow()) {
      setStatic();
    } else {
      setupHeroMorph(heroEl, direction);
    }
    // Reapply static state if user resizes into a narrow viewport
    window.addEventListener('resize', () => {
      if (isNarrow()) setStatic();
    });
  }


  /* ---------- Scroll-fill text, letter by letter (Lakerock-style) ---------- */
  const splitFillEls = document.querySelectorAll('[data-split-fill]');
  splitFillEls.forEach((el) => {
    if (el.dataset.splitFillInit) return;
    el.dataset.splitFillInit = 'true';
    const text = el.textContent;
    el.innerHTML = '';
    text.split(/(\s+)/).forEach((seg) => {
      if (!seg) return;
      if (/^\s+$/.test(seg)) {
        const space = document.createElement('span');
        space.className = 'char';
        space.innerHTML = '&nbsp;';
        el.appendChild(space);
      } else {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        seg.split('').forEach((c) => {
          const letter = document.createElement('span');
          letter.className = 'char';
          letter.textContent = c;
          wordSpan.appendChild(letter);
        });
        el.appendChild(wordSpan);
      }
    });
  });
  if (splitFillEls.length && !prefersReduced) {
    const updateFill = () => {
      const vh = window.innerHeight;
      splitFillEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const start = vh;
        const end = vh * 0.3;
        const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
        const chars = el.querySelectorAll('.char');
        const fillCount = Math.floor(progress * chars.length);
        chars.forEach((ch, i) => ch.classList.toggle('filled', i < fillCount));
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


  /* ---------- Footer reveal — body padding-bottom matches footer height exactly ---------- */
  const footerEl = document.querySelector('.footer');
  if (footerEl) {
    const syncFooterReveal = () => {
      document.body.style.paddingBottom = `${footerEl.offsetHeight}px`;
    };
    syncFooterReveal();
    window.addEventListener('resize', syncFooterReveal);
    if ('ResizeObserver' in window) {
      new ResizeObserver(syncFooterReveal).observe(footerEl);
    }
  }

  /* ---------- CTA scroll intro (grow in → shift + slant → slant fills → content) ---------- */
  const ctaPin = document.querySelector('.cta-pin');
  const ctaSticky = document.querySelector('.cta-sticky');
  const ctaFinal = document.querySelector('.cta-final');
  if (ctaPin && ctaSticky && ctaFinal && !prefersReduced) {
    const ctaTitle = ctaFinal.querySelector('.cta-title');
    const ctaSub = ctaFinal.querySelector('.cta-sub');
    const ctaBtn = ctaFinal.querySelector('.btn');
    const updateCta = () => {
      const rect = ctaPin.getBoundingClientRect();
      const vh = window.innerHeight;
      // Serve covers cta for 1.0vh (pull-up), then 0.3vh of "let's build pinned, no animation"
      const offset = vh * 1.3;
      const total = ctaPin.offsetHeight - vh - offset;
      const raw = total > 0 ? Math.max(0, Math.min(1, (-rect.top - offset) / total)) : 0;
      const mainRaw = Math.min(1, raw / 0.70);
      const peelRaw = Math.max(0, Math.min(1, (raw - 0.75) / 0.25));
      // Reveal-phase scale: grow tiny→full faster than the curtain (reaches 1.0 at ~60% of Serve scroll)
      const revealRaw = Math.max(0, Math.min(1, -rect.top / (vh * 0.6)));
      const scale = 0.12 + revealRaw * 0.88;
      const slideT = Math.min(1, Math.max(0, (mainRaw - 0.10) / 0.15));
      const fadeOut = Math.max(0, Math.min(1, (mainRaw - 0.45) / 0.13));
      const tx = -slideT * 22;
      ctaSticky.style.setProperty('--intro-x', `${tx}vw`);
      ctaSticky.style.setProperty('--intro-s', scale.toFixed(3));
      ctaSticky.style.setProperty('--intro-a', (1 - fadeOut).toFixed(2));
      let s;
      if (mainRaw < 0.15) s = 0;
      else if (mainRaw < 0.25) s = ((mainRaw - 0.15) / 0.10) * 2;
      else if (mainRaw < 0.55) s = 2 + ((mainRaw - 0.25) / 0.30) * 39;
      else s = 41;
      ctaSticky.style.setProperty('--s', s.toFixed(2));
      ctaSticky.style.setProperty('--peel', `${(peelRaw * 72).toFixed(1)}%`);
      if (ctaTitle) ctaTitle.classList.toggle('show', mainRaw > 0.60);
      if (ctaSub) ctaSub.classList.toggle('show', mainRaw > 0.72);
      if (ctaBtn) ctaBtn.classList.toggle('show', mainRaw > 0.84);
    };
    updateCta();
    let ctaPending = false;
    window.addEventListener('scroll', () => {
      if (ctaPending) return;
      ctaPending = true;
      requestAnimationFrame(() => { updateCta(); ctaPending = false; });
    }, { passive: true });
    window.addEventListener('resize', updateCta);
  }

  /* ---------- Underwriters circle — magnetic hover ---------- */
  const uwCircle = document.querySelector('.uw-circle');
  if (uwCircle && !prefersReduced) {
    const range = 520;
    const strength = 0.42;
    let uwPending = false;
    const onMove = (e) => {
      if (uwPending) return;
      uwPending = true;
      requestAnimationFrame(() => {
        const rect = uwCircle.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < range) {
          const f = 1 - dist / range;
          uwCircle.style.setProperty('--mx', `${dx * strength * f}px`);
          uwCircle.style.setProperty('--my', `${dy * strength * f}px`);
        } else {
          uwCircle.style.setProperty('--mx', '0px');
          uwCircle.style.setProperty('--my', '0px');
        }
        uwPending = false;
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', () => {
      uwCircle.style.setProperty('--mx', '0px');
      uwCircle.style.setProperty('--my', '0px');
    });
  }

  /* ---------- Team stats hover/tap rotates image ---------- */
  const teamStats = document.querySelectorAll('.team-stats li[data-team-idx]');
  const teamImageBg = document.querySelector('.team-image-bg');
  if (teamStats.length && teamImageBg) {
    const setTeamRot = (idx) => {
      teamImageBg.style.setProperty('--team-rot', `${idx * 90}deg`);
    };
    teamStats.forEach((li) => {
      const idx = parseInt(li.dataset.teamIdx, 10) || 0;
      li.addEventListener('mouseenter', () => setTeamRot(idx));
      li.addEventListener('click', () => setTeamRot(idx));
      li.style.cursor = 'pointer';
    });
  }

  /* ---------- Excellence accordion (scroll-pinned, sequential) ---------- */
  const exPanels = document.querySelectorAll('.ex-panel');
  const exPin = document.querySelector('.ex-pin');
  if (exPanels.length && exPin) {
    const updateEx = () => {
      if (window.innerWidth <= 960) {
        exPanels.forEach((p) => p.classList.add('is-active'));
        return;
      }
      const rect = exPin.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = exPin.offsetHeight - vh;
      const scrolled = Math.min(scrollable, Math.max(0, -rect.top));
      const progress = scrollable > 0 ? scrolled / scrollable : 0;
      const n = exPanels.length;
      const idx = Math.min(n - 1, Math.floor(progress * n));
      exPanels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
    };
    updateEx();
    let exPending = false;
    window.addEventListener('scroll', () => {
      if (exPending) return;
      exPending = true;
      requestAnimationFrame(() => { updateEx(); exPending = false; });
    }, { passive: true });
    window.addEventListener('resize', updateEx);
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

  /* ---------- Team image bg: size to container diagonal so any rotation covers ---------- */
  const teamImageEl = document.querySelector('.team-image');
  const teamImageBgEl = document.querySelector('.team-image-bg');
  if (teamImageEl && teamImageBgEl) {
    const updateTeamBgSize = () => {
      const w = teamImageEl.offsetWidth;
      const h = teamImageEl.offsetHeight;
      if (!w || !h) return;
      const diag = Math.sqrt(w * w + h * h);
      const size = Math.ceil(diag * 1.05);
      teamImageBgEl.style.width = `${size}px`;
      teamImageBgEl.style.height = `${size}px`;
      teamImageBgEl.style.left = `${(w - size) / 2}px`;
      teamImageBgEl.style.top = `${(h - size) / 2}px`;
    };
    updateTeamBgSize();
    if ('ResizeObserver' in window) {
      new ResizeObserver(updateTeamBgSize).observe(teamImageEl);
    } else {
      window.addEventListener('resize', updateTeamBgSize);
    }
  }

  /* ---------- Stacked cards: shrink as next card stacks over ---------- */
  const stackCards = document.querySelectorAll('.stack-card');
  if (stackCards.length && !prefersReduced) {
    let stackPending = false;
    const updateStackShrink = () => {
      const vh = window.innerHeight;
      const cardArr = Array.from(stackCards);
      let activeIndex = 0;
      cardArr.forEach((card, i) => {
        const cardStickyTop = vh * 0.14 + i * 22;
        const next = cardArr[i + 1];
        if (!next) {
          card.style.setProperty('--shrink', '0');
        } else {
          // As the next card's top approaches its sticky position, shrink this one
          const nextStickyTop = vh * 0.14 + (i + 1) * 22;
          const nextTop = next.getBoundingClientRect().top;
          const enterStart = vh * 0.85;
          const t = Math.max(0, Math.min(1, (enterStart - nextTop) / (enterStart - nextStickyTop)));
          card.style.setProperty('--shrink', t.toFixed(3));
        }
        // Track the topmost card that has reached its own sticky position
        const top = card.getBoundingClientRect().top;
        if (top <= cardStickyTop + 8) activeIndex = i;
      });
      cardArr.forEach((card, i) => {
        card.classList.toggle('is-active', i === activeIndex);
      });
    };
    updateStackShrink();
    window.addEventListener('scroll', () => {
      if (stackPending) return;
      stackPending = true;
      requestAnimationFrame(() => { updateStackShrink(); stackPending = false; });
    }, { passive: true });
    window.addEventListener('resize', updateStackShrink);
  }

  /* ---------- Excellence → Team background fade ---------- */
  const excellenceEl = document.querySelector('.excellence');
  const teamEl = document.querySelector('.team');
  if (excellenceEl && teamEl) {
    let bgRaf = false;
    const updateBgFade = () => {
      const vh = window.innerHeight;
      const teamTop = teamEl.getBoundingClientRect().top;
      const start = vh * 1.05;
      const end = vh * 0.85;
      const t = Math.max(0, Math.min(1, (start - teamTop) / (start - end)));
      excellenceEl.style.setProperty('--ex-bg-fade', t.toFixed(3));
    };
    const onScrollBg = () => {
      if (bgRaf) return;
      bgRaf = true;
      requestAnimationFrame(() => { updateBgFade(); bgRaf = false; });
    };
    updateBgFade();
    window.addEventListener('scroll', onScrollBg, { passive: true });
    window.addEventListener('resize', updateBgFade);
  }
})();
