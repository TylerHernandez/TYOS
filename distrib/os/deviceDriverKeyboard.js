/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverKeyboard extends TSOS.DeviceDriver {
        constructor() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            if (keyCode == 8) { // Backspace
                chr = String.fromCharCode(keyCode);
            }
            else if (keyCode == 9) { // Tab
                chr = String.fromCharCode(keyCode);
            }
            else if (keyCode == 13) { // Enter
                chr = String.fromCharCode(keyCode);
            }
            else if (keyCode == 32) { // Space
                chr = String.fromCharCode(keyCode);
            }
            else if (isShifted && (keyCode >= 65 && keyCode <= 90)) { //Letter
                chr = String.fromCharCode(keyCode); // Uppercase A-Z
            }
            else if (!isShifted && (keyCode >= 48) && (keyCode <= 57)) { // Digits
                chr = String.fromCharCode(keyCode);
            }
            else if (keyCode >= 65 && keyCode <= 90) { //Letter
                chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
            }
            else if (isShifted) {
                switch (keyCode) {
                    // Shifted special characters.
                    case 48: {
                        chr = ")";
                        break;
                    }
                    case 49: {
                        chr = "!";
                        break;
                    }
                    case 50: {
                        chr = "@";
                        break;
                    }
                    case 51: {
                        chr = "#";
                        break;
                    }
                    case 52: {
                        chr = "$";
                        break;
                    }
                    case 53: {
                        chr = "%";
                        break;
                    }
                    case 54: {
                        chr = "^";
                        break;
                    }
                    case 55: {
                        chr = "&";
                        break;
                    }
                    case 56: {
                        chr = "*";
                        break;
                    }
                    case 57: {
                        chr = "(";
                        break;
                    }
                    case 186: {
                        chr = ":";
                        break;
                    }
                    case 187: {
                        chr = "+";
                        break;
                    }
                    case 188: {
                        chr = "<";
                        break;
                    }
                    case 189: {
                        chr = "_";
                        break;
                    }
                    case 190: {
                        chr = ">";
                        break;
                    }
                    case 191: {
                        chr = "?";
                        break;
                    }
                    case 192: {
                        chr = "~";
                        break;
                    }
                    case 219: {
                        chr = "{";
                        break;
                    }
                    case 220: {
                        chr = "|";
                        break;
                    }
                    case 221: {
                        chr = "}";
                        break;
                    }
                    case 222: {
                        chr = "\"";
                        break;
                    }
                }
            } // ends isShifted 
            else { // Not shifted keystroke.
                switch (keyCode) {
                    // Nonshifted special characters.
                    case 186: {
                        chr = ";";
                        break;
                    }
                    case 187: {
                        chr = "=";
                        break;
                    }
                    case 188: {
                        chr = ",";
                        break;
                    }
                    case 189: {
                        chr = "-";
                        break;
                    }
                    case 190: {
                        chr = ".";
                        break;
                    }
                    case 191: {
                        chr = "/";
                        break;
                    }
                    case 192: {
                        chr = "`";
                        break;
                    }
                    case 219: {
                        chr = "[";
                        break;
                    }
                    case 220: {
                        chr = "\\";
                        break;
                    }
                    case 221: {
                        chr = "]";
                        break;
                    }
                    case 222: {
                        chr = "'";
                        break;
                    }
                }
            }
            if (chr.length > 0) {
                _KernelInputQueue.enqueue(chr);
            }
            // TODO: Check for caps-lock and handle as shifted if so.
        } // ends function
    }
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverKeyboard.js.map