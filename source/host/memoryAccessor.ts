
module TSOS{
// Memory Management Unit(MMU) will bridge communication between Memory and CPU.
export class memoryAccessor extends Hardware {

    private cpu: Cpu;
    private memory: Memory;

    public lowOrderByte;
    public highOrderByte;

    // Hard-coded program to be added to memory.
    private program = [0xA9, 0x0A, 0x8D, 0x60, 0x00, 0xA9, 0x00, 0x8D, 0x61, 0x00, 0x8D, 0x64, 0x00, 0xA9, 0x01, 0x8D, 0x62, 0x00, 0xAD, 0x61, 0x00, 0x6D, 0x62, 0x00, 0x8D, 0x63, 0x00, 0xAD, 0x62, 0x00, 0x8D, 0x61, 0x00, 0xAD, 0x63, 0x00, 0x8D, 0x62, 0x00, 0xA2, 0x01, 0xAC, 0x63, 0x00, 0xFF, 0xA9, 0xFF, 0x8D, 0x65, 0x00, 0xAD, 0x60, 0x00, 0x6D, 0x65, 0x00, 0x8D, 0x60, 0x00, 0xAE, 0x60, 0x00, 0xEC, 0x64, 0x00, 0xA2, 0x00, 0xD0, 0xCD];
    
    constructor(memory: Memory, cpu: Cpu) {

        super(0, "MMU");

        this.log("created");

        this.cpu = cpu;
        this.memory = memory;

        this.log("Initialized Memory");


        //loops through program and copies data to MAR and MDR
        for (var index = 0x00; index < this.program.length; index++) {
            this.writeImmediate(index, this.program[index]);
        }

        this.memoryDump(0x0000, this.program.length);

    }

    // Flips bytes for desired endianness. 
    public flipBytes(bytes: number): number {
        var str = String(bytes);
        // variables are named according to conversion of little to big endian.
        let lowOrder = str.substring(0,2);
        let highOrder = str.substring(2,4);
        str = highOrder + lowOrder;
        return parseInt(str);
    }


    // Puts a low order byte in register
    public setLowOrderByte(lob: number) {
        this.lowOrderByte = lob;
    }

    // Puts high order byte in register
    public setHighOrderByte(hob: number) {
        this.highOrderByte = hob;
    }

    // Puts low and high order bytes in MAR
    public putBytesInMar() {
        //Construct hexadecimal value 0xLOHO with "lowOrderByte + highOrderByte"
        var byte = this.hexLog(this.lowOrderByte, 2) + "" + this.hexLog(this.highOrderByte, 2);
        this.setMAR(parseInt(byte));
    }

    // Loads a static program into memory
    public writeImmediate(marValue: number, mdrValue: number): void {
            this.memory.setMAR(marValue);
            this.memory.setMDR(mdrValue);
            this.write();
    }

    // Writes to memory.
    public write(): void {
        this.memory.write();
    }

    // Retrieves content at MAR Location
    public fetchMemoryContent(): number {
        this.memory.read();
        return this.memory.getMDR();
    }

    // Sets MAR to memory address 'x'.
    public setMAR(x: number): void {
        this.memory.setMAR(x);
    }

    // Sets MDR to data 'x'.
    public setMDR(x: number): void {
        this.memory.setMDR(x);
    }

    // Retrieves MAR.
    public getMAR() {
        return this.memory.getMAR();
    }


    // Shows contents of memory from startAddress to endAddress.
    public memoryDump(startAddress: number, endAddress: number): void {
        this.log("Memory Dump: Debug");
        this.log("--------------------------------------")
        for (let index = startAddress; index <= endAddress; index++) {
            let currentMemory = this.memory.getMemoryAt(index);
            this.log("Addr " + this.hexLog(index, 4) + ":   |  " + this.hexLog(currentMemory, 2));
        }
        this.log("--------------------------------------");
        this.log("Memory Dump: Complete");
    }




}
}