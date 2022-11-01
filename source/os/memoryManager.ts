module TSOS {

    // Client memory accessor. 
    export class MemoryManager {
        // TODO: keep track of memory segments taken.
        constructor() { }

        public resetMemory() {
            _MemoryAccessor.resetMemory();
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
        }


    }

}