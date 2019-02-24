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
    this.previousFrame = null;
  }

  start() {
    this.webcamProcessor.start();
  }

  process() {
    // get the current pixels
    const oldPixels = this.renderCtx.getImageData(0, 0, this.width, this.height);
    const newPixels = this.renderCtx.createImageData(this.width, this.height);

    // paint the new pixels
    if (this.previousFrame) {
      for (let i = 0; i < newPixels.data.length; i++) {
        newPixels.data[i] = Math.abs(oldPixels.data[i] - this.previousFrame.data[i]);
        if (i % 4 === 3) newPixels.data[i] = 255;
      }
      this.renderCtx.putImageData(newPixels, 0, 0);
    }

    // save the current pixels for the next round
    this.previousFrame = oldPixels;
  }
}
