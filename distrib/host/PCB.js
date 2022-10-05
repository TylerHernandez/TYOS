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
        constructor(pid, state, swapped, pc, ir, acc, x, y, z) {
            this.pid = pid;
            this.state = state;
            this.swapped = swapped;
            this.pc = pc;
            this.ir = ir;
            this.acc = acc;
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=PCB.js.map