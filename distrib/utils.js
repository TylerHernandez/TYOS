/* --------
   Utils.ts

   Utility functions.
   -------- */
var TSOS;
(function (TSOS) {
    class Utils {
        static trim(str) {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }
        static rot13(str) {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal = "";
            for (var i in str) { // We need to cast the string to any for use in the for...in construct.
                var ch = str[i];
                var code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13; // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                }
                else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13; // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                }
                else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }
        static hexLog(num, desired_length) {
            if (num === undefined) {
                var blankStr = "";
                // This looks nice. Displays as many dashes as desired_length.
                for (var i = 0; i < desired_length; i++) {
                    blankStr += "-";
                }
                return blankStr;
            }
            // Convert num to a string formatted in hex.
            num = num.toString(16).toUpperCase();
            // if num.length < desired_length, add starting zero's 
            while (num.length < desired_length) {
                num = "0" + num;
            }
            return num;
        }
        static saveState() {
            // if cpu is already executing, save state first.
            if (_CPU.isExecuting) {
                let currentPid = _CPU.currentPid;
                // Overwrite old pcb information in pcblist with our cpu's current state.
                let currentMemorySegment = _ResidentList[currentPid].memorySegment;
                let processState;
                if (_CPU.instructionRegister === 0x00) {
                    processState = "TERMINATED";
                }
                else {
                    processState = "READY";
                }
                _ResidentList[currentPid] = _CPU.saveCurrentState(currentPid, currentMemorySegment, processState);
                ; // PCB's index will always be it's assigned PID.
                // Display the change for our users.
                TSOS.Control.refreshPcbLog();
            }
        }
        // Saves cpu state of program, changes 'state' attribute to terminated.
        static onProgramFinish() {
            let currentPid = _CPU.currentPid;
            // Overwrite old pcb information in pcblist with our cpu's current state.
            let currentMemorySegment = _ResidentList[currentPid].memorySegment;
            _ResidentList[currentPid] = _CPU.saveCurrentState(currentPid, currentMemorySegment, "TERMINATED"); // PCB's index will always be it's assigned PID.
            // Display the change for our users.
            TSOS.Control.refreshPcbLog();
        }
        // Saves the state of running program and pauses execution.
        static pauseProgram() {
            if (_CPU.isExecuting) {
                this.saveState();
                _CPU.isExecuting = false;
            }
        }
    }
    TSOS.Utils = Utils;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=utils.js.map