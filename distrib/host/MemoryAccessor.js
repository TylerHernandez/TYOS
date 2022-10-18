var TSOS;
(function (TSOS) {
    // Memory Accessor will bridge communication between Memory and CPU.
    class MemoryAccessor extends TSOS.Hardware {
        cpu;
        memory;
        lowOrderByte;
        highOrderByte;
        highestNumber;
        // Hard-coded program to be added to memory.
        program = [];
        //0xA9, 0x0A, 0x8D, 0x60, 0x00, 0xA9, 0x00, 0x8D, 0x61, 0x00, 0x8D, 0x64, 0x00, 0xA9, 0x01, 0x8D, 0x62, 0x00, 0xAD, 0x61, 0x00, 0x6D, 0x62, 0x00, 0x8D, 0x63, 0x00, 0xAD, 0x62, 0x00, 0x8D, 0x61, 0x00, 0xAD, 0x63, 0x00, 0x8D, 0x62, 0x00, 0xA2, 0x01, 0xAC, 0x63, 0x00, 0xFF, 0xA9, 0xFF, 0x8D, 0x65, 0x00, 0xAD, 0x60, 0x00, 0x6D, 0x65, 0x00, 0x8D, 0x60, 0x00, 0xAE, 0x60, 0x00, 0xEC, 0x64, 0x00, 0xA2, 0x00, 0xD0, 0xCD
        constructor(memory, cpu) {
            super(0, "MemoryAccessor");
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
            // Set up the table headers.
            var msg = "<tr><td>Address</td><td>Content </td><td>Address</td><td>Content </td><td>Address</td><td>Content </td><td>Address</td><td>Content</td></tr>";
            for (let index = startAddress; index <= endAddress; index += 4) { // Incrementing by four to display four chunks at a time.
                // Get's the first chunk of memory.
                let firstMemory = this.memory.getMemoryAt(index);
                msg += ("<tr><td>" + this.hexLog(index, 4) + "</td> <td>" + this.hexLog(firstMemory, 2) + "</td>");
                // Then the second.
                let secondMemory = this.memory.getMemoryAt(index + 1);
                msg += ("<td>" + this.hexLog(index + 1, 4) + "</td> <td>" + this.hexLog(secondMemory, 2) + "</td>");
                // Third.
                let thirdMemory = this.memory.getMemoryAt(index + 2);
                msg += ("<td>" + this.hexLog(index + 2, 4) + "</td> <td>" + this.hexLog(thirdMemory, 2) + "</td>");
                // Lastly, the fourth.
                let fourthMemory = this.memory.getMemoryAt(index + 3);
                msg += ("<td>" + this.hexLog(index + 3, 4) + "</td> <td>" + this.hexLog(fourthMemory, 2) + "</td></tr>");
            }
            TSOS.Control.memoryLog(msg);
        }
        resetMemory() {
            this.memory.reset();
        }
    } // ends export MemoryAccessor
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=MemoryAccessor.js.map