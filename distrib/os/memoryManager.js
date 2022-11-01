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
                _MemoryAccessor.wipe(0x00, 0xFF);
            }
            else if (memorySegment == 1) {
                _MemoryAccessor.wipe(0x100, 0x1FF);
            }
            else { // memorySegment = 2.
                _MemoryAccessor.wipe(0x200, 0x2FF);
            }
            this.memorySegments.set(memorySegment, "AVAILABLE");
        }
        // Sets base and limit for memoryAccessor according to given memory segment.
        setBaseAndLimit(memorySegment) {
            if (memorySegment == 0) {
                _MemoryAccessor.base = 0x00;
                _MemoryAccessor.limit = 0xFF;
            }
            else if (memorySegment == 1) {
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
        determineNextSegment() {
            for (let [key, value] of this.memorySegments) {
                console.log(key, value);
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