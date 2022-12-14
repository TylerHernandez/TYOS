module TSOS {

    // Client memory accessor. 
    export class MemoryManager {

        public memorySegments: Map<number, string>; // map of memory segment to availability

        constructor() {
            this.memorySegments = new Map<number, string>([
                [0, "AVAILABLE"],
                [1, "AVAILABLE"],
                [2, "AVAILABLE"]
            ]);
        }

        public resetMemory() {
            _MemoryAccessor.resetMemory();
            this.memorySegments.set(0, "AVAILABLE");
            this.memorySegments.set(1, "AVAILABLE");
            this.memorySegments.set(2, "AVAILABLE");
        }

        // Clears a given memory segment. Accepts 0, 1, or 2.
        public clearSegment(memorySegment: number): void {
            console.log(memorySegment + " given to clearSegment()");

            if (memorySegment < 0 || memorySegment > 2) {
                return;
            }
            else if (memorySegment == 0) {
                _MemoryAccessor.wipe(0x0000, 0x00FF);
            }
            else if (memorySegment == 1) {
                _MemoryAccessor.wipe(0x0100, 0x01FF);

            } else { // memorySegment = 2.
                _MemoryAccessor.wipe(0x0200, 0x02FF);
            }

            this.memorySegments.set(memorySegment, "AVAILABLE");
        }

        // Sets base and limit for memoryAccessor according to given memory segment.
        public setBaseAndLimit(memorySegment): void {
            if (memorySegment == 0) {
                _MemoryAccessor.base = 0x0000;
                _MemoryAccessor.limit = 0x00FF;

            } else if (memorySegment == 1) {
                _MemoryAccessor.base = 0x0100;
                _MemoryAccessor.limit = 0x01FF;
            }
            else {
                _MemoryAccessor.base = 0x0200;
                _MemoryAccessor.limit = 0x02FF;
            }

            // Let's reserve this memorySegment for the incoming process.
            this.memorySegments.set(memorySegment, "TAKEN");
        }

        // Finds next available segment to be used.
        public determineNextSegment(): number {
            for (let [key, value] of this.memorySegments) {
                if (value == "AVAILABLE") {
                    return key;
                }
            }
            return -1;
        }


    }

}