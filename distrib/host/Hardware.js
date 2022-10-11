// Super class for all hardware
var TSOS;
(function (TSOS) {
    class Hardware {
        id;
        name;
        debug = true;
        constructor(id, name) {
            this.id = id;
            this.name = name;
        }
        log(message) {
            if (this.debug) {
                console.log("[HW - "
                    + this.name
                    + " id: " + this.id
                    + " - " + Date.now()
                    + "]: " + message);
            }
        }
        hexLog(num, desired_length) {
            if (num === undefined) {
                return "ERR: number undefined";
            }
            // Convert num to a string formatted in hex.
            num = num.toString(16).toUpperCase();
            // if num.length < desired_length, add starting zero's 
            while (num.length < desired_length) {
                num = "0" + num;
            }
            return num;
        }
    } // ends export Hardware
    TSOS.Hardware = Hardware;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=Hardware.js.map