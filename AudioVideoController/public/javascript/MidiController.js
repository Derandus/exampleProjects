/**
 * Connects A Behringer Mixer to the App
 */
class MidiController {

    /**
     * Constructor.
     * controlList must be filled with all the rotaries and faders
     *
     * @param track1
     * @param track2
     * @param crossfader
     * @param video1
     * @param video2
     * @param navigator
     * @param controlList
     */
    constructor(track1, track2, crossfader, video1, video2, navigator, controlList = null) {
        this.track1 = track1;
        this.track2 = track2;
        this.video1 = video1;
        this.video2 = video2;
        this.crossfader = crossfader;
        this.navigator = navigator;

        this.midiAccess = null;
        this.buttons = {};
        this.channel = 0;
        this.gain_1 = 0.0;
        this.gain_2 = 0.0;
        this.gainCross_1 = 0.0;
        this.gainCross_2 = 0.0;
        this.gainDisplay_1 = 0.0
        this.gainDisplay_2 = 0.0
        this.highShelf_1 = null;
        this.highShelf_2 = null;
        this.peaking_1 = null;
        this.peaking_2 = null;
        this.lowShelf_1 = null;
        this.lowShelf_2 = null;
        this.controlList = controlList;
        this.gainMaster = 0.5;
    }

    /**
     * Check if Browser support is granted
     */
    initMidi() {
        if (this.navigator.requestMIDIAccess) {
            this.navigator.requestMIDIAccess({
                sysex: false // this defaults to 'false' and we won't be covering sysex in this article.
            }).then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));
        } else {
            alert("No MIDI support in your browser.");
        }
    }


    /**
     * When we get a succesful response, run this code
     * @param mAccess
     */
    onMIDISuccess(mAccess) {
        this.midiAccess = mAccess;
        var inputs = this.midiAccess.inputs;
        for (var input of inputs.values()) {
            input.onmidimessage = this.onMidiMessage.bind(this);
        }
    
    }

    /**
     * When we get a failed response, run this code
     */
    onMIDIFailure(e) {
        console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
    }


    /**
     * Assign Midi Command to a certain functionality
     * @param data
     */
    onMidiMessage(data) {
        // console.log(this);
        console.log(data.data);
        var cmd = data.data[0] >> 4;
        console.log("MIDI CMD: "+ cmd);
        this.channel = data.data[0] & 0xf;

        var btnID = data.data[1];
        if ( cmd === 8) {
            if(data.data[1] === 20)
            {
                this.track1.stopMusic();
            }

            if(data.data[1] === 19)
            {
                this.track1.playOrPauseMusic();
            }

            if(data.data[1] === 32)
            {
                this.track2.stopMusic();
            }

            if(data.data[1] === 31)
            {
                console.log(this.track2);
                this.track2.playOrPauseMusic();
            }

            if (data.data[1] === 18)
            {
                this.track1.resetFilter();
                this.track2.resetFilter();
            }

            // Set Left Video effect on/off
            if (data.data[1] === 49)
            {
                this.video1.toggleChroma();
            }

            // Set Right Video effect on/off
            if (data.data[1] === 50)
            {
                this.video2.toggleChroma();

            }
        }

        if(cmd === 11)
        {

            if(data.data[1] === 4)
            {
                this.gainMaster = data.data[2];
                this.crossfader.updateMasterGain(this.gainMaster);
                this.controlList.masterGainRot.setAngleFromValue(this.gainMaster);
                this.controlList.masterGainRot.setStyle();
            }

            if(data.data[1] === 6)
            {
                this.highShelf_1 = data.data[2];
                this.track1.updateHighshelf(this.highShelf_1);
                this.controlList.leftHighShelfRot.setAngleFromValue(this.highShelf_1);
                this.controlList.leftHighShelfRot.setStyle();
            }

            if(data.data[1] ===10)
            {
                this.peaking_1 = data.data[2];
                this.track1.updatePeaking(this.peaking_1);
                this.controlList.leftPeakingRot.setAngleFromValue(this.peaking_1);
                this.controlList.leftPeakingRot.setStyle();
            }

            if(data.data[1] === 14)
            {
                this.lowShelf_1 = data.data[2];
                this.track1.updateLowshelf(this.lowShelf_1);
                this.controlList.leftLowShelfRot.setAngleFromValue(this.lowShelf_1);
                this.controlList.leftLowShelfRot.setStyle();
            }

            if(data.data[1] === 9)
            {
                this.highShelf_2 = data.data[2];
                this.track2.updateHighshelf(this.highShelf_2);
                this.controlList.rightHighShelfRot.setAngleFromValue(this.highShelf_2);
                this.controlList.rightHighShelfRot.setStyle();
            }

            if(data.data[1] ===13)
            {
                this.peaking_2 = data.data[2];
                this.track2.updatePeaking(this.peaking_2);
                this.controlList.rightPeakingRot.setAngleFromValue(this.peaking_2);
                this.controlList.rightPeakingRot.setStyle();
            }

            if(data.data[1] === 17)
            {
                this.lowShelf_2 = data.data[2];
                //bewusst "peaking"-funktion gewählt, "updateFilter" zu extrem bei lowShelf
                this.track2.updateLowshelf(this.lowShelf_2);
                this.controlList.rightLowShelfRot.setAngleFromValue(this.lowShelf_2);
                this.controlList.rightLowShelfRot.setStyle();
            }

            if (data.data[1] === 48)
            {
                this.gain_1 = data.data[2];
                this.track1.updateGain(this.gain_1);
                document.getElementById("left_volume_fader").value = this.gain_1;
                this.gainDisplay_1 = this.gain_1;
                this.gainDisplay_1 *= 0.15625;
                this.gainDisplay_1 += 48;
                this.updateLeftBar(this.gainDisplay_1);
                console.log(this.gain_1);
                console.log(this.gainDisplay_1);
            }


            if (data.data[1] === 51)
            {
                this.gain_2 = data.data[2];
                this.track2.updateGain(this.gain_2);
                document.getElementById("right_volume_fader").value = this.gain_2;
                this.gainDisplay_2 = this.gain_2;
                this.gainDisplay_2 *= 0.15625;
                this.gainDisplay_2 += 48;
                this.updateRightBar(this.gainDisplay_2);
                console.log(this.gain_2);
                console.log(this.gainDisplay_2);
            }

            if(data.data[1] === 64)
            {

                //gainCross_2 = data.data[2];
                this.gainCross_1 = data.data[2];
                document.getElementById("cross_fader").value = this.gainCross_1;
                console.log(this.gainCross_1);
                //console.log(gainCross_2);
                this.crossfader.updateGainCross(this.gainCross_1);
                //updateGainCross(gainCross2, gainCross_2);
            }


            // Set Left Video effect values
            if(data.data[1] === 11){
                console.log(data.data[2]);
                this.video1.setRed(data.data[2] * 2);
                this.controlList.leftRedRot.setAngleFromValue(data.data[2] * 2);
                this.controlList.leftRedRot.setStyle();
            }
            if(data.data[1] === 15){
                console.log(data.data[2]);
                this.video1.setGreen(data.data[2] * 2);
                this.controlList.leftGreenRot.setAngleFromValue(data.data[2] * 2);
                this.controlList.leftGreenRot.setStyle();
            }
            if(data.data[1] === 19){
                console.log(data.data[2]);
                this.video1.setBlue(data.data[2] * 2);
                this.controlList.leftBlueRot.setAngleFromValue(data.data[2] * 2);
                this.controlList.leftBlueRot.setStyle();
            }
            if(data.data[1] === 7){
                console.log(data.data[2]);
                this.video1.setTolerance(data.data[2] * 2);
                this.controlList.leftToleranceRot.setAngleFromValue(data.data[2] * 2);
                this.controlList.leftToleranceRot.setStyle();
            }
            ///////////////////////////////////////////////


            // Set Right video effect Values
            if(data.data[1] === 12){
                console.log(data.data[2]);
                this.video2.setRed(data.data[2] * 2);
                this.controlList.rightRedRot.setAngleFromValue(data.data[2] * 2);
                this.controlList.rightRedRot.setStyle();
            }
            if(data.data[1] === 16){
                console.log(data.data[2]);
                this.video2.setGreen(data.data[2] * 2);
                this.controlList.rightGreenRot.setAngleFromValue(data.data[2] * 2);
                this.controlList.rightGreenRot.setStyle();
            }
            if(data.data[1] === 20){
                console.log(data.data[2]);
                this.video2.setBlue(data.data[2] * 2);
                this.controlList.rightBlueRot.setAngleFromValue(data.data[2] * 2);
                this.controlList.rightBlueRot.setStyle();
            }
            if(data.data[1] === 8){
                console.log(data.data[2]);
                this.video2.setTolerance(data.data[2] * 2);
                this.controlList.rightToleranceRot.setAngleFromValue(data.data[2] * 2);
                this.controlList.rightToleranceRot.setStyle();
            }
            ///////////////////////////////////////////////

        }

    }

    /**
     * Send outputs to Midi Cotroller
     * @param data
     */
    sendDataToMIDI(data) {
        var outputs = this.midiAccess.outputs;

        for (var output of outputs.values()) {
            output.send(data);
        }
    }

    /**
     * Update the Left Bar of Midi Controller
     * @param val
     */
    updateLeftBar(val) {
        this.sendDataToMIDI([this.getMIDICmdForChannel(11),80,val]);
    }

    /**
     * Update the Right Bar of Midi Controller
     * @param val
     */
    updateRightBar(val) {
        this.sendDataToMIDI([this.getMIDICmdForChannel(11),81,val]);
    }

    /**
     * Bitshift the command so we ignore the channel
     * @param cmd
     * @returns {*}
     */
    getMIDICmdForChannel (cmd) {
        return (cmd << 4) + this.channel;
    }

}

module.exports = MidiController;












