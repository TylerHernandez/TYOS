var TSOS;
(function (TSOS) {
    // Client memory accessor. 
    class MemoryManager {
        constructor() { }
        resetMemory() {
            _MemoryAccessor.resetMemory();
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map