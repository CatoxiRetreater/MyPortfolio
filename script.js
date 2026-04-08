/* ============================================================
   SANGAM KHANNA — PORTFOLIO v2 INTERACTIONS
   GSAP · Lenis · Custom Cursor · Preloader · Magnetic
   ============================================================ */

(function () {
  'use strict';

  // ─── REGISTER GSAP PLUGINS ───────────────────────────────
  gsap.registerPlugin(ScrollTrigger);

  // ─── LENIS SMOOTH SCROLL ─────────────────────────────────
  let lenis;

  function initLenis() {
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
        infinite: false,
      });

      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } catch (e) {
      console.warn('Lenis failed to initialize, using native scroll.', e);
    }
  }

  // ─── NOISE TEXTURE ───────────────────────────────────────
  function initNoise() {
    const noiseEl = document.getElementById('noise');
    if (!noiseEl) return;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(256, 256);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const val = Math.random() * 255;
      imageData.data[i] = val;
      imageData.data[i + 1] = val;
      imageData.data[i + 2] = val;
      imageData.data[i + 3] = 20;
    }

    ctx.putImageData(imageData, 0, 0);
    noiseEl.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`;
  }

  // ─── PRELOADER ───────────────────────────────────────────
  function initPreloader() {
    return new Promise((resolve) => {
      const preloader = document.getElementById('preloader');
      const counter = document.getElementById('preloader-counter');
      const fill = document.getElementById('preloader-fill');

      if (!preloader) { resolve(); return; }

      // Prevent scroll during preload
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';

      const count = { val: 0 };

      gsap.to(count, {
        val: 100,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
          const v = Math.round(count.val);
          if (counter) counter.textContent = v;
          if (fill) fill.style.width = v + '%';
        },
        onComplete: () => {
          gsap.to(preloader, {
            yPercent: -100,
            duration: 0.9,
            ease: 'power4.inOut',
            delay: 0.2,
            onComplete: () => {
              preloader.style.display = 'none';
              document.body.style.overflow = '';
              if (lenis) lenis.start();
              resolve();
            }
          });
        }
      });
    });
  }

  // ─── HERO ANIMATIONS ────────────────────────────────────
  function animateHero() {
    const tl = gsap.timeline({
      defaults: { ease: 'power4.out' },
      onComplete: initHeroParallax, // only create parallax AFTER entry finishes
    });

    tl.from('#hero-label', {
      y: 20,
      opacity: 0,
      duration: 0.8,
    })
    .from('[data-hero-text]', {
      y: '120%',
      opacity: 0,
      duration: 1.2,
      stagger: 0.12,
    }, '-=0.4')
    .from('#hero-tagline', {
      y: 30,
      opacity: 0,
      duration: 0.9,
    }, '-=0.6')
    .from('#hero-ctas', {
      y: 20,
      opacity: 0,
      duration: 0.7,
    }, '-=0.5')
    .to('#hero-portrait', {
      opacity: 1,
      scale: 1,
      duration: 1.1,
      ease: 'power3.out',
    }, '-=0.8')
    .to('#hero-scroll', {
      opacity: 1,
      duration: 0.6,
    }, '-=0.3');
  }

  // ─── HERO PARALLAX (created after entry animation) ─────
  function initHeroParallax() {
    // Clear any leftover inline styles from the entry `from()` tweens
    gsap.set('[data-hero-text]', { clearProps: 'all' });
    gsap.set('#hero-label', { clearProps: 'all' });
    gsap.set('#hero-tagline', { clearProps: 'all' });
    gsap.set('#hero-ctas', { clearProps: 'all' });

    // Name fades out smoothly on scroll
    gsap.fromTo('[data-hero-text]',
      { y: 0, opacity: 1 },
      {
        y: -100,
        opacity: 0,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '60% top',
          scrub: true,
        }
      }
    );

    // Label, tagline, CTAs also fade out
    gsap.fromTo('#hero-label, #hero-tagline, #hero-ctas',
      { opacity: 1 },
      {
        opacity: 0,
        y: -30,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '50% top',
          scrub: true,
        }
      }
    );

    // Portrait parallax
    gsap.fromTo('#hero-portrait',
      { y: 0 },
      {
        y: -60,
        opacity: 0,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '70% top',
          scrub: true,
        }
      }
    );

    // Scroll indicator fades early
    gsap.to('#hero-scroll', {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: '10% top',
        end: '25% top',
        scrub: true,
      }
    });
  }

  // ─── CUSTOM CURSOR ───────────────────────────────────────
  function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    if (!dot || !ring || window.innerWidth < 768 || 'ontouchstart' in window) {
      if (dot) dot.style.display = 'none';
      if (ring) ring.style.display = 'none';
      return;
    }

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let visible = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!visible) {
        visible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }

      dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
    });

    document.addEventListener('mouseleave', () => {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });

    function renderRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      requestAnimationFrame(renderRing);
    }
    renderRing();

    // Hover interactions
    const interactives = document.querySelectorAll('a, button, .magnetic, [role="button"]');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.classList.add('cursor-ring--hover');
        dot.classList.add('cursor-dot--hover');
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('cursor-ring--hover');
        dot.classList.remove('cursor-dot--hover');
      });
    });
  }

  // ─── TEXT SPLITTING + SCROLL REVEALS ─────────────────────
  function initScrollAnimations() {
    // Split text into words for reveal
    document.querySelectorAll('.split-text').forEach(el => {
      const text = el.textContent.trim();
      const words = text.split(/\s+/);
      el.innerHTML = '';

      words.forEach((word, i) => {
        const wrapper = document.createElement('span');
        wrapper.className = 'word-wrap';

        const inner = document.createElement('span');
        inner.className = 'word';
        inner.textContent = word;

        wrapper.appendChild(inner);
        el.appendChild(wrapper);

        if (i < words.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });

      gsap.from(el.querySelectorAll('.word'), {
        y: '105%',
        duration: 0.9,
        stagger: 0.025,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          toggleActions: 'play none none none',
        }
      });
    });

    // Simple reveal-up
    document.querySelectorAll('.reveal-up').forEach((el, i) => {
      gsap.from(el, {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      });
    });
  }

  // ─── ANIMATED COUNTERS ───────────────────────────────────
  function initCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2.2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(obj.val);
            }
          });
        }
      });
    });
  }

  // ─── TIMELINE PROGRESS ───────────────────────────────────
  function initTimeline() {
    const progress = document.getElementById('timeline-progress');
    if (!progress) return;

    gsap.to(progress, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.timeline',
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      }
    });
  }

  // ─── MAGNETIC BUTTONS ────────────────────────────────────
  function initMagneticButtons() {
    if (window.innerWidth < 768 || 'ontouchstart' in window) return;

    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: x * 0.25,
          y: y * 0.25,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.3)',
        });
      });
    });
  }

  // ─── NAVBAR ──────────────────────────────────────────────
  function initNav() {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('nav-burger');
    const links = document.getElementById('nav-links');

    if (!nav) return;

    // Hide/show on scroll + scrolled state
    let lastScroll = 0;

    ScrollTrigger.create({
      onUpdate: (self) => {
        const scroll = self.scroll();

        if (scroll > 300 && self.direction === 1) {
          nav.classList.add('nav--hidden');
        } else {
          nav.classList.remove('nav--hidden');
        }

        if (scroll > 80) {
          nav.classList.add('nav--scrolled');
        } else {
          nav.classList.remove('nav--scrolled');
        }

        lastScroll = scroll;
      }
    });

    // Burger
    if (burger && links) {
      burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        links.classList.toggle('open');
      });

      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          burger.classList.remove('active');
          links.classList.remove('open');
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          burger.classList.remove('active');
          links.classList.remove('open');
        }
      });
    }

    // Active link tracking
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('[data-nav]');

    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => updateActiveLink(section.id),
        onEnterBack: () => updateActiveLink(section.id),
      });
    });

    function updateActiveLink(id) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  }

  // ─── SMOOTH SCROLL ANCHORS ───────────────────────────────
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        if (lenis) {
          lenis.scrollTo(target, { offset: -80, duration: 1.5 });
        } else {
          const navH = document.getElementById('nav')?.offsetHeight || 0;
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - navH - 20,
            behavior: 'smooth',
          });
        }
      });
    });
  }

  // ─── SCROLL PROGRESS BAR ────────────────────────────────
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    gsap.to(bar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      }
    });
  }

  // ─── MARQUEE SPEED VARIATION ON SCROLL ───────────────────
  function initMarquee() {
    const track = document.querySelector('.marquee__track');
    if (!track) return;

    // Speed up marquee on scroll
    ScrollTrigger.create({
      trigger: '.marquee',
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const speed = 40 - (Math.abs(self.getVelocity()) / 500);
        track.style.animationDuration = Math.max(10, speed) + 's';
      }
    });
  }

  // ─── INIT EVERYTHING ────────────────────────────────────
  async function init() {
    initLenis();
    initNoise();
    initCursor();
    initNav();
    initSmoothAnchors();
    initScrollProgress();
    initMagneticButtons();
    initMarquee();

    // Preloader → Hero → Scroll animations
    await initPreloader();
    animateHero();

    // Delay scroll-triggered animations slightly
    requestAnimationFrame(() => {
      initScrollAnimations();
      initCounters();
      initTimeline();
      ScrollTrigger.refresh();
    });
  }

  // Wait for DOM + fonts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
