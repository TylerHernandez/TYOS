var TSOS;
(function (TSOS) {
    // Memory Management Unit(MMU) will bridge communication between Memory and CPU.
    class MMU extends TSOS.Hardware {
        cpu;
        memory;
        lowOrderByte;
        highOrderByte;
        highestNumber;
        // Hard-coded program to be added to memory.
        program = [];
        //0xA9, 0x0A, 0x8D, 0x60, 0x00, 0xA9, 0x00, 0x8D, 0x61, 0x00, 0x8D, 0x64, 0x00, 0xA9, 0x01, 0x8D, 0x62, 0x00, 0xAD, 0x61, 0x00, 0x6D, 0x62, 0x00, 0x8D, 0x63, 0x00, 0xAD, 0x62, 0x00, 0x8D, 0x61, 0x00, 0xAD, 0x63, 0x00, 0x8D, 0x62, 0x00, 0xA2, 0x01, 0xAC, 0x63, 0x00, 0xFF, 0xA9, 0xFF, 0x8D, 0x65, 0x00, 0xAD, 0x60, 0x00, 0x6D, 0x65, 0x00, 0x8D, 0x60, 0x00, 0xAE, 0x60, 0x00, 0xEC, 0x64, 0x00, 0xA2, 0x00, 0xD0, 0xCD
        constructor(memory, cpu) {
            super(0, "MMU");
            this.log("created");
            this.cpu = cpu;
            this.memory = memory;
            this.log("Initialized Memory");
            //loops through program and copies data to MAR and MDR
            for (var index = 0x00; index < this.program.length; index++) {
                this.writeImmediate(index, this.program[index]);
            }
            this.highestNumber = this.program.length;
            this.memoryLog(0x0000, this.highestNumber);
        }
        // Inserts given string program into memory.
        insertStringProgram(program) {
            //loops through program and copies data to MAR and MDR
            for (var index = 0x00; index < program.length; index++) {
                this.writeImmediate(index, parseInt("0x" + program[index]));
            }
            this.memoryLog(0x0000, this.highestNumber);
            return true;
        }
        // Flips bytes for desired endianness. 
        flipBytes(bytes) {
            var str = String(bytes);
            // variables are named according to conversion of little to big endian.
            let lowOrder = str.substring(0, 2);
            let highOrder = str.substring(2, 4);
            str = highOrder + lowOrder;
            return parseInt(str);
        }
        // Puts a low order byte in register
        setLowOrderByte(lob) {
            this.lowOrderByte = lob;
        }
        // Puts high order byte in register
        setHighOrderByte(hob) {
            this.highOrderByte = hob;
        }
        // Puts low and high order bytes in MAR
        putBytesInMar() {
            //Construct hexadecimal value 0xLOHO with "lowOrderByte + highOrderByte"
            var byte = this.hexLog(this.lowOrderByte, 2) + "" + this.hexLog(this.highOrderByte, 2);
            this.setMAR(parseInt(byte));
        }
        // Loads a static program into memory
        writeImmediate(marValue, mdrValue) {
            this.memory.setMAR(marValue);
            this.memory.setMDR(mdrValue);
            this.write();
        }
        // Writes to memory.
        write() {
            this.memory.write();
            if (_Memory.getMAR() > this.highestNumber) {
                this.highestNumber = _Memory.getMAR();
                this.memoryLog(0x0000, this.highestNumber);
            }
        }
        // Retrieves content at MAR Location
        fetchMemoryContent() {
            this.memory.read();
            return this.memory.getMDR();
        }
        // Sets MAR to memory address 'x'.
        setMAR(x) {
            this.memory.setMAR(x);
        }
        // Sets MDR to data 'x'.
        setMDR(x) {
            this.memory.setMDR(x);
        }
        // Retrieves MAR.
        getMAR() {
            return this.memory.getMAR();
        }
        // Console logs the content of memory from startAddress to endAddress.
        memoryDump(startAddress, endAddress) {
            this.log("Memory Dump: Debug");
            this.log("--------------------------------------");
            for (let index = startAddress; index <= endAddress - 1; index++) {
                let currentMemory = this.memory.getMemoryAt(index);
                this.log("Addr " + this.hexLog(index, 4) + ":   |  " + this.hexLog(currentMemory, 2));
            }
            this.log("--------------------------------------");
            this.log("Memory Dump: Complete");
        }
        // Retrieves and displays contents of memory string from startAddress to endAddress in HTML.
        memoryLog(startAddress, endAddress) {
            var msg = "";
            msg += ("--------------------------------------" + "\n");
            for (let index = startAddress; index <= 200; index++) { // Hard coding this for now to prevent lag.
                let currentMemory = this.memory.getMemoryAt(index);
                msg += ("Addr " + this.hexLog(index, 4) + ":   |  " + this.hexLog(currentMemory, 2) + "\n");
            }
            msg += ("--------------------------------------");
            TSOS.Control.memoryLog(msg);
        }
        resetMemory() {
            this.memory.reset();
        }
    } // ends export MMU
    TSOS.MMU = MMU;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=MMU.js.map