class WebcamProcessor {
  static registerVideoHandlers(width, height, streamCallback, errorCallback) {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        {
          video: { width, height },
          audio: false,
        },
        streamCallback,
        errorCallback
      );
    } else {
      errorCallback({
        message: "Unforunately your browser doesn't support getUserMedia. Try chrome.",
      });
    }
  }

  constructor(width, height, fps, video, renderCanvas, process) {
    this.video = video;
    this.renderCanvas = renderCanvas;
    this.renderCtx = this.renderCanvas.getContext('2d');
    this.isStreaming = false;
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.time = 0;
    this.frames = 0;
    this.process = process;
  }

  start() {
    const self = this;

    // initialize the canvas for drawing
    this.video.addEventListener(
      'canplay',
      function(e) {
        if (!self.isStreaming) {
          self.renderCanvas.setAttribute('width', self.width);
          self.renderCanvas.setAttribute('height', self.height);
          self.isStreaming = true;
        }
      },
      false
    );

    // set up the drawing loop
    this.video.addEventListener(
      'play',
      function() {
        // Every n milliseconds copy the video image to the canvas
        setInterval(function() {
          if (self.video.paused || self.video.ended) return;
          const start = +new Date();

          self.renderCtx.fillRect(0, 0, self.width, self.height);
          self.renderCtx.drawImage(self.video, 0, 0, self.width, self.height);

          self.process();

          const duration = +new Date() - start;
          const fontSize = 16;
          self.renderCtx.font = fontSize + 'px Arial';
          self.renderCtx.fillStyle = 'white';
          self.renderCtx.fillText(duration + 'ms', 10, fontSize);
          self.time += duration;
          self.frames += 1;
          if (self.frames % (5 * self.fps) === 0) {
            console.log('Average of ' + self.time / self.frames + 'ms per frame');
          }
        }, 1000 / self.fps);
      },
      false
    );

    // register all the handlers
    WebcamProcessor.registerVideoHandlers(
      this.width,
      this.height,
      s => {
        self.video.srcObject = s;
        self.video.onloadedmetadata = e => {
          self.video.play();
        };
      },
      err => alert('Oops: (' + err.message + ')')
    );
  }
}
