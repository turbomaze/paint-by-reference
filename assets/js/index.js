window.addEventListener('DOMContentLoaded', () => {
  const camera = document.getElementById('camera');
  const render = document.getElementById('render');
  const reference = document.getElementById('reference');
  const paintByReference = new PaintByReference(960, 540, 15, camera, render, reference);
  paintByReference.start();
});
