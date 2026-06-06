/**
 * Portfolio Site — Main JavaScript
 * Handles: navigation, scroll effects, reveal animations,
 * project filtering, and accessible form validation.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // MOBILE NAVIGATION
  // ============================================
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-navigation');
  const navOverlay = document.getElementById('nav-overlay');

  if (menuToggle && mainNav) {
    const openMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Close navigation menu');
      mainNav.setAttribute('data-open', 'true');
      if (navOverlay) navOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Focus first nav link for keyboard users
      const firstLink = mainNav.querySelector('.nav-link');
      if (firstLink) firstLink.focus();
    };

    const closeMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
      mainNav.setAttribute('data-open', 'false');
      if (navOverlay) navOverlay.classList.remove('active');
      document.body.style.overflow = '';
      menuToggle.focus();
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', closeMenu);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });

    // Trap focus in mobile nav
    mainNav.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      if (menuToggle.getAttribute('aria-expanded') !== 'true') return;

      const focusableEls = mainNav.querySelectorAll('a[href], button');
      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        menuToggle.focus();
      }
    });
  }


  // ============================================
  // HEADER SCROLL EFFECT
  // ============================================
  const siteHeader = document.querySelector('.site-header');

  if (siteHeader) {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check
  }


  // ============================================
  // SCROLL REVEAL ANIMATIONS
  // ============================================
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: just make everything visible
    revealElements.forEach((el) => el.classList.add('visible'));
  }


  // ============================================
  // PROJECT FILTERING
  // ============================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const filterStatus = document.getElementById('filter-status');

  if (filterButtons.length > 0 && projectCards.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        // Update button states
        filterButtons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');

        // Filter cards
        let visibleCount = 0;
        projectCards.forEach((card) => {
          const category = card.getAttribute('data-category');
          const shouldShow = filter === 'all' || category === filter;
          card.style.display = shouldShow ? '' : 'none';
          if (shouldShow) visibleCount++;
        });

        // Announce to screen readers
        if (filterStatus) {
          const label = filter === 'all' ? 'all categories' : btn.textContent.trim();
          filterStatus.textContent = `Showing ${visibleCount} project${visibleCount !== 1 ? 's' : ''} in ${label}.`;
        }
      });
    });
  }


  // ============================================
  // CONTACT FORM VALIDATION
  // ============================================
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    const fields = {
      name: {
        el: document.getElementById('contact-name'),
        errorEl: document.getElementById('contact-name-error'),
        validate: (val) => val.trim().length >= 2,
        errorMsg: 'Please enter your full name (at least 2 characters).',
      },
      email: {
        el: document.getElementById('contact-email'),
        errorEl: document.getElementById('contact-email-error'),
        validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        errorMsg: 'Please enter a valid email address.',
      },
      subject: {
        el: document.getElementById('contact-subject'),
        errorEl: document.getElementById('contact-subject-error'),
        validate: (val) => val.trim().length > 0,
        errorMsg: 'Please select a subject.',
      },
      message: {
        el: document.getElementById('contact-message'),
        errorEl: document.getElementById('contact-message-error'),
        validate: (val) => val.trim().length >= 20,
        errorMsg: 'Please enter a message (at least 20 characters).',
      },
    };

    // Validate single field
    const validateField = (key) => {
      const field = fields[key];
      if (!field || !field.el) return true;

      const isValid = field.validate(field.el.value);
      field.el.setAttribute('aria-invalid', isValid ? 'false' : 'true');

      if (field.errorEl) {
        field.errorEl.textContent = isValid ? '' : field.errorMsg;
      }

      return isValid;
    };

    // Real-time validation on blur
    Object.keys(fields).forEach((key) => {
      const field = fields[key];
      if (field.el) {
        field.el.addEventListener('blur', () => validateField(key));
        field.el.addEventListener('input', () => {
          // Only clear error on input if it was invalid
          if (field.el.getAttribute('aria-invalid') === 'true') {
            validateField(key);
          }
        });
      }
    });

    // Submit handler
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isFormValid = true;
      let firstInvalid = null;

      Object.keys(fields).forEach((key) => {
        const valid = validateField(key);
        if (!valid && !firstInvalid) {
          firstInvalid = fields[key].el;
        }
        if (!valid) isFormValid = false;
      });

      if (!isFormValid) {
        // Focus first invalid field
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Simulate form submission
      contactForm.style.display = 'none';
      if (formSuccess) {
        formSuccess.classList.add('visible');
        formSuccess.focus();
      }
    });
  }

});
