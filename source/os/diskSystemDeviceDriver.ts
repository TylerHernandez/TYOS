/* ------------
     DiskSystemDeviceDriver.ts

     Controls everything disk related from creating and storing
     to moving and retrieving.

     ------------ */


const DEFAULTVAL = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

module TSOS {

    export class DiskSystemDeviceDriver {


        public programToDiskTsb: Map<number, string>;

        constructor() {
            this.programToDiskTsb = new Map<number, string>([]);
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
        public getAllDiskContent() {
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
        public storeProgramIntoDisk(programId) {
            const pcb: PCB = _ResidentList[programId];
            const memorySegment = pcb.memorySegment;

            // Retrieve program from memory accessor.
            let program: String[] = _MemoryAccessor.fetchProgram(memorySegment);

            // TODO: decide where in disk to place program. Hardcoding at 1,0,0 for now.
            let tsb = "1,0,0";

            this.programToDiskTsb.set(programId, tsb);

            // TODO: get rid of excess 0's.

            // Store Program into disk.
            sessionStorage.setItem(tsb, ""); // Empty out tsb for our input.
            for (let byte of program) {

                if (byte == "--") {
                    byte = "00";
                }
                const currentString = sessionStorage.getItem(tsb);

                if (currentString.length >= 120) {
                    // Increment tsb.
                    let oldTsb = tsb;

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

                    // Point the oldTsb.next to the new tsb.
                    sessionStorage.setItem(oldTsb + ".next", tsb)

                    // Clear out next tsb for the rest of our input.
                    sessionStorage.setItem(tsb, byte.toString());
                } else {
                    sessionStorage.setItem(tsb, currentString + byte);
                }


            }

            // Show the rest of this line is storage *being wasted*
            let lineOfBytes = sessionStorage.getItem(tsb);
            while (lineOfBytes.length < 120) {
                lineOfBytes += "00";
            }
            sessionStorage.setItem(tsb, lineOfBytes);

            // Refresh disk log.
            this.getAllDiskContent();

            // Update pcb in _ResidentList to show program is in disk now.
            _ResidentList[programId].memorySegment = -1;
            console.log(_ResidentList[programId].memorySegment);

            TSOS.Control.refreshPcbLog();


            // Wipe program from memory. Memory Manager will record space has been freed.
            _MemoryManager.clearSegment(memorySegment);

            _MemoryAccessor.memoryLog(0x0000, _MemoryAccessor.highestNumber);


            // Copy program into
            return;
        }

        // Get our program from the disk by programId. Make sure check if program.memorySegment == -1 before calling.
        public retrieveProgramFromDisk(programId) {

            // find which program will be swapped out of memory. or pass this in through function?

            let tsb = this.findProgramInMemory(programId);

            let programStr = "";

            let next = sessionStorage.getItem(tsb + ".next");

            while (next) {
                // Get the next line.
                programStr += sessionStorage.getItem(tsb);
                // Now remove it from our disk.
                sessionStorage.setItem(tsb, DEFAULTVAL);

                next = sessionStorage.getItem(tsb + ".next");

                // And remove the "next" value.
                sessionStorage.removeItem(tsb + ".next");
                if (next) {
                    tsb = next;
                }
            }


            return programStr;
        }

        public findProgramInMemory(programId) {
            return this.programToDiskTsb.get(programId);
        }


    }
}
