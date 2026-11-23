(function () {
  var button = document.querySelector('.theme-toggle');
  if (!button) return;

  function updateButton() {
    var dark = document.documentElement.classList.contains('dark');
    button.setAttribute('aria-checked', dark ? 'true' : 'false');
  }

  button.addEventListener('click', function () {
    var root = document.documentElement;
    var next = root.classList.contains('dark') ? 'light' : 'dark';
    root.classList.remove('light', 'dark');
    root.classList.add(next);
    try {
      localStorage.setItem('blog-theme', next);
    } catch (error) {}
    updateButton();
  });

  updateButton();
  button.hidden = false;
})();
