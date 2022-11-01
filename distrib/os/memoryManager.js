var TSOS;
(function (TSOS) {
    // Client memory accessor. 
    class MemoryManager {
        constructor() { }
        resetMemory() {
            _MemoryAccessor.resetMemory();
        }
        // Not sure if this is in manager or accessor: given a location, clear memory segment in said location.
        // Clears a given memory segment. Accepts 0, 1, or 2.
        clearSegmemt(memorySegment) {
            if (memorySegment < 0 || memorySegment > 2) {
                return;
            }
            else if (memorySegment == 0) {
                _MemoryAccessor.wipe(0x00, 0xFF);
            }
            else if (memorySegment == 1) {
                _MemoryAccessor.wipe(0x100, 0x1FE);
            }
            else { // memorySegment = 2.
                _MemoryAccessor.wipe(0x1FF, 0x2FE);
            }
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map