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
module TSOS {

    export class CPU {

        private MMU: MMU;


        constructor(public programCounter: number = 0,
            public Accumulator: number = 0,
            public xRegister: number = 0,
            public yRegister: number = 0,
            public zFlag: number = 0,
            public isExecuting: boolean = false,
            private step = 1, // fetch is first step (1).
            private instruction = 0, // counts the number of instructions.
            public instructionRegister = 0x00) {

        }

        init() {
            this.isExecuting = false;
        }

        // MMU is made from CPU, then System calls this function to initialize MMU in CPU.
        setMMU(MMU: MMU) {
            this.MMU = MMU;
        }

        // Change this to be all of these steps execute in one cycle.
        cycle(): void {
            this.logPipeline();

            var finished = 0;

            // Since this all needs to be executed in one cycle, will run until interrupt check hits.
            while (finished != 1) {

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
                        finished = 1;
                        break;
                    }
                } // ends Switch statement.

            } // ends while.

        } // ends Pulse.

        // Fetches instruction.
        fetch(): void {

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
        decode(): void {
            // Instruction has one operand.
            if (this.instructionRegister == 0xA9 || this.instructionRegister == 0xA2 ||
                this.instructionRegister == 0xA0 || this.instructionRegister == 0xD0) {
                // Read operand at program counter index.
                this.MMU.setMAR(this.programCounter);

                // Increment program counter after reading.
                this.programCounter++;

                // Step to execute.
                this.step = 4;

            } else { // Instruction has two operands.
                // Read at program counter index.
                this.MMU.setMAR(this.programCounter);

                // Increment program counter after reading.
                this.programCounter++;

                // First of two decodes will set low order byte.
                if (this.step == 2) {
                    this.MMU.setLowOrderByte(this.MMU.fetchMemoryContent());
                } else { // Second of two decodes will set high order byte.
                    this.MMU.setHighOrderByte(this.MMU.fetchMemoryContent());
                }
                // Step to either decode 2 or execute.
                this.step++;
            }
        }

        // Executes instruction according to opcode.
        execute(): void {

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
                        this.Accumulator -= 0x100
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
                    } else {
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

        writeback(): void {
            this.MMU.putBytesInMar();
            this.MMU.setMDR(this.Accumulator);
            this.MMU.write();
            this.step++;
        }

        interrupt(): void { // Interrupts are no longer being directly handled by the CPU. TODO: refactor.
            // increase instruction count
            this.instruction++;
            this.step = 1;
        }

        logPipeline(): void {
            TSOS.Control.cpuLog(
                "CPU State | Mode: 0 PC: " + this.hexLog(this.programCounter, 4) + " IR: " + this.hexLog(this.instructionRegister, 2)
                + " Acc: " + this.hexLog(this.Accumulator, 2) + " xReg: " + this.hexLog(this.xRegister, 2) + " yReg: "
                + this.hexLog(this.yRegister, 2) + " zFlag: " + this.zFlag + " Step: " + this.step //+ " total instructions: " + this.instruction
            );
        }

        determineNextStep(currentInstruction: number) {
            // Instructions that require decoding to retrieve operands.
            let decodeRequired = [0xA9, 0xAD, 0x8D, 0x6D, 0xA2, 0xAE, 0xA0, 0xAC, 0xEC, 0xD0, 0xEE];
            if (decodeRequired.includes(currentInstruction)) {
                // Step 2(decode).
                return 2;
            }
            // Step 4(execute).
            return 4;
        }

        public hexLog(num, desired_length): String {
            if (num === undefined) {
                return "ERR [hexValue conversion]: number undefined"
            }

            // Convert num to a string formatted in hex.
            num = num.toString(16).toUpperCase();

            // if num.length < desired_length, add starting zero's 
            while (num.length < desired_length) {
                num = "0" + num;
            }
            return num;
        }

        // Saves current state of registers to PCB.
        public saveCurrentState(pid: number = 0): PCB {
            return new PCB(pid, "state", false, this.programCounter, this.instructionRegister,
                this.Accumulator, this.xRegister, this.yRegister, this.zFlag);
        }

        // Loads a state from the CPU given a PCB.
        public loadFromPcb(pcb: PCB): void {
            this.programCounter = pcb.pc;
            this.instructionRegister = pcb.ir;
            this.Accumulator = pcb.acc;
            this.xRegister = pcb.x;
            this.yRegister = pcb.y;
            this.zFlag = pcb.z;
        }

    }
}