/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class CPU {
        programCounter;
        Accumulator;
        xRegister;
        yRegister;
        zFlag;
        isExecuting;
        step;
        instruction;
        instructionRegister;
        MMU;
        constructor(programCounter = 0, Accumulator = 0, xRegister = 0, yRegister = 0, zFlag = 0, isExecuting = false, step = 1, // fetch is first step (1).
        instruction = 0, // counts the number of instructions.
        instructionRegister = 0x00) {
            this.programCounter = programCounter;
            this.Accumulator = Accumulator;
            this.xRegister = xRegister;
            this.yRegister = yRegister;
            this.zFlag = zFlag;
            this.isExecuting = isExecuting;
            this.step = step;
            this.instruction = instruction;
            this.instructionRegister = instructionRegister;
        }
        init() {
            this.isExecuting = false;
        }
        // MMU is made from CPU, then System calls this function to initialize MMU in CPU.
        setMMU(MMU) {
            this.MMU = MMU;
        }
        cycle() {
            this.logPipeline();
            //Steps taken by CPU pipeline
            switch (this.step) {
                //Fetch
                case 1: {
                    this.fetch();
                    break;
                }
                //Decode
                case 2: {
                    this.decode();
                    break;
                }
                //Decode 2
                case 3: {
                    this.decode();
                    break;
                }
                //Execute
                case 4: {
                    this.execute();
                    break;
                }
                //Execute 2
                case 5: {
                    this.execute();
                    break;
                }
                //Writeback
                case 6: {
                    this.writeback();
                    break;
                }
                //Interrupt check
                case 7: {
                    this.interrupt();
                    break;
                }
            } // ends Switch statement.
        } // ends Pulse.
        // Fetches instruction.
        fetch() {
            // Set MAR to programCounter.
            this.MMU.setMAR(this.programCounter);
            // Increment program counter every time we read a byte.
            this.programCounter++;
            // Grab instruction from mmu.
            this.instructionRegister = this.MMU.fetchMemoryContent();
            // Set next step to either decode or execute.
            this.step = this.determineNextStep(this.instructionRegister);
        }
        // Retrieves operands for full instruction.
        decode() {
            // Instruction has one operand.
            if (this.instructionRegister == 0xA9 || this.instructionRegister == 0xA2 ||
                this.instructionRegister == 0xA0 || this.instructionRegister == 0xD0) {
                // Read operand at program counter index.
                this.MMU.setMAR(this.programCounter);
                // Increment program counter after reading.
                this.programCounter++;
                // Step to execute.
                this.step = 4;
            }
            else { // Instruction has two operands.
                // Read at program counter index.
                this.MMU.setMAR(this.programCounter);
                // Increment program counter after reading.
                this.programCounter++;
                // First of two decodes will set low order byte.
                if (this.step == 2) {
                    this.MMU.setLowOrderByte(this.MMU.fetchMemoryContent());
                }
                else { // Second of two decodes will set high order byte.
                    this.MMU.setHighOrderByte(this.MMU.fetchMemoryContent());
                }
                // Step to either decode 2 or execute.
                this.step++;
            }
        }
        // Executes instruction according to opcode.
        execute() {
            switch (this.instructionRegister) {
                // Load accumulator with constant.
                case 0xA9: {
                    this.Accumulator = this.MMU.fetchMemoryContent();
                    this.step = 7;
                    break;
                }
                // Load accumulator with memory address.
                case 0xAD: {
                    // Put the low order byte + high order byte in MAR.
                    this.MMU.putBytesInMar();
                    this.Accumulator = this.MMU.fetchMemoryContent();
                    this.step = 7;
                    break;
                }
                // Store accumulator in memory.
                case 0x8D: {
                    // Set MAR with the operand bytes (low + high).
                    this.MMU.putBytesInMar();
                    this.MMU.setMDR(this.Accumulator);
                    this.MMU.write();
                    this.step = 7;
                    break;
                }
                // // Load accumulator from x register.
                // case 0x8A: {
                //     this.Accumulator = this.xRegister;
                //     this.step = 7;
                //     break;
                // }
                // // Load accumulator from y register.
                // case 0x98: {
                //     this.Accumulator = this.yRegister;
                //     this.step = 7;
                //     break;
                // }
                // Add contents from memory address onto accumulator.
                case 0x6D: {
                    this.MMU.putBytesInMar();
                    this.Accumulator += this.MMU.fetchMemoryContent();
                    if (this.Accumulator >= 0x100) {
                        this.Accumulator -= 0x100;
                    }
                    this.step = 7;
                    break;
                }
                // Load x register with a constant.
                case 0xA2: {
                    this.xRegister = this.MMU.fetchMemoryContent();
                    this.step = 7;
                    break;
                }
                // Load x register from memory. 
                case 0xAE: {
                    this.MMU.putBytesInMar();
                    this.xRegister = this.MMU.fetchMemoryContent();
                    this.step = 7;
                    break;
                }
                // // Load x register with accumulator.
                // case 0xAA: {
                //     this.xRegister = this.Accumulator;
                //     this.step = 7;
                //     break;
                // }
                // Load y register with a constant.
                case 0xA0: {
                    this.yRegister = this.MMU.fetchMemoryContent();
                    this.step = 7;
                    break;
                }
                // Load y register from memory. 
                case 0xAC: {
                    this.MMU.putBytesInMar();
                    this.yRegister = this.MMU.fetchMemoryContent();
                    this.step = 7;
                    break;
                }
                // Load y register with accumulator.
                case 0xA8: {
                    this.yRegister = this.Accumulator;
                    this.step = 7;
                    break;
                }
                // No Operation.
                case 0xEA: {
                    break;
                }
                // Break.
                case 0x00: {
                    break;
                }
                // Compare byte in memory to x register if zflag is set.
                case 0xEC: {
                    this.MMU.putBytesInMar();
                    if (this.xRegister == this.MMU.fetchMemoryContent()) {
                        this.zFlag = 1;
                    }
                    this.step = 7;
                    break;
                }
                // Branch n bytes if zflag == 0.
                case 0xD0: {
                    if (this.zFlag == 0) {
                        this.programCounter -= ((0xFF - this.MMU.fetchMemoryContent()) + 1);
                    }
                    this.step = 7;
                    break;
                }
                // Increment value of byte.
                case 0xEE: {
                    if (this.step == 4) {
                        this.MMU.putBytesInMar();
                        this.Accumulator = this.MMU.fetchMemoryContent();
                    }
                    else {
                        this.Accumulator++;
                    }
                    this.step++; //execute2 or writeback
                    break;
                }
                // System Call.
                case 0xFF: {
                    switch (this.xRegister) {
                        case 0x01: {
                            console.log(this.hexLog(this.yRegister, 2));
                            this.step = 7;
                            break;
                        }
                        case 0x02: {
                            //process.stdout.write();
                            break;
                        }
                    }
                    break;
                }
            }
        }
        writeback() {
            this.MMU.putBytesInMar();
            this.MMU.setMDR(this.Accumulator);
            this.MMU.write();
            this.step++;
        }
        interrupt() {
            // increase instruction count
            this.instruction++;
            this.step = 1;
        }
        logPipeline() {
            console.log("CPU State | Mode: 0 PC: " + this.hexLog(this.programCounter, 4) + " IR: " + this.hexLog(this.instructionRegister, 2)
                + " Acc: " + this.hexLog(this.Accumulator, 2) + " xReg: " + this.hexLog(this.xRegister, 2) + " yReg: "
                + this.hexLog(this.yRegister, 2) + " zFlag: " + this.zFlag + " Step: " + this.step //+ " total instructions: " + this.instruction
            );
        }
        determineNextStep(currentInstruction) {
            // Instructions that require decoding to retrieve operands.
            let decodeRequired = [0xA9, 0xAD, 0x8D, 0x6D, 0xA2, 0xAE, 0xA0, 0xAC, 0xEC, 0xD0, 0xEE];
            if (decodeRequired.includes(currentInstruction)) {
                // Step 2(decode).
                return 2;
            }
            // Step 4(execute).
            return 4;
        }
        hexLog(num, desired_length) {
            if (num === undefined) {
                return "ERR [hexValue conversion]: number undefined";
            }
            // Convert num to a string formatted in hex.
            num = num.toString(16).toUpperCase();
            // if num.length < desired_length, add starting zero's 
            while (num.length < desired_length) {
                num = "0" + num;
            }
            return num;
        }
    }
    TSOS.CPU = CPU;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map