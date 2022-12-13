/* ------------
     DiskSystemDeviceDriver.ts

     Controls everything disk related from creating and storing
     to moving and retrieving.

     ------------ */


const DEFAULTVAL = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

module TSOS {

    export class DiskSystemDeviceDriver {

        // Programs will be mapped to their starting TSB. 
        public programToDiskTsb: Map<number, string>;
        private nextAvailableTsb = "";

        constructor() {
            this.programToDiskTsb = new Map<number, string>([]);
            this.nextAvailableTsb = "0,0,0";
        }

        /*
        // Tracks= 0-99 index.
        // Sectors = 0-99 index.
        // Blocks = 0-255 bytes.
        // Creates a disk with above specified guidelines.
        */
        public createDisk() {
            if (typeof (Storage) !== "undefined") { // We may use session storage.
                sessionStorage.clear();

                for (let track = 0; track <= 3; track++) {
                    for (let sector = 0; sector <= 7; sector++) {
                        for (let block = 0; block <= 7; block++) {
                            const tsb = String(track) + "," + String(sector) + "," + String(block);
                            let data = DEFAULTVAL;
                            sessionStorage.setItem(tsb, data);
                        }
                    }
                }

            } else {
                console.log("Browser does not support session storage");
            }
        }

        // Displays all disk content.
        public refreshDiskDisplay() {
            let msg = "";

            for (let track = 0; track <= 3; track++) {
                for (let sector = 0; sector <= 3; sector++) {
                    for (let block = 0; block <= 7; block++) {
                        const tsb = String(track) + "," + String(sector) + "," + String(block);
                        const byte = sessionStorage.getItem(tsb);

                        msg += "<tr>";

                        msg += "<td>";
                        msg += tsb
                        msg += "</td>";

                        msg += "<td>";
                        msg += byte;
                        msg += "</td>";

                        msg += "</tr>";
                    }
                }
            }

            TSOS.Control.diskLog(msg);
        }


        // Request to store our program into disk by programId.
        public storeProgramIntoDisk(programId, program) {

            program = this.removeInsignificantBytes(program);

            let tsb = this.nextAvailableTsb;

            this.programToDiskTsb.set(programId, tsb);

            // Store Program into disk.
            sessionStorage.setItem(tsb, ""); // Empty out tsb for our input.
            for (let byte of program) {

                if (byte == "--") {
                    byte = "00";
                }
                const currentString = sessionStorage.getItem(tsb);

                if (currentString.length >= DEFAULTVAL.length) {
                    // Increment tsb.
                    let oldTsb = tsb;

                    tsb = this.findNextTsb(tsb);

                    // Point the oldTsb.next to the new tsb.
                    sessionStorage.setItem(oldTsb + ".next", tsb)

                    // Clear out next tsb for the rest of our input.
                    sessionStorage.setItem(tsb, byte.toString());
                } else {
                    sessionStorage.setItem(tsb, currentString + byte);
                }


            }

            // Take our last used tsb to deduce our next available one.
            this.nextAvailableTsb = this.findNextTsb(tsb);

            // Show the rest of this line is storage *being wasted*
            let lineOfBytes = sessionStorage.getItem(tsb);
            while (lineOfBytes.length < DEFAULTVAL.length) {
                lineOfBytes += "00";
            }
            sessionStorage.setItem(tsb, lineOfBytes);


            // Update pcb in _ResidentList to show program is in disk now.
            _ResidentList[programId].memorySegment = -1;

            // Show user our changes.
            this.refreshDiskDisplay();
            TSOS.Control.refreshPcbLog();
            _MemoryAccessor.memoryLog(0x0000, _MemoryAccessor.highestNumber);

            return;
        }

