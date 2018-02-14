/**
 * Controls the volume Ratio of two tracks
 */
class CrossFader {
    constructor(track1, track2) {
        this.track1 = track1;
        this.track2 = track2;
    }

    updateGainCross(newValue) {
        // Value has to be in range from 0 to 1
        newValue *= 0.0078125;
        var newValue2 = 1;
        var nonlinear = Math.cos(newValue * 0.5*Math.PI);
        newValue2 -= nonlinear;
        this.track1.crossGain.gain.value = nonlinear;
        this.track2.crossGain.gain.value = newValue2;
    };

    updateMasterGain(newValue) {
        this.track1.updateMasterGain(newValue);
        this.track2.updateMasterGain(newValue);
    }
}

module.exports = CrossFader;
