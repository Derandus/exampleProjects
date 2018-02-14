var RotaryKnob = require('./RotaryKnob');
var WebAudio = require("./WebAudio");
var CrossFader = require("./CrossFader");
var Video = require("./Video.js");
var MixedVideo = require("./MixedVideo");
var MidiController = require('./MidiController');


/**
 * Initializes buttons and rotaries
 */
class WindowInitializer {

    constructor() {
        var audioControl1 = new WebAudio("leftSeekBar");
        var audioControl2 = new WebAudio("rightSeekBar");
        var cf = new CrossFader(audioControl1, audioControl2);

        var vid1 = new Video('./Assets/640x360_watermark.mp4', 'left_video_canvas');
        var vid2 = new Video('./Assets/346637244.mp4', 'right_video_canvas');

        var mixedVid = new MixedVideo(vid1, vid2, 'middle_video_canvas');

        document.addEventListener("DOMContentLoaded", (event) => {

            // Init Window
            document.getElementById('page-wrap').style.height = (screen.height * 0.75)  + 'px';
            document.getElementById('page-wrap').style.width = (screen.width * 0.9) + 'px';
            document.getElementById('page-wrap').style.margin = '0 auto';

            // Video
            vid1.eventWindowLoaded();
            vid2.eventWindowLoaded();
            mixedVid.eventWindowLoaded();



            // Audio Init
            audioControl1.init('./Assets/Track1.mp3');
            audioControl2.init('./Assets/Track2.mp3');

            document.getElementById('left_play').addEventListener('click', function () {
                audioControl1.playOrPauseMusic();
            });


            document.getElementById('left_stop').addEventListener('click', function () {
                audioControl1.stopMusic();
            });


            document.getElementById('left_volume_fader').addEventListener('change', function () {
                audioControl1.updateGain(document.getElementById('left_volume_fader').value);
            });



            document.getElementById('right_play').addEventListener('click', function () {
                audioControl2.playOrPauseMusic();
            });


            document.getElementById('right_stop').addEventListener('click', function () {
                audioControl2.stopMusic();
            });


            document.getElementById('right_volume_fader').addEventListener('change', function () {
                audioControl2.updateGain(document.getElementById('right_volume_fader').value);
            });

            document.getElementById('rightSeekBar').addEventListener('click', function (e) {
                let clickedValue = (e.offsetX / document.getElementById('rightSeekBar').clientWidth) * audioControl2.source.buffer.duration;

                console.log(e.pageX + ", " + this.offsetLeft + ", " + clickedValue);
                console.log(document.getElementById('rightSeekBar').clientWidth);
                console.log(audioControl2.source.buffer.duration);
                audioControl2.seekTrack(clickedValue);
            });

            document.getElementById('leftSeekBar').addEventListener('click', function (e) {
                let clickedValue = (e.offsetX / document.getElementById('leftSeekBar').clientWidth) * audioControl1.source.buffer.duration;

                console.log(e.pageX + ", " + this.offsetLeft + ", " + clickedValue);
                console.log(document.getElementById('leftSeekBar').clientWidth);
                console.log(audioControl1.source.buffer.duration);
                audioControl1.seekTrack(clickedValue);
            });



            // Cross Fader
            document.getElementById('cross_fader').addEventListener('change', function () {
                cf.updateGainCross(document.getElementById('cross_fader').value);
            });



            document.getElementById('left_toggle_chroma').addEventListener('click', function () {
                vid1.toggleChroma();
            });

            document.getElementById('right_toggle_chroma').addEventListener('click', function () {
                vid2.toggleChroma();
            });







            var controlList = {
                leftHighShelfRot: new RotaryKnob('eq_left_1', 0, 127),
                leftPeakingRot: new RotaryKnob('eq_left_2', 0, 127),
                leftLowShelfRot: new RotaryKnob('eq_left_3', 0, 127),
                rightHighShelfRot: new RotaryKnob('eq_right_1', 0, 127),
                rightPeakingRot: new RotaryKnob('eq_right_2', 0, 127),
                rightLowShelfRot: new RotaryKnob('eq_right_3', 0, 127),
                masterGainRot: new RotaryKnob('master_volume_knob', 0, 127),
                leftToleranceRot: new RotaryKnob('left_tolerance', 0, 255),
                leftRedRot: new RotaryKnob('left_red', 0, 255),
                leftGreenRot: new RotaryKnob('left_green', 0, 255),
                leftBlueRot: new RotaryKnob('left_blue', 0, 255),
                rightToleranceRot: new RotaryKnob('right_tolerance', 0, 255),
                rightRedRot: new RotaryKnob('right_red', 0, 255),
                rightGreenRot: new RotaryKnob('right_green', 0, 255),
                rightBlueRot: new RotaryKnob('right_blue', 0, 255)
            };
            
            controlList.leftToleranceRot.init(vid1, 'setTolerance');
            controlList.leftRedRot.init(vid1, 'setRed');
            controlList.leftGreenRot.init(vid1, 'setGreen');
            controlList.leftBlueRot.init(vid1, 'setBlue');

            controlList.rightToleranceRot.init(vid2, 'setTolerance');
            controlList.rightRedRot.init(vid2, 'setRed');
            controlList.rightGreenRot.init(vid2, 'setGreen');
            controlList.rightBlueRot.init(vid2, 'setBlue');


            controlList.leftHighShelfRot.init(audioControl1, 'updateHighshelf');
            controlList.leftPeakingRot.init(audioControl1, 'updatePeaking');
            controlList.leftLowShelfRot.init(audioControl1, 'updateLowshelf');

            controlList.masterGainRot.init(cf, 'updateMasterGain');



            controlList.rightHighShelfRot.init(audioControl2, 'updateHighshelf');
            controlList.rightPeakingRot.init(audioControl2, 'updatePeaking');
            controlList.rightLowShelfRot.init(audioControl2, 'updateLowshelf');



            var midi = new MidiController(audioControl1, audioControl2, cf, vid1, vid2, window.navigator, controlList);
            // Midi
            midi.initMidi();
        });
    }
}

module.exports = WindowInitializer;





