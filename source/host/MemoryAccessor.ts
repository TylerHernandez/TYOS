module TSOS {
    // Memory Accessor will bridge communication between Memory and CPU.
    export class MemoryAccessor {

        private cpu: CPU;
        private memory: Memory;

        public lowOrderByte;
        public highOrderByte;

        public highestNumber;

        public base;
        public limit;

        // Hard-coded program to be added to memory.
        public program = [];
        //0xA9, 0x0A, 0x8D, 0x60, 0x00, 0xA9, 0x00, 0x8D, 0x61, 0x00, 0x8D, 0x64, 0x00, 0xA9, 0x01, 0x8D, 0x62, 0x00, 0xAD, 0x61, 0x00, 0x6D, 0x62, 0x00, 0x8D, 0x63, 0x00, 0xAD, 0x62, 0x00, 0x8D, 0x61, 0x00, 0xAD, 0x63, 0x00, 0x8D, 0x62, 0x00, 0xA2, 0x01, 0xAC, 0x63, 0x00, 0xFF, 0xA9, 0xFF, 0x8D, 0x65, 0x00, 0xAD, 0x60, 0x00, 0x6D, 0x65, 0x00, 0x8D, 0x60, 0x00, 0xAE, 0x60, 0x00, 0xEC, 0x64, 0x00, 0xA2, 0x00, 0xD0, 0xCD, 0x00

        constructor(memory: Memory, cpu: CPU) {

            this.cpu = cpu;
            this.memory = memory;

            // Initialize base and limit for memory segment 0.
            this.base = 0x0000;
            this.limit = 0x00FF;

            console.log("Initialized Memory");

            this.highestNumber = this.program.length;

            this.memoryLog(0x0000, this.highestNumber);

        }

        // Puts a low order byte in register
        public setLowOrderByte(lob: number) {
            this.lowOrderByte = lob;
        }

        // Puts high order byte in register
        public setHighOrderByte(hob: number) {
            this.highOrderByte = hob;
        }

        // Puts low and high order bytes in MAR
        public putBytesInMar() {
            //Construct hexadecimal value 0xHOLO with "highOrderByte" + "lowOrderByte"
            var byte = this.hexLog(this.highOrderByte, 2) + "" + this.hexLog(this.lowOrderByte, 2);
            this.setMAR(parseInt(byte, 16));
        }

        // Loads a static program into memory
        public writeImmediate(marValue: number, mdrValue: number): void {

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
        public write(): void {

            this.memory.write();
            if (_Memory.getMAR() > this.highestNumber) {
                this.highestNumber = _Memory.getMAR();
                this.memoryLog(0x0000, this.highestNumber);
            }
        }

        // Retrieves content at MAR Location
        public fetchMemoryContent(): number {
            this.memory.read();
            return this.memory.getMDR();
        }

        // Sets MAR to memory address 'marValue'.
        public setMAR(marValue: number): void {

            // Add base to mar value.
            let desiredMarValue = marValue + this.base;

            // Check if within bounds of program.
            if (desiredMarValue < this.base) {
                console.log("Memory tried to point out of bounds- " + this.hexLog(marValue, 4) + "less than " + this.hexLog(this.base, 4) + " \n");
                _CPU.isExecuting = false;
                return;
            }

            if (desiredMarValue > this.limit) {
                console.log("Memory tried to point out of bounds- " + this.hexLog(marValue, 4) + "greater than " + this.hexLog(this.limit, 4) + " \n");
                _CPU.isExecuting = false;
                return;
            }

            this.memory.setMAR(desiredMarValue);
        }

        // Sets MDR to data 'x'.
        public setMDR(x: number): void {
            this.memory.setMDR(x);
        }

        // Retrieves MAR.
        public getMAR() {
            return this.memory.getMAR();
        }


        // Console logs the content of memory from startAddress to endAddress.
        public memoryDump(startAddress: number, endAddress: number): void {
            console.log("Memory Dump: Debug");
            console.log("--------------------------------------");
            for (let index = startAddress; index <= endAddress - 1; index++) {
                let currentMemory = this.memory.getMemoryAt(index);
                console.log("Addr " + Utils.hexLog(index, 4) + ":   |  " + Utils.hexLog(currentMemory, 2));
            }
            console.log("--------------------------------------");
            console.log("Memory Dump: Complete");
        }

        // Retrieves and displays contents of memory string from startAddress to endAddress in HTML.
        public memoryLog(startAddress: number, endAddress: number): void {
            // Set up the table headers.
            var msg: string = "<tr><th>Address</th></tr>";
            for (let index = startAddress; index < endAddress; index += 8) { // Incrementing by eight to display eight chunks at a time.

                // Get's the first chunk of memory.
                let firstMemory = this.memory.getMemoryAt(index);
                msg += ("<tr><td>0x" + Utils.hexLog(index, 4) + "</td> <td>" + Utils.hexLog(firstMemory, 2) + "</td>");

                // Then the second.
                let secondMemory = this.memory.getMemoryAt(index + 1)
                msg += ("<td>" + Utils.hexLog(secondMemory, 2) + "</td>");

                // Third.
                let thirdMemory = this.memory.getMemoryAt(index + 2);
                msg += ("<td>" + Utils.hexLog(thirdMemory, 2) + "</td>");

                // Then the fourth.
                let fourthMemory = this.memory.getMemoryAt(index + 3)
                msg += ("<td>" + Utils.hexLog(fourthMemory, 2) + "</td>");

                // fifth.
                let fifthMemory = this.memory.getMemoryAt(index + 4);
                msg += ("<td>" + Utils.hexLog(fifthMemory, 2) + "</td>");

                // Then the sixth.
                let sixthMemory = this.memory.getMemoryAt(index + 5)
                msg += ("<td>" + Utils.hexLog(sixthMemory, 2) + "</td>");

                // seventh.
                let seventhMemory = this.memory.getMemoryAt(index + 6);
                msg += ("<td>" + Utils.hexLog(seventhMemory, 2) + "</td>");

                // Lastly, the eighth.
                let eighthMemory = this.memory.getMemoryAt(index + 7)
                msg += ("<td>" + Utils.hexLog(eighthMemory, 2) + "</td></tr>");
            }

            TSOS.Control.memoryLog(msg);
        }

        public resetMemory(): void {
            this.memory.reset();
        }

        public wipe(start, stop): void {
            this.memory.wipe(start, stop);
            if (stop > this.highestNumber) {
                this.highestNumber = stop;
            }

            this.memoryLog(0x00, this.highestNumber);
        }

        public fetchProgram(memorySegment): String[] {
            let program: String[] = [];

            if (memorySegment == 0) {
                for (let x = 0x0000; x <= 0x00FF; x++) {
                    program.push(Utils.hexLog(this.memory.getMemoryAt(x), 2));
                }

            }
            else if (memorySegment == 1) {
                for (let x = 0x0100; x <= 0x01FF; x++) {
                    program.push(Utils.hexLog(this.memory.getMemoryAt(x), 2));
                }

            }
            else if (memorySegment == 2) {
                for (let x = 0x0200; x <= 0x02FF; x++) {
                    program.push(Utils.hexLog(this.memory.getMemoryAt(x), 2));
                }

            }
            else {
                console.log("Err: Program is not in memory. MemorySegment = " + memorySegment);
            }

            return program;
        }

        private hexLog(num, desired_length): String {
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

    } // ends export MemoryAccessor
}