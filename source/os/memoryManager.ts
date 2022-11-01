module TSOS {

    // Client memory accessor. 
    export class MemoryManager {

        constructor() { }

        public resetMemory() {
            _MemoryAccessor.resetMemory();
        }

        // Clears a given memory segment. Accepts 0, 1, or 2.
        public clearSegmemt(memorySegment: number): void {
            if (memorySegment < 0 || memorySegment > 2) {
                return;
            }
            else if (memorySegment == 0){
                _MemoryAccessor.wipe(0x00, 0xFF);
            }
            else if (memorySegment == 1) { 
                _MemoryAccessor.wipe(0x100, 0x1FE);

            } else { // memorySegment = 2.
                _MemoryAccessor.wipe(0x1FF, 0x2FE);
            }
        }


    }

}