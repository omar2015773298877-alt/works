(() => {
  'use strict';

  const body = document.body;
  const header = document.getElementById('site-header');
  const progressBar = document.getElementById('scroll-progress-bar');
  const floatingTop = document.getElementById('floating-top');
  const menuToggle = document.getElementById('menu-toggle');
  const siteMenu = document.getElementById('site-menu');
  const menuLinks = [...siteMenu.querySelectorAll('[data-menu-link]')];
  const desktopLinks = [...document.querySelectorAll('.desktop-nav .nav-link')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const yearElement = document.getElementById('year');
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const WHATSAPP_NUMBER = '967781581500';

  /* ---------- السنة الحالية ---------- */
  if (yearElement) {
    const currentYear = new Date().getFullYear();
    try {
      yearElement.textContent = new Intl.NumberFormat('ar-EG', {
        useGrouping: false
      }).format(currentYear);
    } catch (error) {
      yearElement.textContent = String(currentYear);
    }
  }

  /* ---------- شريط التقدم والتمرير ---------- */
  let ticking = false;

  const updateOnScroll = () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(100, (scrollTop / scrollable) * 100) : 0;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (header) {
      header.classList.toggle('is-scrolled', scrollTop > 14);
    }

    if (floatingTop) {
      floatingTop.classList.toggle('is-visible', scrollTop > 620);
    }

    updateActiveLink(scrollTop);
    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateOnScroll);
    }
  };

  /* ---------- تحديد القسم النشط ---------- */
  const updateActiveLink = (scrollTop) => {
    if (!sections.length || !desktopLinks.length) return;

    const offset = 160;
    let activeId = sections[0].id;

    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top + scrollTop;
      if (scrollTop + offset >= sectionTop) {
        activeId = section.id;
      }
    });

    const atBottom = scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 5;
    if (atBottom) {
      activeId = sections[sections.length - 1].id;
    }

    desktopLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);
  updateOnScroll();

  if (floatingTop) {
    floatingTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  }

  /* ---------- قائمة الجوال ---------- */
  let lastFocusedElement = null;

  const getMenuFocusable = () => {
    return [menuToggle, ...siteMenu.querySelectorAll('a[href], button:not([disabled])')].filter(Boolean);
  };

  const openMenu = () => {
    lastFocusedElement = document.activeElement;
    body.classList.add('menu-open');
    siteMenu.classList.add('is-open');
    siteMenu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'إغلاق القائمة');

    window.setTimeout(() => {
      if (menuLinks[0]) menuLinks[0].focus();
    }, 220);
  };

  const closeMenu = (restoreFocus = true) => {
    if (!siteMenu.classList.contains('is-open')) return;

    body.classList.remove('menu-open');
    siteMenu.classList.remove('is-open');
    siteMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'فتح القائمة');

    if (restoreFocus) {
      const target = lastFocusedElement instanceof HTMLElement ? lastFocusedElement : menuToggle;
      target.focus();
    }
  };

  if (menuToggle && siteMenu) {
    menuToggle.addEventListener('click', () => {
      if (siteMenu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menuLinks.forEach((link) => {
      link.addEventListener('click', () => closeMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      if (!siteMenu.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getMenuFocusable();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1080) {
        closeMenu(false);
      }
    });
  }

  /* ---------- ظهور العناصر أثناء التمرير ---------- */
  const revealItems = [...document.querySelectorAll('[data-reveal]')];

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -7% 0px'
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));

    // احتياطي في حال تأخر مراقب التقاطع
    window.setTimeout(() => {
      revealItems.forEach((item) => {
        if (item.getBoundingClientRect().top < window.innerHeight) {
          item.classList.add('is-visible');
        }
      });
    }, 3200);
  }

  /* ---------- نموذج التواصل عبر واتساب ---------- */
  if (contactForm && formStatus) {
    const nameField = contactForm.querySelector('#name');
    const messageField = contactForm.querySelector('#message');

    const clearStatus = () => {
      formStatus.textContent = '';
      formStatus.classList.remove('is-success');
    };

    [nameField, messageField].forEach((field) => {
      if (field) field.addEventListener('input', clearStatus);
    });

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearStatus();

      const name = nameField ? nameField.value.trim() : '';
      const message = messageField ? messageField.value.trim() : '';

      if (!name || !message) {
        formStatus.textContent = 'يرجى كتابة اسمك ورسالتك قبل الإرسال.';
        if (!name && nameField) {
          nameField.focus();
        } else if (messageField) {
          messageField.focus();
        }
        return;
      }

      const whatsappText = `مرحبًا ANAA،\n\nأنا ${name}.\n\n${message}`;
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;
      const popup = window.open(whatsappUrl, '_blank');

      if (popup) {
        popup.opener = null;
      }

      if (popup) {
        formStatus.textContent = 'تم تجهيز رسالتك وفتح واتساب في نافذة جديدة.';
        formStatus.classList.add('is-success');
      } else {
        formStatus.textContent = 'تعذّر فتح النافذة تلقائيًا. ';
        const directLink = document.createElement('a');
        directLink.href = whatsappUrl;
        directLink.target = '_blank';
        directLink.rel = 'noopener noreferrer';
        directLink.textContent = 'افتح واتساب الآن';
        directLink.style.color = 'inherit';
        directLink.style.textDecoration = 'underline';
        formStatus.append(directLink);
      }
    });
  }

  /* ---------- تمرير سلس مع مراعاة ارتفاع الترويسة ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      const headerHeight = header ? header.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 10;

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: reduceMotion ? 'auto' : 'smooth'
      });

      if (history.pushState) {
        history.pushState(null, '', targetId);
      }
    });
  });
})();
