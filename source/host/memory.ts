

module TSOS{

export class Memory extends Hardware{

    // Creates MemoryArray with up to FFFF(65535) +1 addressable spaces.
    private MemoryArray: Array<number> = [0x0000];
    // Memory Address Register.
    public MAR = 0x0000;
    // Memory Data Register.
    public MDR = 0x00;

    constructor() {

        super(0, "RAM")

        // Initializes MemoryArray with all elements as '0x00'. 
        this.reset();

        // Logs addressable space.
        this.log("Created - Addressable space : 65536")

    }

    // Sets all (65536)MemoryArray elements to '0x00'.
    public reset(): void {
        for(let index = 0x00; index<=0xFFFF; index++) {
            this.MemoryArray[index] = 0x00;
        }
    }

    // Logs when clock pulses.
    public pulse(): void {
        this.log("received clock pulse");
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
    public getMemoryAt(index):number {
        return this.MemoryArray[index];
    }
    
    // Displays contents of memory from address 0x00 to 0x14.
    public displayZeroFourteen():void {
        // loop through 0x00 -> 0x14, log each memory address + value.
        for (var x=0x00; x<0x15; x++) {
            this.displayMemory(x);
        }
    }

    public displayMemory(location):void {
        this.log( "Address : " + this.hexLog(location, 4) + " Contains Value : " + this.hexLog(this.getMemoryAt(location), 2));
    }

}
}