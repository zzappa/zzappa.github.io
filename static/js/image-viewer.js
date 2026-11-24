(function () {
  var images = document.querySelectorAll('.single-content figure img');
  if (!images.length || typeof HTMLDialogElement === 'undefined') return;

  var dialog = document.createElement('dialog');
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-label', 'Image viewer');
  dialog.innerHTML = '<div class="image-viewer-toolbar">' +
    '<span class="image-viewer-hint">Scroll to zoom · Drag to move</span>' +
    '<button class="image-viewer-button" type="button" data-action="out" aria-label="Zoom out">−</button>' +
    '<span class="image-viewer-zoom" aria-live="polite">100%</span>' +
    '<button class="image-viewer-button" type="button" data-action="in" aria-label="Zoom in">+</button>' +
    '<button class="image-viewer-button" type="button" data-action="reset" aria-label="Reset zoom">Reset</button>' +
    '<button class="image-viewer-button" type="button" data-action="close" aria-label="Close image viewer">×</button>' +
    '</div><div class="image-viewer-viewport"><img class="image-viewer-image" draggable="false" alt=""></div>';
  document.body.appendChild(dialog);

  var viewport = dialog.querySelector('.image-viewer-viewport');
  var image = dialog.querySelector('.image-viewer-image');
  var zoomLabel = dialog.querySelector('.image-viewer-zoom');
  var closeButton = dialog.querySelector('[data-action="close"]');
  var scale = 1;
  var offsetX = 0;
  var offsetY = 0;
  var drag = null;
  var previousOverflow = '';
  var opener = null;

  function render() {
    image.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px) scale(' + scale + ')';
    zoomLabel.textContent = Math.round(scale * 100) + '%';
  }

  function zoom(next, clientX, clientY) {
    next = Math.max(1, Math.min(8, next));
    if (next === 1) {
      offsetX = 0;
      offsetY = 0;
    } else {
      var rect = viewport.getBoundingClientRect();
      var x = (clientX == null ? rect.left + rect.width / 2 : clientX) - rect.left - rect.width / 2;
      var y = (clientY == null ? rect.top + rect.height / 2 : clientY) - rect.top - rect.height / 2;
      var ratio = next / scale;
      offsetX = x - (x - offsetX) * ratio;
      offsetY = y - (y - offsetY) * ratio;
    }
    scale = next;
    render();
  }

  function open(source, trigger) {
    opener = trigger;
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    image.src = source.currentSrc || source.src;
    image.alt = source.alt || 'Enlarged image';
    render();
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    closeButton.focus();
  }

  dialog.addEventListener('close', function () {
    document.body.style.overflow = previousOverflow;
    image.removeAttribute('src');
    drag = null;
    viewport.classList.remove('is-dragging');
    if (opener) opener.focus();
  });
  dialog.addEventListener('wheel', function (event) {
    event.preventDefault();
    var multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
    zoom(scale * Math.exp(-event.deltaY * multiplier * .0015), event.clientX, event.clientY);
  }, { passive: false });
  viewport.addEventListener('pointerdown', function (event) {
    if (event.button !== 0 || scale <= 1) return;
    drag = { x: event.clientX, y: event.clientY, offsetX: offsetX, offsetY: offsetY };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
    event.preventDefault();
  });
  viewport.addEventListener('pointermove', function (event) {
    if (!drag) return;
    offsetX = drag.offsetX + event.clientX - drag.x;
    offsetY = drag.offsetY + event.clientY - drag.y;
    render();
  });
  function endDrag() { drag = null; viewport.classList.remove('is-dragging'); }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('lostpointercapture', endDrag);
  dialog.querySelector('[data-action="in"]').addEventListener('click', function () { zoom(scale * 1.25); });
  dialog.querySelector('[data-action="out"]').addEventListener('click', function () { zoom(scale / 1.25); });
  dialog.querySelector('[data-action="reset"]').addEventListener('click', function () { zoom(1); });
  closeButton.addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('keydown', function (event) {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(scale * 1.25); }
    if (event.key === '-' || event.key === '_') { event.preventDefault(); zoom(scale / 1.25); }
    if (event.key === '0') { event.preventDefault(); zoom(1); }
  });

  images.forEach(function (source) {
    var link = source.closest('a');
    if (link) {
      link.addEventListener('click', function (event) {
        if (event.target !== source) return;
        event.preventDefault();
        open(source, link);
      });
      return;
    }
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'post-image-button';
    button.setAttribute('aria-label', source.alt ? 'Enlarge image: ' + source.alt : 'Enlarge image');
    source.parentNode.insertBefore(button, source);
    button.appendChild(source);
    button.addEventListener('click', function () { open(source, button); });
  });
})();
