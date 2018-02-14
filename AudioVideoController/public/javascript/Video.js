/**
 * A video that is connected to a div
 */
class Video {

    /**
     * Construct the object
     * @param videoPath
     * @param canvasId
     */
    constructor(videoPath, canvasId) {
        this.videoPath = videoPath;
        this.red = 1;
        this.green = 160;
        this.blue = 40;
        this.tolerance = 30;
        this.isChroma = true;
        this.context = null;
        this.video = null;
        this.canvasId = canvasId;
        this.canplaythrough = false;
    }

    /**
     * Call this when window is loaded
     */
    eventWindowLoaded() {
        var root = document.body;
        this.canvas = document.getElementById(this.canvasId);
        this.video = document.createElement("video");
        this.video.loop = true;
        var videoDiv = document.createElement('div');
        root.appendChild(videoDiv);
        videoDiv.appendChild(this.video);
        videoDiv.setAttribute("style", "display:none;");
        var videoCallback = this.videoLoaded(this.video, this.canvas);
        this.video.addEventListener("canplaythrough", videoCallback, false);
        this.video.setAttribute("src", this.videoPath);
        this.canvas.addEventListener('click', () => {
            if(this.video.paused) {
                this.video.play();
            } else {
                this.video.pause();
            }
        }, false);
    }


    /**
     * wait for the video to be fully loaded
     * @param video
     * @param canvas
     */
    videoLoaded(video, canvas) {
        this.canplaythrough = true;
        this.canvasApp(video, canvas);
    }

    /**
     *  start playing video
     */
    canvasApp() {
        this.context = this.canvas.getContext("2d");
        const playPromise = this.video.play();
        if (playPromise !== null){
            playPromise.catch(() => { this.video.play(); })
        }
        this.drawScreen();
        this.videoLoop();
    }

    /**
     * Loop through  frames
     */
    videoLoop() {
        window.setTimeout(this.videoLoop.bind(this), 0);
        this.drawScreen();
    }

    /**
     * Set green values for chroma keying
     * @param value
     */
    setGreen(value) {
        this.green = value;
    }

    /**
     * Set blue values for chroma keying
     * @param value
     */
    setBlue(value) {
        this.blue = value;
    }

    /**
     * Set red values for chroma keying
     * @param value
     */
    setRed(value) {
        this.red = value;
    }

    /**
     * Set tolerance for chroma keying
     * @param value
     */
    setTolerance(value) {
        this.tolerance = value;
    }

    /**
     * Enable/disable chroma keying
     */
    toggleChroma() {
        console.log('chroma');
        this.isChroma = !this.isChroma;
    }

    /**
     * Do the math and draw the images to the canvas
     */
    drawScreen () {
        this.context.drawImage(this.video, 0, 0, 320, 180);
        let frame = this.context.getImageData(0,0, 320, 180);

        if(this.isChroma) {
            let l = frame.data.length / 4;
            for (let i = 0; i < l; i++) {
                let r = frame.data[i * 4 + 0];
                let g = frame.data[i * 4 + 1];
                let b = frame.data[i * 4 + 2];
                if (r >= this.red - this.tolerance && r <= this.red + this.tolerance ) {
                    if (g >= this.green - this.tolerance && g <= this.green + this.tolerance ) {
                        if (b >= this.blue - this.tolerance && b <= this.blue + this.tolerance ) {
                            frame.data[i * 4 + 3] = 0;
                        }
                    }
                }
            }
        }
        this.context.putImageData(frame, 0, 0);
    }
}


module.exports = Video;











