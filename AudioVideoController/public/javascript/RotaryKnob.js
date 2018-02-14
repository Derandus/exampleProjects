/**
 * Created by moritzmg on 08.07.17.
 */
/**
 * Class for Rotary Control of Audio and Video
 */
class RotaryKnob {

    /**
     * Construct the Object
     * @param objectId
     * @param initValue
     * @param max
     */
    constructor(objectId, initValue, max) {
        this.objectId = objectId;
        this.element = null;
        this.value = initValue;
        this.setAngleFromValue(initValue);
        this.angle = 0;
        this.max = max;
    }

    /**
     * Initialize the Rotary Knob
     * @param object
     * @param method
     */
    init(object, method) {
        this.object = object;
        this.method = method;
        this.value = null; // Muss noch gemacht werden

        this.element = document.getElementById(this.objectId);
        var x = (e) => {
            this.mouseMove(e, this.element);
        }

        this.element.addEventListener("mousedown", (e) => {
            this.mouseDown(e);
            window.addEventListener("mousemove", x);
        });

        window.addEventListener("mouseup", (e) => {
            window.removeEventListener("mousemove", x);
        });
    }


    /**
     * Handle Mouse down on Rotary Knob
     * @param event
     */
    mouseDown(event) {
    }

    /**
     * Handle Move Mouse when Rotary Knob is pressed
     * @param event
     * @param obj
     */
    mouseMove(event, obj) {
        var angle = this.getRotationDegrees(obj) - event.movementY;
        if(angle < -135 || angle > 135) {
            angle = this.angle;
        }
        this.angle = angle;
        this.setValueFromAngle(this.angle)
        this.object[this.method](this.value);
        this.setStyle();
    }


    /**
     * Calculate degrees of object
     * @param obj
     * @returns {number}
     */
    getRotationDegrees(obj) {
        var st = window.getComputedStyle(obj, null);
        var matrix = st.getPropertyValue("-webkit-transform") ||
            st.getPropertyValue("-moz-transform")    ||
            st.getPropertyValue("-ms-transform")     ||
            st.getPropertyValue("-o-transform")      ||
            st.getPropertyValue("transform");
        if(matrix !== 'none') {
            var values = matrix.split('(')[1].split(')')[0].split(',');
            var a = values[0];
            var b = values[1];
            var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
        } else {
            var angle = 0;
        }
        // var ret = (angle < 0) ? angle + 360 : angle;
        return angle;
    }

    /**
     * Calculate value corresponding to angle
     * @param angle
     */
    setValueFromAngle(angle) {
        angle += 135;
        this.value = angle * (this.max/270);
    }

    /**
     * Calculate angle corresponding to value
     * @param value
     */
    setAngleFromValue(value) {
        value = value * (270/this.max);
        this.angle = value - 135;
    }

    /**
     * Display calculated angle => Rotate Rotary Knob
     */
    setStyle(){
        this.element.style.transform = 'rotate(' + this.angle + 'deg)';
    }


}

module.exports = RotaryKnob;
