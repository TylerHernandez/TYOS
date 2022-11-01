var TSOS;
(function (TSOS) {
    // Client memory accessor. 
    class MemoryManager {
        constructor() { }
        resetMemory() {
            _MemoryAccessor.resetMemory();
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
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map