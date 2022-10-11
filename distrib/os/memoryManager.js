var TSOS;
(function (TSOS) {
    // Client memory accessor. 
    class MemoryManager {
        constructor() { }
        insertStringProgram(program) {
            _MemoryAccessor.insertStringProgram(program);
        }
        resetMemory() {
            _MemoryAccessor.resetMemory();
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map