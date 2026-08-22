// Minimal, dependency-free JS — mobile nav toggle only.
// No external requests, no eval, no innerHTML from untrusted input.
(function () {
  'use strict';

  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('mobileMenu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close the mobile menu after a nav link is tapped.
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();
