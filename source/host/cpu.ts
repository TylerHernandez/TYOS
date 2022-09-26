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

    export class Cpu {

        constructor(public PC: number = 0,
            public Acc: number = 0,
            public Xreg: number = 0,
            public Yreg: number = 0,
            public Zflag: number = 0,
            public isExecuting: boolean = false,
            public step: number = 1) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.step = 1;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            this.cpuClockCount += 1;
            //this.log("received clock pulse - CPU Clock Count: " + this.cpuClockCount)
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
                    this.isExecuting = true;
                    this.execute();
                    break;
                }

                //Execute 2
                case 5: {
                    this.isExecuting = true;
                    this.execute();
                    break;
                }

                //Writeback
                case 6: {
                    this.isExecuting = false;
                    this.writeback();
                    break;
                }

                //Interrupt check
                case 7: {
                    this.isExecuting = false; // needed here as well in case a writeback is not required for current command.
                    this.interrupt();
                    break;
                }
            } // ends Switch statement.
        }// ends cycle.

        // Fetches instruction.
        fetch(): void {

            // Set MAR to PC.
            this.MMU.setMAR(this.PC);

            // Increment program counter every time we read a byte.
            this.PC++;

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
                this.MMU.setMAR(this.PC);

                // Increment program counter after reading.
                this.PC++;

                // Step to execute.
                this.step = 4;

            } else { // Instruction has two operands.
                // Read at program counter index.
                this.MMU.setMAR(this.PC);

                // Increment program counter after reading.
                this.PC++;

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

                // Load Acc with constant.
                case 0xA9: {
                    this.Acc = this.MMU.fetchMemoryContent();
                    this.step = 7;
                    break;
                }

                // Load Acc with memory address.
                case 0xAD: {
                    // Put the low order byte + high order byte in MAR.
                    this.MMU.putBytesInMar();
                    this.Acc = this.MMU.fetchMemoryContent();
                    this.step = 7;
                    break;
                }

                // Store Acc in memory.
                case 0x8D: {
                    // Set MAR with the operand bytes (low + high).
                    this.MMU.putBytesInMar();
                    this.MMU.setMDR(this.Acc);
                    this.MMU.write();
                    this.step = 7;
                    break;
                }

                // Load Acc from x register.
                case 0x8A: {
                    this.Acc = this.Xreg;
                    this.step = 7;
                    break;
                }

                // Load Acc from y register.
                case 0x98: {
                    this.Acc = this.Yreg;
                    this.step = 7;
                    break;
                }

                // Add contents from memory address onto Acc.
                case 0x6D: {

                    this.MMU.putBytesInMar();
                    this.Acc += this.MMU.fetchMemoryContent();

                    if (this.Acc >= 0x100) {
                        this.Acc -= 0x100
                    }

                    this.step = 7;
                    break;
                }

                // Load x register with a constant.
                case 0xA2: {
                    this.Xreg = this.MMU.fetchMemoryContent();
                    this.step = 7;
                    break;
                }

                // Load x register from memory. 
                case 0xAE: {

                    this.MMU.putBytesInMar();
                    this.Xreg = this.MMU.fetchMemoryContent();
                    this.step = 7;
                    break;
                }

                // Load x register with Acc.
                case 0xAA: {
                    this.Xreg = this.Acc;
                    this.step = 7;
                    break;
                }

                // Load y register with a constant.
                case 0xA0: {
                    this.Yreg = this.MMU.fetchMemoryContent();
                    this.step = 7;
                    break;
                }

                // Load y register from memory. 
                case 0xAC: {

                    this.MMU.putBytesInMar();
                    this.Yreg = this.MMU.fetchMemoryContent();
                    this.step = 7;
                    break;
                }

                // Load y register with Acc.
                case 0xA8: {
                    this.Yreg = this.Acc;
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

                // Compare byte in memory to x register if Zflag is set.
                case 0xEC: {
                    this.MMU.putBytesInMar();
                    if (this.Xreg == this.MMU.fetchMemoryContent()) {
                        this.Zflag = 1;
                    }
                    this.step = 7;
                    break;
                }

                // Branch n bytes if Zflag == 0.
                case 0xD0: {
                    if (this.Zflag == 0) {
                        this.PC -= ((0xFF - this.MMU.fetchMemoryContent()) + 1);
                    }
                    this.step = 7;
                    break;
                }

                // Increment value of byte.
                case 0xEE: {

                    if (this.step == 4) {
                        this.MMU.putBytesInMar();
                        this.Acc = this.MMU.fetchMemoryContent();
                    } else {
                        this.Acc++;
                    }

                    this.step++; //execute2 or writeback
                    break;
                }

                // System Call.
                case 0xFF: {

                    switch (this.Xreg) {

                        case 0x01: {
                            console.log(this.hexLog(this.Yreg, 2));
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
            this.MMU.setMDR(this.Acc);
            this.MMU.write();
            this.step++;
        }

        interrupt(): void {
            // increase instruction count
            this.instruction++;
            this.step = 1;
        }

        logPipeline(): void {
            super.log(
                "CPU State | Mode: 0 PC: " + this.hexLog(this.PC, 4) + " IR: " + this.hexLog(this.instructionRegister, 2)
                + " Acc: " + this.hexLog(this.Acc, 2) + " xReg: " + this.hexLog(this.Xreg, 2) + " yReg: "
                + this.hexLog(this.Yreg, 2) + " Zflag: " + this.Zflag + " Step: " + this.step //+ " total instructions: " + this.instruction
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

    }
}
