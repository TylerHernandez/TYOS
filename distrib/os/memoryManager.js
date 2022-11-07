var TSOS;
(function (TSOS) {
    // Client memory accessor. 
    class MemoryManager {
        // TODO: keep track of memory segments taken.
        memorySegments; // map of memory segment to availability
        constructor() {
            this.memorySegments = new Map([
                [0, "AVAILABLE"],
                [1, "AVAILABLE"],
                [2, "AVAILABLE"]
            ]);
        }
        resetMemory() {
            _MemoryAccessor.resetMemory();
            this.memorySegments.set(0, "AVAILABLE");
            this.memorySegments.set(1, "AVAILABLE");
            this.memorySegments.set(2, "AVAILABLE");
        }
        // Clears a given memory segment. Accepts 0, 1, or 2.
        clearSegmemt(memorySegment) {
            if (memorySegment < 0 || memorySegment > 2) {
                return;
            }
            else if (memorySegment == 0) {
                _MemoryAccessor.wipe(0x0000, 0x00FF);
            }
            else if (memorySegment == 1) {
                _MemoryAccessor.wipe(0x0100, 0x01FF);
            }
            else { // memorySegment = 2.
                _MemoryAccessor.wipe(0x0200, 0x02FF);
            }
            this.memorySegments.set(memorySegment, "AVAILABLE");
        }
        // Sets base and limit for memoryAccessor according to given memory segment.
        setBaseAndLimit(memorySegment) {
            if (memorySegment == 0) {
                _MemoryAccessor.base = 0x0000;
                _MemoryAccessor.limit = 0x00FF;
            }
            else if (memorySegment == 1) {
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
        determineNextSegment() {
            for (let [key, value] of this.memorySegments) {
                if (value == "AVAILABLE") {
                    return key;
                }
            }
            return -1;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map