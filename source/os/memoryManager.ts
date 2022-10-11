module TSOS {

    // Client memory accessor. 
    export class MemoryManager {

        constructor() { }

        insertStringProgram(program: string[]) {
            _MemoryAccessor.insertStringProgram(program);
        }
        resetMemory() {
            _MemoryAccessor.resetMemory();
        }



    }

}