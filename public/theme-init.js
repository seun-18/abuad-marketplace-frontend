(function () {
  try {
    var root = document.documentElement;
    root.setAttribute('data-theme', 'light');
    root.classList.remove('dark');
    root.classList.add('light');
    try {
      localStorage.setItem('abuad_theme', 'light');
    } catch (e) {
      /* localStorage unavailable (private mode, etc.) — safe to ignore */
    }
  } catch (e) {
    /* no-op: never block page render for a theme preference */
  }
})();
