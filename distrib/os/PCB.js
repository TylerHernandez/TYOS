var TSOS;
(function (TSOS) {
    class PCB {
        pid;
        state;
        swapped;
        pc;
        ir;
        acc;
        x;
        y;
        z;
        memoryLocation;
        constructor(pid, state = "Waiting", swapped = false, pc = 0, ir = 0, acc = 0, x = 0, y = 0, z = 0, 
        // Acceptable memoryLocations include 0, 1, and 2. 
        memoryLocation = -1) {
            this.pid = pid;
            this.state = state;
            this.swapped = swapped;
            this.pc = pc;
            this.ir = ir;
            this.acc = acc;
            this.x = x;
            this.y = y;
            this.z = z;
            this.memoryLocation = memoryLocation;
        }
        // Return whether or not PCB is merely template such as 'emptyPCB()'.
        isEmpty() {
            if (this.state == "Waiting" &&
                this.swapped == false &&
                this.pc == 0 &&
                this.ir == 0 &&
                this.acc == 0 &&
                this.x == 0 &&
                this.y == 0 &&
                this.z == 0) {
                return true;
            }
            return false;
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=PCB.js.map