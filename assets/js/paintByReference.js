class PaintByReference {
  constructor(width, height, fps, video, renderCanvas) {
    this.webcamProcessor = new WebcamProcessor(
      width,
      height,
      fps,
      video,
      renderCanvas,
      this.process
    );
  }

  start() {
    this.webcamProcessor.start();
  }

  process() {
    const pixels = this.renderCtx.getImageData(0, 0, this.width, this.height);
    for (let i = 0; i < pixels.data.length; i++) {
      if (Math.random() < 0.01) {
        pixels.data[i] = 0;
      }
    }
    this.renderCtx.putImageData(pixels, 0, 0);
  }
}
