/**
 * Created by moritzmg on 05.07.17.
 */

/**
 * Canvas to mix the videos
 */
class MixedVideo {


    constructor(video1, video2, canvasId) {
        this.video1 = video1;
        this.video2 = video2;
        this.canvas = null;
        this.canvasId = canvasId;
        this.canplaythrough = false;
        this.context = null;
    }


    /**
     * Call this function when the window is loaded
     */
    eventWindowLoaded() {
        this.canvas = document.getElementById(this.canvasId);
        this.canvasApp();
    }

    /**
     * Loop through frames
     */
    videoLoop() {
        window.setTimeout(this.videoLoop.bind(this), 0);
        this.drawScreen();
    }


    /**
     * Initialize and start playback
     */
    canvasApp() {
        this.context = this.canvas.getContext("2d");
        this.videoLoop();
    }

    /**
     * Draw videos onto canvas
     */
    drawScreen () {
        if(this.video1.canplaythrough && this.video2.canplaythrough) {
            this.context.putImageData(this.video1.context.getImageData(0,0, 320, 180), 0, 0);
            this.context.putImageData(this.video2.context.getImageData(0,0, 320, 180), 0, 0);
            this.context.drawImage(this.video2.canvas, 0, 0);
            this.context.drawImage(this.video1.canvas, 0, 0);
            // let frame1 = this.video2.context.getImageData(0,0, 320, 180);
            // this.context.putImageData(frame1, 0, 0);
        }
    }
}

module.exports = MixedVideo;