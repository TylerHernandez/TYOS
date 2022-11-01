module TSOS {

    // Client memory accessor. 
    export class MemoryManager {
        // TODO: keep track of memory segments taken.

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
        public clearSegmemt(memorySegment: number): void {
            if (memorySegment < 0 || memorySegment > 2) {
                return;
            }
            else if (memorySegment == 0) {
                _MemoryAccessor.wipe(0x00, 0xFF);
            }
            else if (memorySegment == 1) {
                _MemoryAccessor.wipe(0x100, 0x1FF);

            } else { // memorySegment = 2.
                _MemoryAccessor.wipe(0x200, 0x2FF);
            }

            this.memorySegments.set(memorySegment, "AVAILABLE");
        }

        // Sets base and limit for memoryAccessor according to given memory segment.
        public setBaseAndLimit(memorySegment): void {
            if (memorySegment == 0) {
                _MemoryAccessor.base = 0x00;
                _MemoryAccessor.limit = 0xFF;

            } else if (memorySegment == 1) {
                _MemoryAccessor.base = 0x100;
                _MemoryAccessor.limit = 0x1FF;
            }
            else {
                _MemoryAccessor.base = 0x200;
                _MemoryAccessor.limit = 0x2FF;
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