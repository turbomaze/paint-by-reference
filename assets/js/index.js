window.addEventListener('DOMContentLoaded', () => {
  const camera = document.getElementById('camera');
  const render = document.getElementById('render');
  const paintByReference = new PaintByReference(960, 540, 15, camera, render);
  paintByReference.start();
});
