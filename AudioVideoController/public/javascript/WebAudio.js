"use strict";

var BufferLoader = require("./BufferLoader");


/**
 * Class that controls audio sources on which the user can apply filters to
 */
class WebAudio {

    constructor(barID) {
        this.context = null;
        this.gain = null;
        this.masterGain = null;
        this.crossGain = null;
        this.sourceBuffer1 = null;
        this.source = null;
        this.bufferLoader = null;
        this.highShelf = null;
        this.peaking = null;
        this.lowShelf = null;

        this.playing = false;
        this.startTime = 0;
        this.seekTime = 0;

        this.barID = barID;
        this.barWidth = 0;
        this.interval;


        this.highShelfRot = null;
        this.lowShelfRot = null;
        this.peakingShelfRot = null;
    }


    /**
     *  Every second the progress bar is updated when audio source is playing
     */
    move() {
        console.log(document.getElementById(this.barID).value);
        document.getElementById(this.barID).value = this.barWidth;
        let self = this;
        this.interval = setInterval(function() {
            if (document.getElementById(self.barID).value >= document.getElementById(self.barID).max) {
            clearInterval(this.interval);
        } else {
            document.getElementById(self.barID).value += 1;
            console.log(document.getElementById(self.barID).value);
        }

        }, 1000);
    }


    /**
     * Pause bar from auto incrementing
     */
    pauseBar() {
        this.barWidth = document.getElementById(this.barID).value;
        clearInterval(this.interval);
    }


// Pause related variables


    /**
     * Initialize audio in correspondence to the given audio track name
     * @param trackname
     */
    init(trackname) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        let self = this;
        console.log(self);
        this.bufferLoader = new BufferLoader(
            self.context,
            [
                trackname
            ],
            function(bufferList) {
                self.source = self.context.createBufferSource();
                self.source.buffer = bufferList[0];
                self.sourceBuffer1 = self.source.buffer;
            }
        );

        this.bufferLoader.load();
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 0.5;
        this.gain = this.context.createGain();
        this.gain.gain.value = 0.5;
        this.crossGain = this.context.createGain();
        this.gain.gain.value = 0.5;
        this.highShelf = this.context.createBiquadFilter();
        this.highShelf.type = 'highshelf';
        this.highShelf.frequency.value = 14000;
        this.highShelf.gain.value = 0.0;
        this.peaking = this.context.createBiquadFilter();
        this.peaking.type = 'peaking';
        this.peaking.frequency.value = 2000;
        this.peaking.Q.value= 0.8;
        this.peaking.gain.value = 0;
        this.lowShelf = this.context.createBiquadFilter();
        this.lowShelf.type = 'lowshelf';
        this.lowShelf.frequency.value = 600;
        this.lowShelf.gain.value = 0.0;
    };


    /**
     * When Music is Paused play audio source, otherwise pause it
     */
    playOrPauseMusic() {
        if (this.source) {
            let self = this;
            console.log(this.source.buffer.duration);

            document.getElementById(self.barID).max = parseInt(this.source.buffer.duration);

            console.log(document.getElementById(self.barID).max);
            if (this.playing) {
                this.source.stop();
                this.pauseBar();
                this.seekTime = this.seekTime + (this.context.currentTime - this.startTime);
            } else {
                this.move();

                this.startTime = this.context.currentTime;
                this.source = this.context.createBufferSource();

                this.source.buffer = this.sourceBuffer1;
                this.source.loop = true;
                this.source.connect(this.masterGain);
                this.masterGain.connect(this.gain);
                this.gain.connect(this.crossGain);
                this.crossGain.connect(this.highShelf);
                this.highShelf.connect(this.peaking);
                this.peaking.connect(this.lowShelf);
                this.lowShelf.connect(this.context.destination);
                this.source.start(0,this.seekTime);
            }
            this.playing = !this.playing;

        }
    };


    /**
     * Stop audio source from playing
     */
    stopMusic() {
        this.source.stop();
        this.seekTime = 0;
        this.playing = !this.playing;
        this.pauseBar();
        this.barWidth = 0;
        document.getElementById(this.barID).value = this.barWidth;
    };


    /**
     * Controls where playing of audio stream is continued
     * @param seekTime
     */
    seekTrack(seekTime) {
        this.seekTime = seekTime;
        document.getElementById(this.barID).max = parseInt(this.source.buffer.duration);
        document.getElementById(this.barID).value = this.seekTime;
        if(this.playing) {
            this.source.stop();
        }

        this.startTime = this.context.currentTime;
        this.source = this.context.createBufferSource();

        this.source.buffer = this.sourceBuffer1;
        this.source.loop = true;
        this.source.connect(this.masterGain);
        this.masterGain.connect(this.gain);
        this.gain.connect(this.crossGain);
        this.crossGain.connect(this.highShelf);
        this.highShelf.connect(this.peaking);
        this.peaking.connect(this.lowShelf);
        this.lowShelf.connect(this.context.destination);
        this.source.start(0,this.seekTime);

        this.playing = true;
    }


    /**
     * Updates the volume based on thesetting
     * of the volume slider of the UI
     * @param newValue
     */
    updateGain(newValue) {
        // Value has to be in range from 0 to 1
        newValue *= 0.0078125;
        this.gain.gain.value = newValue;
    };


    /**
     * Update the Master gain
     * @param newValue
     */
    updateMasterGain(newValue) {
        // Value has to be in range from 0 to 1
        newValue *= 0.0078125;
        this.masterGain.gain.value = newValue;
    };


    /**
     * Update how many high frequencies are played back
     * @param newValue
     */
    updateHighshelf(newValue)
    {
        newValue -= 64;
        //newValue *= 0.0078125;
        this.highShelf.gain.value = newValue;
        console.log(newValue);
    };

    /**
     * Update how many low frequencies are played
     * @param newValue
     */
    updateLowshelf(newValue)
    {
        newValue *= 0.25;
        newValue -= 16;
        //newValue *= 0.0078125;
        this.lowShelf.gain.value = newValue;
        console.log(newValue);
    };

    /**
     * Update how many mid frequencies are played back
     * @param varValue
     */
    updatePeaking (varValue)
    {
        varValue *= 0.25;
        varValue -= 16;
        //newValue *= 0.0078125;
        this.peaking.gain.value = varValue;
        console.log(varValue);
    };


    /**
     * Reset the frequency filters
     */
    resetFilter ()
    {
        this.highShelf.gain.value = 0.0;
        this.peaking.gain.value = 0.0;
        this.lowShelf.gain.value = 0.0;
    };

};


module.exports = WebAudio;

