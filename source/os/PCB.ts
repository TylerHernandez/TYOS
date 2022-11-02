module TSOS {
    export class PCB {
        constructor(
            public pid: number,
            // Acceptable memoryLocations include 0, 1, and 2. 
            public memorySegment: number = -1, // Default at -1 to use as flag for memory has no location. 
            public state: string = "Waiting",
            public swapped: boolean = false,
            public pc: number = 0,
            public ir: number = 0,
            public acc: number = 0,
            public x: number = 0,
            public y: number = 0,
            public z: number = 0,

        ) { }

        // Return whether or not PCB is merely template such as 'emptyPCB()'.
        isEmpty() {
            if (this.state == "Waiting" &&
                this.swapped == false &&
                this.pc == 0 &&
                this.ir == 0 &&
                this.acc == 0 &&
                this.x == 0 &&
                this.y == 0 &&
                this.z == 0) {
                return true;
            }
            return false;
        }
    }
}
