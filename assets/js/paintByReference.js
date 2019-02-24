class PaintByReference {
  constructor(width, height, fps, video, renderCanvas) {
    this.width = width;
    this.height = height;
    this.previousFrame = null;
    this.goal = { x: 100, y: 100, radius: 5, threshold: 80 };

    this.webcamProcessor = new WebcamProcessor(
      this.width,
      this.height,
      fps,
      video,
      renderCanvas,
      this.process.bind(this)
    );
  }

  start() {
    this.webcamProcessor.start();
  }

  getImageData() {
    const { width, height } = this;
    return this.webcamProcessor.renderCtx.getImageData(0, 0, width, height);
  }

  putImageData(data) {
    return this.webcamProcessor.renderCtx.putImageData(data, 0, 0);
  }

  createImageData() {
    const { width, height } = this;
    return this.webcamProcessor.renderCtx.createImageData(width, height);
  }

  renderGoal(goal) {
    const { x, y, radius } = this.goal;
    this.webcamProcessor.renderCtx.fillStyle = 'red';
    this.webcamProcessor.renderCtx.fillRect(x - radius, y - radius, radius, radius);
  }

  process() {
    // get the current pixels
    const old = this.getImageData();
    const next = this.createImageData();

    // paint the new pixels
    if (this.previousFrame) {
      const targetIndex = 4 * (this.goal.y * this.width + this.goal.x);
      for (let i = 0; i < next.data.length; i += 4) {
        let error = 0;
        error += Math.abs(old.data[i + 0] - this.previousFrame.data[i + 0]);
        error += Math.abs(old.data[i + 1] - this.previousFrame.data[i + 1]);
        error += Math.abs(old.data[i + 2] - this.previousFrame.data[i + 2]);
        if (error > this.goal.threshold) {
          next.data[i + 3] = 255;

          if (i === targetIndex) {
            console.log('gottem!');
          }
        } else {
          next.data[i + 3] = 0;
        }
      }
      this.putImageData(next);
    }

    // draw the goal
    this.renderGoal();

    // save the current pixels for the next round
    this.previousFrame = old;
  }
}
