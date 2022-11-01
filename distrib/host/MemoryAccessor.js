var TSOS;
(function (TSOS) {
    // Memory Accessor will bridge communication between Memory and CPU.
    class MemoryAccessor {
        cpu;
        memory;
        lowOrderByte;
        highOrderByte;
        highestNumber;
        base;
        limit;
        // Hard-coded program to be added to memory.
        program = [];
        //0xA9, 0x0A, 0x8D, 0x60, 0x00, 0xA9, 0x00, 0x8D, 0x61, 0x00, 0x8D, 0x64, 0x00, 0xA9, 0x01, 0x8D, 0x62, 0x00, 0xAD, 0x61, 0x00, 0x6D, 0x62, 0x00, 0x8D, 0x63, 0x00, 0xAD, 0x62, 0x00, 0x8D, 0x61, 0x00, 0xAD, 0x63, 0x00, 0x8D, 0x62, 0x00, 0xA2, 0x01, 0xAC, 0x63, 0x00, 0xFF, 0xA9, 0xFF, 0x8D, 0x65, 0x00, 0xAD, 0x60, 0x00, 0x6D, 0x65, 0x00, 0x8D, 0x60, 0x00, 0xAE, 0x60, 0x00, 0xEC, 0x64, 0x00, 0xA2, 0x00, 0xD0, 0xCD
        constructor(memory, cpu) {
            this.cpu = cpu;
            this.memory = memory;
            // Initialize base and limit for memory segment 0.
            this.base = 0x00;
            this.limit = 0xFF;
            console.log("Initialized Memory");
            this.highestNumber = this.program.length;
            this.memoryLog(0x0000, this.highestNumber);
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
            var byte = TSOS.Utils.hexLog(this.lowOrderByte, 2) + "" + TSOS.Utils.hexLog(this.highOrderByte, 2);
            this.setMAR(parseInt(byte));
        }
        // Loads a static program into memory
        writeImmediate(marValue, mdrValue) {
            let desiredMar = marValue + this.base;
            if (desiredMar > this.limit) {
                _StdOut.putText("Memory tried to write out of bounds");
                return;
            }
            this.memory.setMAR(desiredMar);
            this.memory.setMDR(mdrValue);
            this.write();
        }
        // Writes to memory.
        write() {
            // TODO: take into account base and limit.
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
        setMAR(marValue) {
            let desiredMar = marValue + this.base;
            if (desiredMar > this.limit) {
                _StdOut.putText("Memory tried to read/write out of bounds");
                return;
            }
            this.memory.setMAR(desiredMar);
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
            console.log("Memory Dump: Debug");
            console.log("--------------------------------------");
            for (let index = startAddress; index <= endAddress - 1; index++) {
                let currentMemory = this.memory.getMemoryAt(index);
                console.log("Addr " + TSOS.Utils.hexLog(index, 4) + ":   |  " + TSOS.Utils.hexLog(currentMemory, 2));
            }
            console.log("--------------------------------------");
            console.log("Memory Dump: Complete");
        }
        // Retrieves and displays contents of memory string from startAddress to endAddress in HTML.
        memoryLog(startAddress, endAddress) {
            // Set up the table headers.
            var msg = "<tr><th>Address</th></tr>";
            for (let index = startAddress; index < endAddress; index += 8) { // Incrementing by eight to display eight chunks at a time.
                // Get's the first chunk of memory.
                let firstMemory = this.memory.getMemoryAt(index);
                msg += ("<tr><td>0x" + TSOS.Utils.hexLog(index, 4) + "</td> <td>" + TSOS.Utils.hexLog(firstMemory, 2) + "</td>");
                // Then the second.
                let secondMemory = this.memory.getMemoryAt(index + 1);
                msg += ("<td>" + TSOS.Utils.hexLog(secondMemory, 2) + "</td>");
                // Third.
                let thirdMemory = this.memory.getMemoryAt(index + 2);
                msg += ("<td>" + TSOS.Utils.hexLog(thirdMemory, 2) + "</td>");
                // Then the fourth.
                let fourthMemory = this.memory.getMemoryAt(index + 1);
                msg += ("<td>" + TSOS.Utils.hexLog(fourthMemory, 2) + "</td>");
                // fifth.
                let fifthMemory = this.memory.getMemoryAt(index + 2);
                msg += ("<td>" + TSOS.Utils.hexLog(fifthMemory, 2) + "</td>");
                // Then the sixth.
                let sixthMemory = this.memory.getMemoryAt(index + 1);
                msg += ("<td>" + TSOS.Utils.hexLog(sixthMemory, 2) + "</td>");
                // seventh.
                let seventhMemory = this.memory.getMemoryAt(index + 2);
                msg += ("<td>" + TSOS.Utils.hexLog(seventhMemory, 2) + "</td>");
                // Lastly, the eighth.
                let eighthMemory = this.memory.getMemoryAt(index + 3);
                msg += ("<td>" + TSOS.Utils.hexLog(eighthMemory, 2) + "</td></tr>");
            }
            TSOS.Control.memoryLog(msg);
        }
        resetMemory() {
            this.memory.reset();
        }
        wipe(start, stop) {
            this.memory.wipe(start, stop);
            if (stop > this.highestNumber) {
                this.highestNumber = stop;
            }
            this.memoryLog(0x00, this.highestNumber);
        }
    } // ends export MemoryAccessor
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=MemoryAccessor.js.map