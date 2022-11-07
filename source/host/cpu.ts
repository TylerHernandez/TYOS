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

        private MemoryAccessor: MemoryAccessor;


        constructor(public programCounter: number = 0,
            public Accumulator: number = 0,
            public xRegister: number = 0,
            public yRegister: number = 0,
            public zFlag: number = 0,
            public isExecuting: boolean = false,
            private step = 1, // fetch is first step (1).
            private instruction = 0, // counts the number of instructions completed.
            public instructionRegister = 0x01,
            public currentPid = 0) {

        }

        init() {
            this.isExecuting = false;
        }

        // MemoryAccessor is made from CPU, then System calls this function to initialize MemoryAccessor in CPU.
        setMemoryAccessor(MemoryAccessor: MemoryAccessor) {
            this.MemoryAccessor = MemoryAccessor;
        }

        // Change this to be all of these steps execute in one cycle.
        cycle(): void {
            // Prevents execution.
            // if (this.isExecuting = false) { // not sure why this isn't being changed in the shell run command.
            //     return; 
            // } 


            this.logPipeline();

            var finishedCycle = false;

            // Since this all needs to be executed in one cycle, will run until interrupt check hits.
            while (!finishedCycle) {

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

                    // Finished cycle!
                    case 7: {
                        this.instruction++;
                        this.step = 1;
                        finishedCycle = true;
                        _MemoryAccessor.memoryLog(0x0000, _MemoryAccessor.highestNumber);
                        break;
                    }

                } // ends Switch statement.

            } // ends while.

        } // ends Pulse.

        // Fetches instruction.
        fetch(): void {

            // Set MAR to programCounter.
            this.MemoryAccessor.setMAR(this.programCounter);

            // Increment program counter every time we read a byte.
            this.programCounter++;

            // Grab instruction from MemoryAccessor.
            this.instructionRegister = this.MemoryAccessor.fetchMemoryContent();

            // Set next step to either decode or execute.
            this.step = this.determineNextStep(this.instructionRegister);
        }

        // Retrieves operands for full instruction.
        decode(): void {
            // Instruction has one operand.
            if (this.instructionRegister == 0xA9 || this.instructionRegister == 0xA2 ||
                this.instructionRegister == 0xA0 || this.instructionRegister == 0xD0) {
                // Read operand at program counter index.
                this.MemoryAccessor.setMAR(this.programCounter);

                // Increment program counter after reading.
                this.programCounter++;

                // Step to execute.
                this.step = 4;

            } else { // Instruction has two operands.
                // Read at program counter index.
                this.MemoryAccessor.setMAR(this.programCounter);

                // Increment program counter after reading.
                this.programCounter++;

                // First of two decodes will set low order byte.
                if (this.step == 2) {
                    this.MemoryAccessor.setLowOrderByte(this.MemoryAccessor.fetchMemoryContent());
                } else { // Second of two decodes will set high order byte.
                    this.MemoryAccessor.setHighOrderByte(this.MemoryAccessor.fetchMemoryContent());
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
                    this.Accumulator = this.MemoryAccessor.fetchMemoryContent();
                    this.step = 7;
                    break;
                }

                // Load accumulator with memory address.
                case 0xAD: {
                    // Put the low order byte + high order byte in MAR.
                    this.MemoryAccessor.putBytesInMar();
                    this.Accumulator = this.MemoryAccessor.fetchMemoryContent();
                    this.step = 7;
                    break;
                }

                // Store accumulator in memory.
                case 0x8D: {
                    // Set MAR with the operand bytes (low + high).
                    this.MemoryAccessor.putBytesInMar();
                    this.MemoryAccessor.setMDR(this.Accumulator);
                    this.MemoryAccessor.write();
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

                    this.MemoryAccessor.putBytesInMar();
                    this.Accumulator += this.MemoryAccessor.fetchMemoryContent();

                    if (this.Accumulator >= 0x100) {
                        this.Accumulator -= 0x100
                    }

                    this.step = 7;
                    break;
                }

                // Load x register with a constant.
                case 0xA2: {
                    this.xRegister = this.MemoryAccessor.fetchMemoryContent();
                    this.step = 7;
                    break;
                }

                // Load x register from memory. 
                case 0xAE: {

                    this.MemoryAccessor.putBytesInMar();
                    this.xRegister = this.MemoryAccessor.fetchMemoryContent();
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
                    this.yRegister = this.MemoryAccessor.fetchMemoryContent();
                    this.step = 7;
                    break;
                }

                // Load y register from memory. 
                case 0xAC: {

                    this.MemoryAccessor.putBytesInMar();
                    this.yRegister = this.MemoryAccessor.fetchMemoryContent();
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
                    this.step = 7;
                    break;
                }

                // Break.
                case 0x00: {
                    // saves and updates the current program's state to 'TERMINATED'.
                    Utils.onProgramFinish();
                    this.step = 7;
                    break;
                }

                // Compare byte in memory to x register if zflag is set.
                case 0xEC: {
                    this.MemoryAccessor.putBytesInMar();
                    if (this.xRegister == this.MemoryAccessor.fetchMemoryContent()) {
                        this.zFlag = 1;
                    }
                    this.step = 7;
                    break;
                }

                // Branch n bytes if zflag == 0.
                case 0xD0: {
                    if (this.zFlag == 0) {
                        this.programCounter -= ((0xFF - this.MemoryAccessor.fetchMemoryContent()) + 1);
                    }
                    this.step = 7;
                    break;
                }

                // Increment value of byte.
                case 0xEE: {

                    if (this.step == 4) {
                        this.MemoryAccessor.putBytesInMar();
                        this.Accumulator = this.MemoryAccessor.fetchMemoryContent();
                    } else {
                        this.Accumulator++;
                    }

                    this.step++; //execute2 or writeback
                    break;
                }

                // System Call.
                case 0xFF: {

                    switch (this.xRegister) {

                        case 0x01: { // print integer stored in y register
                            _StdOut.putText(TSOS.Utils.hexLog(this.yRegister, 2));
                            this.step = 7;
                            break;
                        }

                        case 0x02: { // print 00-terminated String stored at address in y register
                            // Print string at this memory location. 
                            this.printStringAt(this.yRegister);

                            this.step = 7;
                            break;
                        }

                    }
                    break;
                }

                case undefined: {
                    this.instructionRegister = 0x00;
                    break;
                }

                // Invalid OP code detected.
                case this.instructionRegister: {
                    console.log("Invalid OP code detected. Shutting down program.");
                    _ResidentList[this.currentPid].state = "TERMINATED";
                    this.isExecuting = false;
                    this.step = 7;
                    TSOS.Control.refreshPcbLog();
                    break;
                }

            }
        }

        writeback(): void {
            this.MemoryAccessor.putBytesInMar();
            this.MemoryAccessor.setMDR(this.Accumulator);
            this.MemoryAccessor.write();
            this.step++;
        }


        logPipeline(): void {
            TSOS.Control.cpuLog(
                "<tr><td>" + Utils.hexLog(this.programCounter, 2) + "</td><td>" + Utils.hexLog(this.instructionRegister, 2)
                + "</td><td>" + Utils.hexLog(this.Accumulator, 2) + "</td><td>" + Utils.hexLog(this.xRegister, 2) + "</td><td>"
                + Utils.hexLog(this.yRegister, 2) + "</td><td>" + this.zFlag + "</td><td>" + this.step + "</td></tr>"//+ " total instructions: " + this.instruction
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

        // Saves current state of registers to PCB.
        public saveCurrentState(pid: number = 0, memorySegment: number, state: string): PCB {
            return new PCB(pid, memorySegment, state, false, this.programCounter, this.instructionRegister,
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
            this.currentPid = pcb.pid;
        }

        public printStringAt(memoryAddress: number) {

            _MemoryAccessor.setMAR(memoryAddress);
            while (_MemoryAccessor.fetchMemoryContent() != 0) {

                var char = _MemoryAccessor.fetchMemoryContent();
                _StdOut.putText(String.fromCharCode(char));
                memoryAddress++;

                _MemoryAccessor.setMAR(memoryAddress);
            }
        }

    }
}