        // swaps a program *in* memory, with a program on disk.
        public swapPrograms(programInMemoryId, programOnDiskId) {

            if (_ResidentList[programInMemoryId].memorySegment == -1) {
                console.log("Program not in memory programId: " + programInMemoryId);
                return;
            }

            // retrieve our program from our disk. Also clears program from disk for us.
            let programFromDisk = this.retrieveProgramFromDisk(programOnDiskId);

            // retrieve our program from our memory.
            let programFromMemory = this.retrieveProgramFromMemory(programInMemoryId);

            // clear memorySegment so we can insert our program.
            _MemoryManager.clearSegment(_ResidentList[programInMemoryId].memorySegment);

            // put our program memory onto disk.
            this.storeProgramIntoDisk(programInMemoryId, programFromMemory);
            // put our program from disk onto memory.
            this.storeProgramIntoMemory(programOnDiskId, programFromDisk);

        }


        public storeProgramIntoMemory(programId, program) {
            let newMemorySegment = _MemoryManager.determineNextSegment()
            _Kernel.insertStringProgram(newMemorySegment, program);
            _ResidentList[programId].memorySegment = newMemorySegment;
            _MemoryAccessor.memoryLog(0x0000, _MemoryAccessor.highestNumber);
            TSOS.Control.refreshPcbLog();
        }

        public retrieveProgramFromMemory(programId) {
            const memorySegment = _ResidentList[programId].memorySegment;
            const program = _MemoryAccessor.fetchProgram(memorySegment);
            _MemoryManager.clearSegment(memorySegment);
            return program;
        }

        // Get our program from the disk by programId. Make sure check if program.memorySegment == -1 before calling.
        public retrieveProgramFromDisk(programId) {

            let tsb = this.findProgramOnDisk(programId);

            let programStr = "";

            let next = sessionStorage.getItem(tsb + ".next");

            do {
                // Get the next line.
                programStr += sessionStorage.getItem(tsb);
                // Now remove it from our disk.
                sessionStorage.removeItem(tsb);
                sessionStorage.setItem(tsb, DEFAULTVAL);

                next = sessionStorage.getItem(tsb + ".next");

                // And remove the "next" value.
                sessionStorage.removeItem(tsb + ".next");
                if (next) {
                    tsb = next;
                }
            } while (next)

            this.refreshDiskDisplay();


            return this.stringProgramToArray(programStr);
        }


        /*
        //
        //   Helper Functions:
        //
        */
        public findNextTsb(tsb) {
            //If the block has not reached 7, we can always just add 1 to it.
            if (Number(tsb[4]) != 7) {
                let num = Number(tsb[4]) + 1;
                tsb = tsb.substring(0, 4);
                tsb += num.toString();

            } else if (Number(tsb[2]) != 3) { // If sector has not reached 3, we can add 1.
                // Try incrementing sector. Reset block to 0.
                let num = Number(tsb[2]) + 1;
                tsb = tsb.substring(0, 2);
                tsb += num.toString() + ",0";

            } else if (Number(tsb[0]) != 3) { // If track has not reached 3, we can add 1.
                // Try incrementing track. Reset sector and block to 0.
                let num = Number(tsb[0]) + 1;
                tsb = tsb.substring(0, 1);
                tsb += num.toString() + ",0,0";
            } else {
                console.log("There is no more space left! Tsb: " + tsb);
                return;
            }
            return tsb;
        }

        public findProgramOnDisk(programId) {
            return this.programToDiskTsb.get(programId);
        }

        public stringProgramToArray(givenProgram) {
            let program = [];
            for (var i = 0; i < givenProgram.length; i++) {


                // Split program numbers into pairs and put them inside program[].
                if (i % 2 == 0) { // even number.


                    /* E.g. We want to put the 0th and 1st element of givenProgram 
                     * into program's 0th index. And so on.
                     *
                     * 0 1     2 3     4 5       6 7
                     *  0       1       2         3
                     */

                    program[i / 2] = givenProgram[i];

                } else { // odd number.

                    // See 2 comments above for explanation.
                    program[(i - 1) / 2] += givenProgram[i];
                }

            }
            return program;
        }

        // TODO: remove a given program's trailing 0's.
        public removeInsignificantBytes(program) {
            // loop backwards in program, first index that's not 00 or -- we can say is end.
            return program;
        }


    }
}
