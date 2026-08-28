/* =================================================================
   BUILD MVPs WITH AI — JS FOUNDATION
   Deliverable 1: Foundation & Design System

   This file intentionally does almost nothing yet. It exists to:
     1. Prove the script loads and runs without console errors.
     2. Provide a single, clean entry point for future features
        (theme toggle, mobile nav, FAQ, modal, scroll animations,
        smooth scrolling, etc.) to be added in later deliverables.

   Do not add feature logic here yet — see README.md for the
   current stage and what belongs to future deliverables.
   ================================================================= */

(function () {
  'use strict';

  function init() {
    // Foundation check — confirms JS is wired up correctly.
    // Safe to remove once real features are added.
    document.documentElement.setAttribute('data-js-ready', 'true');

    initTheme();
    initNav();
    initCohortModal();
    initFAQ();
    initFooterYear();
    initScrollReveal();
  }

  /* -----------------------------------------------------------------
     Theme toggle — Deliverable 14
     The <html data-theme> attribute is already set by the inline
     script in <head> (before paint, from localStorage or system
     preference) so there is nothing to apply on load here — this
     just wires up the button and keeps everything in sync:
       - click: flips the theme, saves the explicit choice
       - system preference change: only followed while the user
         hasn't made an explicit choice yet
     ----------------------------------------------------------------- */
  function initTheme() {
    var STORAGE_KEY = 'theme';
    var toggle = document.getElementById('theme-toggle');
    var root = document.documentElement;
    var mediaQuery = window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

    function getStoredTheme() {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        return null;
      }
    }

    function setStoredTheme(theme) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {
        // localStorage unavailable (private browsing, disabled, etc.) —
        // the theme still applies for the current page view.
      }
    }

    function getCurrentTheme() {
      return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function updateToggleUI(theme) {
      if (!toggle) {
        return;
      }
      var isDark = theme === 'dark';
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    function applyTheme(theme, silent) {
      root.setAttribute('data-theme', theme);
      updateToggleUI(theme);
      if (!silent) {
        setStoredTheme(theme);
      }
    }

    function withTransition(fn) {
      root.classList.add('theme-transitioning');
      fn();
      window.setTimeout(function () {
        root.classList.remove('theme-transitioning');
      }, 400);
    }

    // Sync the button's icon/state with whatever theme the inline
    // head script already applied, before any click happens.
    updateToggleUI(getCurrentTheme());

    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
        withTransition(function () {
          applyTheme(next);
        });
      });
    }

    if (mediaQuery) {
      var onSystemPreferenceChange = function (event) {
        // Once the user has made an explicit choice, stop following
        // the OS-level preference.
        if (getStoredTheme()) {
          return;
        }
        withTransition(function () {
          applyTheme(event.matches ? 'dark' : 'light', true);
        });
      };

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', onSystemPreferenceChange);
      } else if (typeof mediaQuery.addListener === 'function') {
        // Safari < 14 fallback.
        mediaQuery.addListener(onSystemPreferenceChange);
      }
    }
  }

  /* -----------------------------------------------------------------
     Navigation — Deliverable 2
     Mobile hamburger menu (open/close, close on link click, close
     on Escape, aria-expanded updates). Smooth scrolling for nav
     links is handled by CSS (`scroll-behavior: smooth` in style.css).
     ----------------------------------------------------------------- */
  function initNav() {
    var toggle = document.getElementById('nav-toggle');
    var navLinks = document.getElementById('nav-links');

    if (!toggle || !navLinks) {
      return;
    }

    function openMenu() {
      navLinks.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }

    function closeMenu() {
      navLinks.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }

    toggle.addEventListener('click', function () {
      if (navLinks.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close the menu whenever a nav link or the CTA is clicked.
    navLinks.addEventListener('click', function (event) {
      var target = event.target.closest('.nav-link, .btn-nav-cta');
      if (target) {
        closeMenu();
      }
    });

    // Close on Escape and return focus to the toggle button.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navLinks.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* -----------------------------------------------------------------
     Cohort notify modal — Deliverable 10
     Opens/closes the "Get Notified" confirmation modal. Closes on
     Escape, on backdrop click, and on the close button. Traps Tab
     focus within the dialog while open and returns focus to the
     trigger button on close.

     Any element with the `.js-cohort-trigger` class opens this same
     modal — this is what the Final CTA (Deliverable 12) reuses to
     show the Cohort section's "Coming Soon" state instead of
     introducing a second modal/handler.
     ----------------------------------------------------------------- */
  function initCohortModal() {
    var triggers = document.querySelectorAll('.js-cohort-trigger');
    var modal = document.getElementById('cohort-modal');

    if (!triggers.length || !modal) {
      return;
    }

    var closeBtn = document.getElementById('cohort-modal-close');
    var lastFocused = null;
    var hideTimeout = null;
    var activeTrigger = null;

    function getFocusable() {
      return modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    }

    function onKeydown(event) {
      if (event.key === 'Escape') {
        closeModal();
        return;
      }

      if (event.key === 'Tab') {
        var focusable = getFocusable();
        if (!focusable.length) {
          return;
        }
        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    function openModal(trigger) {
      activeTrigger = trigger;
      lastFocused = document.activeElement;

      if (hideTimeout) {
        window.clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      modal.hidden = false;
      document.body.classList.add('has-modal-open');
      trigger.setAttribute('aria-expanded', 'true');

      // Add the open class on the next frame so the hidden -> visible
      // transition actually runs instead of jumping straight in.
      window.requestAnimationFrame(function () {
        modal.classList.add('is-open');
      });

      if (closeBtn) {
        closeBtn.focus();
      }

      document.addEventListener('keydown', onKeydown);
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.classList.remove('has-modal-open');
      if (activeTrigger) {
        activeTrigger.setAttribute('aria-expanded', 'false');
      }
      document.removeEventListener('keydown', onKeydown);

      hideTimeout = window.setTimeout(function () {
        modal.hidden = true;
      }, 250);

      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      } else if (activeTrigger) {
        activeTrigger.focus();
      }
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        openModal(trigger);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function (event) {
      if (event.target && event.target.hasAttribute('data-modal-close')) {
        closeModal();
      }
    });
  }

  /* -----------------------------------------------------------------
     FAQ accordion — Deliverable 11
     Click (or Enter/Space, handled natively by <button>) toggles a
     question's answer panel open/closed. Only the JS needed for the
     accordion lives here: aria-expanded + hidden are kept in sync,
     and each item is independent (multiple can be open at once).
     ----------------------------------------------------------------- */
  function initFAQ() {
    var faqList = document.querySelector('.faq__list');

    if (!faqList) {
      return;
    }

    var questions = faqList.querySelectorAll('.faq__question');
    // Tracks a pending "set hidden" timeout per answer panel so a
    // rapid re-toggle doesn't get clobbered by a stale timer.
    var hideTimeouts = new WeakMap();

    function openItem(button, item, panel) {
      var pending = hideTimeouts.get(panel);
      if (pending) {
        window.clearTimeout(pending);
        hideTimeouts.delete(panel);
      }

      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');

      // Add the open class on the next frame so the collapsed ->
      // expanded transition actually runs instead of jumping straight in.
      window.requestAnimationFrame(function () {
        item.classList.add('is-open');
      });
    }

    function closeItem(button, item, panel) {
      button.setAttribute('aria-expanded', 'false');
      item.classList.remove('is-open');

      var timeoutId = window.setTimeout(function () {
        panel.hidden = true;
        hideTimeouts.delete(panel);
      }, 250);

      hideTimeouts.set(panel, timeoutId);
    }

    function toggleItem(button) {
      var item = button.closest('.faq__item');
      var panel = document.getElementById(button.getAttribute('aria-controls'));

      if (!item || !panel) {
        return;
      }

      var isOpen = button.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        closeItem(button, item, panel);
      } else {
        openItem(button, item, panel);
      }
    }

    questions.forEach(function (button) {
      button.addEventListener('click', function () {
        toggleItem(button);
      });
    });
  }

  /* -----------------------------------------------------------------
     Footer — Deliverable 13
     Keeps the copyright year current without hardcoding it.
     ----------------------------------------------------------------- */
  function initFooterYear() {
    var yearEl = document.getElementById('footer-year');

    if (!yearEl) {
      return;
    }

    yearEl.textContent = String(new Date().getFullYear());
  }

  /* -----------------------------------------------------------------
     Scroll reveal — Deliverable 15
     Subtle fade/rise-in for each existing top-level section as it
     enters the viewport, via IntersectionObserver. Progressive
     enhancement: the `.reveal` class is only ever added here, so if
     this function bails out early (no IntersectionObserver support,
     or the user prefers reduced motion) sections are simply left
     exactly as they already render — fully visible, untouched.

     Sections already in view on page load are marked visible
     immediately, with no animation, so nothing above the fold ever
     flashes hidden-then-in on first paint. Each section reveals once
     and is then left alone.
     ----------------------------------------------------------------- */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      return;
    }

    var prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      return;
    }

    var targets = document.querySelectorAll('main > section, .site-footer');
    if (!targets.length) {
      return;
    }

    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    var toObserve = [];
    targets.forEach(function (el) {
      el.classList.add('reveal');

      var rect = el.getBoundingClientRect();
      var alreadyInView = rect.top < viewportHeight && rect.bottom > 0;

      if (alreadyInView) {
        el.classList.add('reveal--visible');
      } else {
        toObserve.push(el);
      }
    });

    if (!toObserve.length) {
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    toObserve.forEach(function (el) {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
