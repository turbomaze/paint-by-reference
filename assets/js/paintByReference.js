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

  randomizeGoal() {
    this.goal.x = Math.floor(this.width * Math.random());
    this.goal.y = Math.floor(this.height * Math.random());
    console.log(this.goal);
  }

  process() {
    // get the current pixels
    const old = this.getImageData();
    const next = this.createImageData();

    // paint the new pixels
    if (this.previousFrame) {
      // keep track of whether we hit the target
      const targetIndex = 4 * (this.goal.y * this.width + this.goal.x);
      let hitTarget = false;

      // compute each pixel's delta
      for (let i = 0; i < next.data.length; i += 4) {
        let error = 0;
        error += Math.abs(old.data[i + 0] - this.previousFrame.data[i + 0]);
        error += Math.abs(old.data[i + 1] - this.previousFrame.data[i + 1]);
        error += Math.abs(old.data[i + 2] - this.previousFrame.data[i + 2]);
        const errorIsLarge = error > this.goal.threshold;

        next.data[i + 3] = errorIsLarge ? 255 : 0;
        hitTarget = (i === targetIndex && errorIsLarge) || hitTarget;
      }
      this.putImageData(next);

      // address the target success case
      if (hitTarget) {
        this.randomizeGoal();
      }
    }

    // draw the goal
    this.renderGoal();

    // save the current pixels for the next round
    this.previousFrame = old;
  }
}
