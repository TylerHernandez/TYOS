var TSOS;
(function (TSOS) {
    class PCB {
        pid;
        memorySegment;
        state;
        swapped;
        pc;
        ir;
        acc;
        x;
        y;
        z;
        constructor(pid, 
        // Acceptable memoryLocations include 0, 1, and 2. 
        memorySegment = -1, // Default at -1 to use as flag for memory has no location. 
        state = "READY", swapped = false, pc = 0, ir = 0x01, // Default at 0x01 to protect process from 'break' case '0x00'.
        acc = 0, x = 0, y = 0, z = 0) {
            this.pid = pid;
            this.memorySegment = memorySegment;
            this.state = state;
            this.swapped = swapped;
            this.pc = pc;
            this.ir = ir;
            this.acc = acc;
            this.x = x;
            this.y = y;
            this.z = z;
        }
        // Return whether or not PCB is merely template such as 'emptyPCB()'.
        isEmpty() {
            if (this.state == "READY" &&
                this.swapped == false &&
                this.pc == 0 &&
                this.ir == 0x01 &&
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