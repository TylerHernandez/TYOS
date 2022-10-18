var TSOS;
(function (TSOS) {
    class Memory {
        // Creates MemoryArray with up to FFFF(65535) +1 addressable spaces.
        MemoryArray = [0x0000];
        // // Memory Address Register.
        MAR = 0x0000;
        // // Memory Data Register.
        MDR = 0x00;
        constructor() {
        }
        // init() {
        //     this.MAR = 0x0000;
        //     this.MDR = 0x00;
        // }
        // Sets all (65536)MemoryArray elements to undefined.
        reset() {
            for (let index = 0x00; index <= 0xFFFF; index++) {
                this.MemoryArray[index] = undefined;
            }
        }
        // Returns MAR.
        getMAR() {
            return this.MAR;
        }
        // Sets MAR to a given input.
        setMAR(input) {
            this.MAR = input;
        }
        // Returns MDR.
        getMDR() {
            return this.MDR;
        }
        // Sets MDR to a given input.
        setMDR(input) {
            this.MDR = input;
        }
        // Grabs MAR memory location and gives data output to MDR.
        read() {
            var data = this.MemoryArray[this.MAR];
            this.setMDR(data);
        }
        // Writes contents of MDR to Memory Location : MAR.
        write() {
            this.MemoryArray[this.MAR] = this.MDR;
        }
        // Returns Memory value at a given index.
        getMemoryAt(index) {
            return this.MemoryArray[index];
        }
    } // ends export
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=Memory.js.map