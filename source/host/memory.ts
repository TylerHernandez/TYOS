

module TSOS {

    export class Memory {

        // Creates MemoryArray with up to FFFF(65535) +1 addressable spaces.
        private MemoryArray: Array<number> = [0x0000];
        // // Memory Address Register.
        private MAR = 0x0000;
        // // Memory Data Register.
        private MDR = 0x00;


        constructor() {
        }


        // init() {
        //     this.MAR = 0x0000;
        //     this.MDR = 0x00;
        // }

        // Sets all (65536)MemoryArray elements to undefined.
        public reset(): void {
            for (let index = 0x00; index <= 0xFFFF; index++) {
                this.MemoryArray[index] = undefined;
            }
        }

        // Given a range of addresses, sets content of addresses to undefined. 
        public wipe(start, stop): void {
            for (let index = start; index <= stop; index++) {
                this.MemoryArray[index] = undefined;
            }
        }

        // Returns MAR.
        public getMAR(): number {
            return this.MAR;
        }
        // Sets MAR to a given input.
        public setMAR(input: number): void {
            this.MAR = input;
        }
        // Returns MDR.
        public getMDR(): number {
            return this.MDR;
        }
        // Sets MDR to a given input.
        public setMDR(input: number): void {
            this.MDR = input;
        }

        // Grabs MAR memory location and gives data output to MDR.
        public read(): void {
            var data = this.MemoryArray[this.MAR];
            this.setMDR(data);
        }

        // Writes contents of MDR to Memory Location : MAR.
        public write(): void {
            this.MemoryArray[this.MAR] = this.MDR;
        }

        // Returns Memory value at a given index.
        public getMemoryAt(index): number {
            return this.MemoryArray[index];
        }
        
    } // ends export
}