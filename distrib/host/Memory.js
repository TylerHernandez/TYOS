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
        // Displays contents of memory from address 0x00 to 0x14.
        displayZeroFourteen() {
            // loop through 0x00 -> 0x14, log each memory address + value.
            for (var x = 0x00; x < 0x15; x++) {
                this.displayMemory(x);
            }
        }
        displayMemory(location) {
            //this.log( "Address : " + this.hexLog(location, 4) + " Contains Value : " + this.hexLog(this.getMemoryAt(location), 2));
        }
        hexLog(num, desired_length) {
            if (num === undefined) {
                return "ERR [hexValue conversion]: number undefined";
            }
            // Convert num to a string formatted in hex.
            num = num.toString(16).toUpperCase();
            // if num.length < desired_length, add starting zero's 
            while (num.length < desired_length) {
                num = "0" + num;
            }
            return num;
        }
    } // ends export
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=Memory.js.map