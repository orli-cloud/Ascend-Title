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


  /* ---------- Closing Cost Calculator ---------- */
  if (document.getElementById('calc-btn')) {
    let calcMode = 'purchase';
    const fmt = (n) => '$' + Math.round(n).toLocaleString();
    const parseNum = (s) => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;
    const $ = (id) => document.getElementById(id);

    // Placeholder rates — replace with actual underwriter rate tables before launch.
    const ownerRates  = { NJ: 4.50, NY: 4.20, FL: 5.75, CA: 3.50, TX: 5.25, PA: 5.00, IL: 4.00, GA: 3.75, OTHER: 4.50 };
    const lenderRates = { NJ: 2.50, NY: 2.00, FL: 0.25, CA: 1.75, TX: 0.10, PA: 2.25, IL: 2.00, GA: 1.85, OTHER: 2.25 };
    const transferTax = { NJ: 0.85, NY: 0.40, FL: 0.70, CA: 0.11, TX: 0,    PA: 1.00, IL: 0.10, GA: 0.10, OTHER: 0.50 };
    const mortgageTax = { NJ: 0,    NY: 1.05, FL: 0.35, CA: 0,    TX: 0,    PA: 0,    IL: 0,    GA: 0.30, OTHER: 0    };

    ['calc-price', 'calc-loan', 'calc-payoff'].forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const v = parseNum(el.value);
        if (v) el.value = v.toLocaleString();
      });
    });

    document.querySelectorAll('.calc-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        calcMode = btn.dataset.mode;
        document.querySelectorAll('.calc-tab').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        updateCalcFields();
        runCalc();
      });
    });

    function updateCalcFields() {
      const priceLbl = $('calc-priceLabel');
      const loanLbl = $('calc-loanLabel');
      const loanField = $('calc-loanField');
      const commField = $('calc-commField');
      const payoffField = $('calc-payoffField');
      const totalLbl = $('calc-totalLabel');

      if (calcMode === 'purchase') {
        priceLbl.textContent = 'Purchase Price';
        loanLbl.textContent  = 'Loan Amount';
        loanField.style.display = '';
        commField.style.display = 'none';
        payoffField.style.display = 'none';
        totalLbl.textContent = 'Estimated Buyer Closing Costs';
      } else if (calcMode === 'refinance') {
        priceLbl.textContent = 'Property Value';
        loanLbl.textContent  = 'New Loan Amount';
        loanField.style.display = '';
        commField.style.display = 'none';
        payoffField.style.display = 'none';
        totalLbl.textContent = 'Estimated Refinance Costs';
      } else {
        priceLbl.textContent = 'Sale Price';
        loanField.style.display = 'none';
        commField.style.display = '';
        payoffField.style.display = '';
        totalLbl.textContent = 'Estimated Net to Seller';
      }
    }

    function runCalc() {
      const state = $('calc-state').value;
      const propType = $('calc-propType').value;
      const price = parseNum($('calc-price').value);
      const loan = parseNum($('calc-loan').value);
      if (!price) return;

      const ownerRate  = ownerRates[state];
      const lenderRate = lenderRates[state];
      const tTax = transferTax[state];
      const mTax = mortgageTax[state];

      let rows = [];
      let total = 0;

      if (calcMode === 'purchase') {
        const ownerPrem      = (price / 1000) * ownerRate;
        const lenderPrem     = loan ? (loan / 1000) * lenderRate : 0;
        const settlement     = propType === 'commercial' ? 1500 : 750;
        const search         = propType === 'commercial' ? 600 : 350;
        const recording      = 250;
        const mortgageTaxAmt = loan * (mTax / 100);
        const endorsements   = loan ? 150 : 0;
        rows = [
          ["Owner's Title Insurance", ownerPrem],
          ["Lender's Title Insurance", lenderPrem],
          ['Settlement / Closing Fee', settlement],
          ['Title Search', search],
          ['Recording Fees', recording],
          ['Mortgage Tax', mortgageTaxAmt],
          ['Endorsements', endorsements],
        ].filter((r) => r[1] > 0);
        total = rows.reduce((s, r) => s + r[1], 0);
      } else if (calcMode === 'refinance') {
        const lenderPrem     = (loan / 1000) * lenderRate * 0.7;
        const mortgageTaxAmt = loan * (mTax / 100);
        rows = [
          ["Lender's Title Insurance", lenderPrem],
          ['Settlement Fee', 600],
          ['Title Search', 300],
          ['Recording Fees', 200],
          ['Mortgage Tax', mortgageTaxAmt],
          ['Endorsements', 150],
        ].filter((r) => r[1] > 0);
        total = rows.reduce((s, r) => s + r[1], 0);
      } else {
        const commission     = price * (parseNum($('calc-commission').value) / 100);
        const payoff         = parseNum($('calc-payoff').value);
        const transferTaxAmt = price * (tTax / 100);
        const ownerPrem      = (price / 1000) * ownerRate;
        const closingCosts   = commission + transferTaxAmt + 500 + ownerPrem + 150;
        total = price - payoff - closingCosts;
        rows = [
          ['Sale Price', price],
          ['Loan Payoff', -payoff],
          ['Agent Commission', -commission],
          ['Transfer Tax', -transferTaxAmt],
          ["Owner's Title (Seller-Paid)", -ownerPrem],
          ['Settlement Fee', -500],
          ['Recording Fees', -150],
        ];
      }

      $('calc-total').textContent = fmt(total);
      const totalLabel = calcMode === 'seller' ? 'Estimated Net Proceeds' : 'Total';
      $('calc-breakdown').innerHTML = rows.map((r) => {
        const isNeg = r[1] < 0;
        const val = (isNeg ? '-' : '') + fmt(Math.abs(r[1]));
        return '<div class="calc-row"><span class="lbl">' + r[0] + '</span><span class="val">' + val + '</span></div>';
      }).join('') + '<div class="calc-row calc-total-row"><span class="lbl">' + totalLabel + '</span><span class="val">' + fmt(total) + '</span></div>';
    }

    $('calc-btn').addEventListener('click', runCalc);
    ['calc-state', 'calc-propType', 'calc-price', 'calc-loan', 'calc-commission', 'calc-payoff'].forEach((id) => {
      const el = $(id);
      if (el) el.addEventListener('change', runCalc);
    });

    runCalc();
  }

  /* ---------- FAQ: smooth slide-open/close for <details> ---------- */
  document.querySelectorAll('.faq-item details').forEach((details) => {
    const summary = details.querySelector('summary');
    const content = details.querySelector('.faq-a');
    if (!summary || !content) return;

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (details.open) {
        // Closing
        const startHeight = content.scrollHeight;
        content.style.height = startHeight + 'px';
        // force reflow
        content.offsetHeight;
        content.style.height = '0px';
        const onEnd = (ev) => {
          if (ev.propertyName !== 'height') return;
          details.open = false;
          content.style.height = '';
          content.removeEventListener('transitionend', onEnd);
        };
        content.addEventListener('transitionend', onEnd);
      } else {
        // Opening
        details.open = true;
        const targetHeight = content.scrollHeight;
        content.style.height = '0px';
        content.offsetHeight;
        content.style.height = targetHeight + 'px';
        const onEnd = (ev) => {
          if (ev.propertyName !== 'height') return;
          content.style.height = '';
          content.removeEventListener('transitionend', onEnd);
        };
        content.addEventListener('transitionend', onEnd);
      }
    });
  });

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

  /* ---------- Char-split helper: turn a node's text into per-letter spans, preserving <br> ---------- */
  const splitIntoChars = (el, charClass, wordClass) => {
    if (!el || el.dataset.charsplit) return 0;
    el.dataset.charsplit = '1';
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';
    let idx = 0;
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue || '';
        text.split(/(\s+)/).forEach((seg) => {
          if (!seg) return;
          if (/^\s+$/.test(seg)) {
            el.appendChild(document.createTextNode(' '));
          } else {
            const wordSpan = document.createElement('span');
            wordSpan.className = wordClass;
            seg.split('').forEach((c) => {
              const letter = document.createElement('span');
              letter.className = charClass;
              letter.style.setProperty('--i', idx++);
              letter.textContent = c;
              wordSpan.appendChild(letter);
            });
            el.appendChild(wordSpan);
          }
        });
      } else if (node.nodeName === 'BR') {
        el.appendChild(node.cloneNode());
      } else {
        el.appendChild(node.cloneNode(true));
      }
    });
    return idx;
  };

  /* ---------- Hero title — letter-by-letter entrance on load ---------- */
  const heroTitleSplit = document.querySelector('.hero-title');
  if (heroTitleSplit) {
    splitIntoChars(heroTitleSplit, 'hero-char', 'hero-word');
    if (!prefersReduced) {
      // Trigger on next frame so letter transitions can run
      requestAnimationFrame(() => {
        requestAnimationFrame(() => heroTitleSplit.classList.add('show'));
      });
    } else {
      heroTitleSplit.classList.add('show');
    }
  }

  /* ---------- CTA title — split into letter spans for staggered entrance ---------- */
  const ctaTitleSplit = document.querySelector('.cta-title');
  if (ctaTitleSplit) {
    splitIntoChars(ctaTitleSplit, 'cta-char', 'cta-word');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            ctaTitleSplit.classList.add('show');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.25 });
      io.observe(ctaTitleSplit);
    } else {
      ctaTitleSplit.classList.add('show');
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
    // Track scroll direction + completion. Forward scroll plays the reveal as before;
    // scrolling back UP after touching the CTA jumps straight to the final revealed
    // state instead of running the slant/peel animation in reverse.
    let lastScrollY = window.scrollY;
    let progress = 0;          // current "raw" progress fed to the visuals
    let progressReveal = 0;    // current entrance-scale progress
    let firstCall = true;
    const updateCta = () => {
      const rect = ctaPin.getBoundingClientRect();
      const vh = window.innerHeight;
      // Pre-roll = vh covered by preceding navy section + static "Let's Build" hold.
      // Homepage: 1.0 (Serve cover) + 0.3 (static) = 1.3. About page (no Serve): 0.3.
      const preRoll = parseFloat(getComputedStyle(document.body).getPropertyValue('--cta-pre-roll')) || 1.3;
      const offset = vh * preRoll;
      const total = ctaPin.offsetHeight - vh - offset;
      const rawNow = total > 0 ? Math.max(0, Math.min(1, (-rect.top - offset) / total)) : 0;
      // Reveal-phase scale: only when a navy section precedes the CTA (homepage). It
      // grows tiny→full as the cover scrolls away. Without a cover (about page), there's
      // nothing for "Let's Build" to grow out from, so skip and keep scale at 1.
      const enableGrowth = preRoll >= 1.0;
      const revealNow = enableGrowth
        ? Math.max(0, Math.min(1, -rect.top / (vh * 0.6)))
        : 1;
      const scrollY = window.scrollY;
      const goingUp = !firstCall && scrollY < lastScrollY;
      lastScrollY = scrollY;
      if (firstCall) {
        // On initial render, if the user already loaded into / past the CTA section,
        // skip straight to the fully-revealed state — no half-baked mid-reveal.
        firstCall = false;
        progress = (rawNow > 0) ? 1 : 0;
        progressReveal = (revealNow > 0) ? 1 : revealNow;
      } else if (goingUp && progress > 0 && rawNow < progress) {
        // Scrolling back up after the reveal has started — snap to final state instead
        // of running the animation backwards.
        progress = 1;
        progressReveal = 1;
      } else {
        // Normal forward scroll: animation tracks scroll position monotonically.
        if (rawNow > progress) progress = rawNow;
        if (revealNow > progressReveal) progressReveal = revealNow;
      }
      const raw = progress;
      const revealRaw = progressReveal;
      const mainRaw = Math.min(1, raw / 0.70);
      const peelRaw = Math.max(0, Math.min(1, (raw - 0.75) / 0.25));
      const scale = enableGrowth ? (0.12 + revealRaw * 0.88) : 1;
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
      if (ctaTitle && mainRaw > 0.60) ctaTitle.classList.add('show');
      if (ctaSub && mainRaw > 0.72) ctaSub.classList.add('show');
      if (ctaBtn && mainRaw > 0.84) ctaBtn.classList.add('show');
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

  /* ---------- Bio modal (about page) ---------- */
  const bioModal = document.getElementById('bio-modal');
  if (bioModal) {
    const modalImg = document.getElementById('bio-modal-img');
    const modalRole = document.getElementById('bio-modal-role');
    const modalName = document.getElementById('bio-modal-name');
    const modalText = document.getElementById('bio-modal-text');
    let lastTrigger = null;

    const openBio = (card) => {
      const trigger = card.querySelector('.bio-trigger');
      const img = card.querySelector('.bio-img');
      const nameEl = card.querySelector('.bio-name');
      const roleEl = card.querySelector('.bio-role');
      const tpl = card.querySelector('template.bio-full');

      if (img && img.classList.contains('bio-img--mono')) {
        modalImg.classList.add('is-mono');
        modalImg.style.backgroundImage = '';
        modalImg.innerHTML = '<span class="mono-letters">' + (img.dataset.initials || '') + '</span>';
      } else if (img) {
        modalImg.classList.remove('is-mono');
        modalImg.innerHTML = '';
        modalImg.style.backgroundImage = img.style.backgroundImage;
      }

      modalName.textContent = nameEl ? nameEl.textContent.trim() : '';
      modalRole.textContent = roleEl ? roleEl.textContent.trim() : '';
      modalText.innerHTML = '';
      if (tpl) modalText.appendChild(tpl.content.cloneNode(true));

      bioModal.classList.add('is-open');
      bioModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('bio-modal-open');
      lastTrigger = trigger;
      const closeBtn = bioModal.querySelector('.bio-modal-close');
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    };

    const closeBio = () => {
      bioModal.classList.remove('is-open');
      bioModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('bio-modal-open');
      if (lastTrigger) lastTrigger.focus({ preventScroll: true });
      lastTrigger = null;
    };

    document.querySelectorAll('.bio-card').forEach((card) => {
      const trigger = card.querySelector('[data-bio-open]');
      if (!trigger) return;
      trigger.addEventListener('click', () => openBio(card));
    });

    bioModal.querySelectorAll('[data-bio-close]').forEach((el) => {
      el.addEventListener('click', closeBio);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bioModal.classList.contains('is-open')) closeBio();
    });
  }

  /* Team image now uses background-attachment: fixed for a "window into the
     navy bg" effect — no rotation/sizing JS needed. */

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

  /* ---------- Services stack: bg slides, text panels reveal in place ---------- */
  const svcStack = document.querySelector('.svc-stack');
  if (svcStack) {
    const svcStage = svcStack.querySelector('.svc-stage');
    const svcBgs = svcStack.querySelectorAll('.svc-bg');
    const svcTexts = svcStack.querySelectorAll('.svc-text');
    const svcDots = svcStack.querySelectorAll('.svc-dot');
    const svcCount = svcTexts.length;

    const updateSvc = () => {
      // Mobile: panels render as plain stacked sections — mark each as active
      if (window.innerWidth <= 960) {
        svcBgs.forEach((b) => b.classList.add('is-revealed'));
        svcTexts.forEach((t) => t.classList.add('is-active'));
        svcDots.forEach((d) => d.classList.remove('is-active'));
        return;
      }
      const rect = svcStack.getBoundingClientRect();
      const stackHeight = svcStack.offsetHeight;
      const vh = window.innerHeight;
      const totalScroll = stackHeight - vh;
      const scrolled = Math.max(0, Math.min(totalScroll, -rect.top));
      // Each service owns one viewport-height of scroll. Service 0 from 0→vh,
      // service 1 from vh→2vh, … so the active card flips precisely at each
      // snap point.
      const idx = Math.min(svcCount - 1, Math.floor(scrolled / vh));
      svcBgs.forEach((bg, i) => {
        bg.classList.toggle('is-revealed', i <= idx);
      });
      svcTexts.forEach((text, i) => {
        text.classList.toggle('is-active', i === idx);
      });
      svcDots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === idx);
      });
      // Drive dot color via active service tone, and the cube's rotation pose
      if (svcStage && svcTexts[idx]) {
        svcStage.dataset.tone = svcTexts[idx].dataset.tone || 'ink';
        svcStage.dataset.activeIdx = String(idx);
      }
    };
    updateSvc();

    let svcRaf = false;
    window.addEventListener('scroll', () => {
      if (svcRaf) return;
      svcRaf = true;
      requestAnimationFrame(() => { updateSvc(); svcRaf = false; });
    }, { passive: true });
    window.addEventListener('resize', updateSvc);

    // Click a dot to jump to that service (smooth scroll + snap will align)
    svcDots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const vh = window.innerHeight;
        const stackTop = svcStack.getBoundingClientRect().top + window.scrollY;
        // Service N occupies scroll range [N*vh .. (N+1)*vh] within the stack
        const target = stackTop + i * vh;
        window.scrollTo({ top: target, behavior: 'smooth' });
      });
    });

    // ---- Scroll cursor: follows mouse, only visible inside the services stack ----
    const svcCursor = document.querySelector('.svc-cursor');
    if (svcCursor && !prefersReduced && matchMedia('(hover: hover)').matches) {
      let cursorX = 0, cursorY = 0;
      let cursorRaf = false;
      let cursorInside = false;

      const svcDotsContainer = svcStack.querySelector('.svc-dots');
      const CURSOR_RADIUS = 44; // half of the 88px scroll-cursor circle
      const PROXIMITY_PAD = 8;  // tiny extra padding so swap fires just before contact

      const moveCursor = (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        if (cursorRaf) return;
        cursorRaf = true;
        requestAnimationFrame(() => {
          svcCursor.style.transform = `translate3d(${cursorX - 44}px, ${cursorY - 44}px, 0)`;
          // Swap to native cursor when the scroll-cursor's edge touches the
          // dots' bounding box (distance from pointer to box <= cursor radius).
          if (cursorInside && svcDotsContainer) {
            const r = svcDotsContainer.getBoundingClientRect();
            const dx = Math.max(r.left - cursorX, 0, cursorX - r.right);
            const dy = Math.max(r.top - cursorY, 0, cursorY - r.bottom);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nearDots = dist <= CURSOR_RADIUS + PROXIMITY_PAD;
            svcCursor.classList.toggle('is-hidden', nearDots);
            document.body.classList.toggle('svc-cursor-active', !nearDots);
          }
          cursorRaf = false;
        });
      };

      const syncCursorTone = () => {
        const tone = svcStage && svcStage.dataset.tone ? svcStage.dataset.tone : 'ink';
        document.body.dataset.svcTone = tone;
      };
      const showCursor = () => {
        if (cursorInside) return;
        cursorInside = true;
        svcCursor.classList.add('is-visible');
        document.body.classList.add('svc-cursor-active');
        syncCursorTone();
      };
      const hideCursor = () => {
        if (!cursorInside) return;
        cursorInside = false;
        svcCursor.classList.remove('is-visible');
        document.body.classList.remove('svc-cursor-active');
        delete document.body.dataset.svcTone;
      };

      document.addEventListener('mousemove', moveCursor, { passive: true });
      svcStack.addEventListener('mouseenter', showCursor);
      svcStack.addEventListener('mouseleave', hideCursor);
      // Keep tone in sync while scrolling between services with cursor inside
      window.addEventListener('scroll', () => {
        if (cursorInside) syncCursorTone();
      }, { passive: true });

    }
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
      const start = vh * 0.98;
      const end = vh * 0.90;
      const raw = Math.max(0, Math.min(1, (start - teamTop) / (start - end)));
      // Steep S-curve: t stays near 0 (cream) or 1 (navy) for most of the
      // window and rockets through 0.5 — so the grey color-mix midpoint
      // is only visible for a sliver of scroll, not a long fade.
      const t = raw < 0.5
        ? Math.pow(raw * 2, 6) * 0.5
        : 1 - Math.pow((1 - raw) * 2, 6) * 0.5;
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

  /* ---------- Team image parallax ---------- */
  const teamImage = document.querySelector('.team-image');
  if (teamImage && !prefersReduced) {
    let pRaf = false;
    const updateTeamParallax = () => {
      const rect = teamImage.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the rectangle's top hits the bottom of the viewport,
      // 1 when its bottom hits the top — full pass-through range.
      const progress = (vh - rect.top) / (vh + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      // Pan the visible window UP through the photo as the rectangle
      // scrolls past — bgy goes from 50% (lower body in view) to 0%
      // (heads/upper body in view). Set on the parent so both the bg
      // photo and the cutout layer share identical positioning.
      const py = (1 - clamped) * 50;
      teamImage.style.setProperty('--bgy', `${py.toFixed(1)}%`);
    };
    updateTeamParallax();
    window.addEventListener('scroll', () => {
      if (pRaf) return;
      pRaf = true;
      requestAnimationFrame(() => { updateTeamParallax(); pRaf = false; });
    }, { passive: true });
    window.addEventListener('resize', updateTeamParallax);
  }
})();
