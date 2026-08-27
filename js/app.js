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

    initNav();
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
