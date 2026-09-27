/* ============================================================================
   AREKAS ARENA — "FOREST & GOLD" THEME ENHANCEMENTS
   Progressive layer on top of the existing markup. Adds only presentation:
   a vertical section rail, ornamental rules under headings, the hero kicker
   and the brand tagline. Removes nothing and rewrites no copy.
   ========================================================================== */
(function () {
  'use strict';

  var d = document;

  function ready(fn) {
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* ── 1 · Page mode ───────────────────────────────────────────────────── */
  function setPageMode() {
    var hasHero = !!d.querySelector('#hero, .hero-carousel');
    d.body.classList.add(hasHero ? 'ax-hero' : 'ax-inner');
    // Only pages with the fixed nav need the body offset that clears it.
    if (d.querySelector('.site-nav')) d.body.classList.add('ax-has-nav');
    // Pages that ship a hamburger can collapse their nav earlier.
    if (d.querySelector('.nav-toggler')) d.body.classList.add('ax-has-toggler');
  }

  /* ── 2 · Brand tagline under the logo ────────────────────────────────── */
  function brandTagline() {
    var brand = d.querySelector('.nav-brand');
    if (!brand || brand.querySelector('.ax-brand-tag')) return;
    var tag = d.createElement('span');
    tag.className = 'ax-brand-tag';
    tag.textContent = 'Events · Weddings · Stays';
    brand.appendChild(tag);
  }

  /* ── 3 · Mark the current page in the nav ────────────────────────────── */
  function markCurrentLink() {
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    d.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('#')[0].split('/').pop().toLowerCase();
      if (href && href === here) a.classList.add('ax-current');
    });
  }

  /* ── 4 · Ornamental rule under section headings ──────────────────────── */
  var RULE_TARGETS = [
    { sel: '.glance-hdr .s-h2', center: true },
    { sel: '.stays-hdr .s-h2', center: true },
    { sel: '.why-hdr .s-h2', center: true },
    { sel: '.faq-hdr .s-h2', center: true },
    { sel: '.gallery-hdr .gallery-title', center: true, light: true },
    { sel: '.vh-hdr .vh-title', center: true, light: true },
    { sel: '.pkg-hdr .pkg-title', center: true, light: true },
    { sel: '.exp-hdr .s-h2', light: true },
    { sel: '.about-text .s-h2' },
    { sel: '.projects-hdr .s-h2' },
    { sel: '.page-hero h1', center: true, light: true },
    { sel: '.section-h2' },
    { sel: '.stay-section-hdr .s-h2', center: true }
  ];

  function ornamentalRules() {
    RULE_TARGETS.forEach(function (t) {
      d.querySelectorAll(t.sel).forEach(function (h) {
        if (h.nextElementSibling && h.nextElementSibling.classList.contains('ax-rule')) return;
        var r = d.createElement('span');
        r.className = 'ax-rule' + (t.center ? ' ax-rule-center' : '') + (t.light ? ' ax-rule-light' : '');
        r.setAttribute('aria-hidden', 'true');
        h.parentNode.insertBefore(r, h.nextSibling);
      });
    });
  }

  /* ── 5 · Hero kicker above the headline ──────────────────────────────── */
  function heroKicker() {
    d.querySelectorAll('.slide-inner').forEach(function (inner) {
      if (inner.querySelector('.ax-hero-kicker')) return;
      var title = inner.querySelector('.slide-title');
      if (!title) return;
      var k = d.createElement('span');
      k.className = 'ax-hero-kicker';
      k.innerHTML = 'We host the moments,<br>you keep them forever.';
      inner.insertBefore(k, title);
    });
  }

  /* ── 6 · Vertical section rail ───────────────────────────────────────── */
  var RAIL_MAP = [
    { id: 'hero', label: 'Home', icon: 'bi-flower1' },
    { id: 'glance', label: 'Venue', icon: 'bi-geo-alt' },
    { id: 'experiences', label: 'Events', icon: 'bi-stars' },
    { id: 'stays', label: 'Stays', icon: 'bi-house-heart' },
    { id: 'gallery', label: 'Gallery', icon: 'bi-images' },
    { id: 'venue-highlights', label: 'Spaces', icon: 'bi-tree' },
    { id: 'pricing', label: 'Pricing', icon: 'bi-tag' },
    { id: 'faq', label: 'FAQ', icon: 'bi-question-circle' },
    { id: 'contact', label: 'Contact', icon: 'bi-envelope' }
  ];

  function buildRail() {
    var items = RAIL_MAP.filter(function (i) { return d.getElementById(i.id); });
    if (items.length < 4) return;

    var rail = d.createElement('aside');
    rail.className = 'ax-rail';
    rail.setAttribute('aria-label', 'Section navigation');

    var ol = d.createElement('ol');
    items.forEach(function (i) {
      var li = d.createElement('li');
      var a = d.createElement('a');
      a.href = '#' + i.id;
      a.dataset.target = i.id;
      a.innerHTML =
        '<span class="ax-rail-dot"><i class="bi ' + i.icon + '"></i></span>' +
        '<span class="ax-rail-lbl">' + i.label + '</span>';
      li.appendChild(a);
      ol.appendChild(li);
    });
    rail.appendChild(ol);
    d.body.appendChild(rail);

    var links = Array.prototype.slice.call(rail.querySelectorAll('a'));
    var sections = items.map(function (i) { return d.getElementById(i.id); });

    // Offsets are read once, not on every frame — reading offsetTop inside
    // the scroll handler forces a layout flush on each tick.
    var offsets = [];
    function measure() {
      offsets = sections.map(function (s) { return s.offsetTop; });
    }

    var activeIndex = -1;
    function spy() {
      var probe = window.scrollY + window.innerHeight * 0.35;
      var current = 0;
      for (var i = 0; i < offsets.length; i++) {
        if (offsets[i] <= probe) current = i;
      }
      if (current === activeIndex) return;
      if (links[activeIndex]) links[activeIndex].classList.remove('active');
      links[current].classList.add('active');
      activeIndex = current;
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { spy(); ticking = false; });
    }, { passive: true });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { measure(); spy(); }, 150);
    }, { passive: true });

    measure();
    spy();
    // Images settling changes section offsets, so re-measure after load.
    window.addEventListener('load', function () { measure(); spy(); });
  }

  /* ── 7 · Play looping videos only while they are on screen ───────────
     The reel strip ships seven muted autoplay loops. Decoding all of
     them at once, on and off screen, is what made scrolling stutter. */
  function videoVisibility() {
    // The autoplay attribute is stripped from the markup, so without an
    // observer to start them the loops must simply all play as before.
    if (!('IntersectionObserver' in window)) {
      d.querySelectorAll('video[loop]').forEach(function (v) {
        if (v.controls) return;
        v.muted = true;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.2 });

    function adopt(v) {
      if (v.dataset.axManaged || v.controls) return;
      v.dataset.axManaged = '1';
      v.removeAttribute('autoplay');
      if (!v.getAttribute('preload')) v.preload = 'metadata';
      v.muted = true;
      v.pause();
      obs.observe(v);
    }

    d.querySelectorAll('video[loop]').forEach(adopt);

    // The gallery page builds its reel strip from script after load.
    if ('MutationObserver' in window) {
      new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          Array.prototype.forEach.call(m.addedNodes, function (n) {
            if (n.nodeType !== 1) return;
            if (n.tagName === 'VIDEO' && n.loop) adopt(n);
            else if (n.querySelectorAll) n.querySelectorAll('video[loop]').forEach(adopt);
          });
        });
      }).observe(d.body, { childList: true, subtree: true });
    }
  }

  ready(function () {
    setPageMode();
    brandTagline();
    markCurrentLink();
    ornamentalRules();
    heroKicker();
    buildRail();
    videoVisibility();
  });
})();
