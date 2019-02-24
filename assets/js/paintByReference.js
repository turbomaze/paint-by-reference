class PaintByReference {
  constructor(width, height, fps, video, renderCanvas, reference, dot) {
    this.width = width;
    this.height = height;
    this.canvasWidth = this.parsePx(window.getComputedStyle(renderCanvas).width);
    this.canvasHeight = this.parsePx(window.getComputedStyle(renderCanvas).height);
    this.reference = reference;
    this.dot = dot;

    this.previousFrame = null;
    this.goal = { x: -1, y: -1, radius: 5, threshold: 80 };
    this.points = [];

    this.webcamProcessor = new WebcamProcessor(
      this.width,
      this.height,
      fps,
      video,
      renderCanvas,
      this.process.bind(this)
    );

    renderCanvas.addEventListener('click', this.handleClick.bind(this), false);
    reference.addEventListener('click', this.changeGoal.bind(this), false);
  }

  parsePx(px) {
    return parseInt(px.replace('px', ''));
  }

  start() {
    this.webcamProcessor.start();
  }

  handleClick(e) {
    const rect = this.webcamProcessor.renderCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scale = this.width / this.canvasWidth;

    if (this.points.length < 4) {
      this.points.push([x * scale, y * scale]);
    }
  }

  changeGoal(e) {
    const rect = this.reference.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // mark the goal on the reference
    this.dot.style.left = x - 2.5 + 'px';
    this.dot.style.top = y - 2.5 + 'px';

    // adjust the goal
    const xPercent = x / this.reference.width;
    const yPercent = y / this.reference.height;
    this.goal.x = Math.floor(this.width * xPercent);
    this.goal.y = Math.floor(this.height * yPercent);
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
    this.webcamProcessor.renderCtx.fillStyle = 'blue';
    this.webcamProcessor.renderCtx.fillRect(x - radius, y - radius, 2 * radius, 2 * radius);
  }

  renderCanvasOutline() {
    if (this.points.length > 1) {
      const [x0, y0] = this.points[0];

      this.webcamProcessor.renderCtx.strokeStyle = 'red';
      this.webcamProcessor.renderCtx.beginPath();
      this.webcamProcessor.renderCtx.moveTo(x0, y0);

      for (let i = 1; i < this.points.length; i++) {
        const [x, y] = this.points[i];
        this.webcamProcessor.renderCtx.lineTo(x, y);
      }

      if (this.points.length === 4) {
        this.webcamProcessor.renderCtx.lineTo(x0, y0);
      }

      this.webcamProcessor.renderCtx.stroke();
    } else if (this.points.length === 1) {
      const radius = 3;
      const [x, y] = this.points[0];
      this.webcamProcessor.renderCtx.fillStyle = 'red';
      this.webcamProcessor.renderCtx.fillRect(x - radius, y - radius, 2 * radius, 2 * radius);
    }
  }

  process() {
    // get the current pixels
    const old = this.getImageData();
    const next = this.createImageData();

    // decide what to do
    if (!this.previousFrame) {
      this.previousFrame = old;
    } else if (this.points.length < 4) {
      // please select 4 points
      const message = '1) Identify the four corners of the canvas.';
      this.webcamProcessor.renderCtx.fillText(message, 10, 40);
    } else {
      this.identifyHits(old, next);
    }

    // render the canvas outline
    this.renderCanvasOutline();
  }

  identifyHits(old, next) {
    console.log(next.data.length);

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
      console.log('hit target');
    }

    // draw the goal
    this.renderGoal();

    // save the current pixels for the next round
    this.previousFrame = old;
  }
}
