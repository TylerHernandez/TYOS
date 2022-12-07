/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.

            // Initialize the console.
            _Console = new Console();             // The command line interface / console I/O device.
            _Console.init();

            // Initialize Memory Manager.
            _MemoryManager = new MemoryManager();

            // Initialize Ready Queue.
            _ReadyQueue = new Queue();

            // Display Initial Quantum.
            Control.quantumLog();

            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            //
            // ... more?
            //

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");

            this.krnTrace("begin CPU shutdown");
            _CPU = undefined; // Manually reset CPU to prevent continuous execution.
            this.krnTrace("end CPU shutdown");

            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                          
            */

            // Check for an interrupt, if there are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU && _CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed.

                // If we are using round Robin, allocate cycles to cpu and context switch when needed.
                if (_RoundRobinEnabled) {
                    if (_processCycleCounter < _quantum) {
                        _CPU.cycle();

                        // If current process finishes after this cycle, move on to the next process.
                        if (_ResidentList[_CPU.currentPid].state == "TERMINATED") {
                            _processCycleCounter = _quantum;
                        }


                        _processCycleCounter++;
                    } else {
                        // Save state of our current program and context switch.
                        Utils.saveState();
                        cpuScheduler.roundRobinSetup();
                    }
                } else { // Otherwise, just run our program
                    _CPU.cycle();
                }


            } else if (!_CPU) { // If CPU is removed, don't act.
                return;
            } else { // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
            }
        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();               // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
            }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            // Exhaustive for loop to simulate slow background processs.
            for (var i = 0; i < 100; i += .1) {
                if (i % 25 == 0) {
                    _Console.clearScreen();
                }
                _Console.putText(msg);
            }

            this.krnShutdown();
        }

        // Inserts given string program into memory.
        public insertStringProgram(memorySegment, program: string[]) {

            _MemoryManager.setBaseAndLimit(memorySegment);

            //loops through program and copies data to MAR and MDR
            for (var index = 0x00; index < program.length; index++) {
                _MemoryAccessor.writeImmediate(index, parseInt("0x" + program[index]));
            }

            _MemoryAccessor.memoryLog(0x0000, _MemoryAccessor.highestNumber);
        }

        /*
        // Tracks= 0-99 index.
        // Sectors = 0-99 index.
        // Blocks = 0-255 bytes.
        // Creates a disk with above specified guidelines.
        */
        public createDisk() {
            if (typeof (Storage) !== "undefined") { // We may use session storage.
                sessionStorage.clear();

                for (let track = 0; track <= 3; track++) {
                    for (let sector = 0; sector <= 7; sector++) {
                        for (let block = 0; block <= 7; block++) {
                            const tsb = String(track) + "," + String(sector) + "," + String(block);
                            let data = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
                            sessionStorage.setItem(tsb, data);
                        }
                    }
                }

            } else {
                console.log("Browser does not support session storage");
            }
        }

        // Displays all disk content.
        public getAllDiskContent() {
            let msg = "";

            for (let track = 0; track <= 3; track++) {
                for (let sector = 0; sector <= 3; sector++) {
                    for (let block = 0; block <= 7; block++) {
                        const tsb = String(track) + "," + String(sector) + "," + String(block);
                        const byte = sessionStorage.getItem(tsb);

                        msg += "<tr>";

                        msg += "<td>";
                        msg += tsb
                        msg += "</td>";

                        msg += "<td>";
                        msg += byte;
                        msg += "</td>";

                        msg += "</tr>";
                    }
                }
            }

            TSOS.Control.diskLog(msg);
        }


        // Request to store our program into disk by programId.
        public storeProgramIntoDisk(programId) {
            const pcb: PCB = _ResidentList[programId];
            const memorySegment = pcb.memorySegment;

            // Retrieve program from memory accessor.
            let program: String[] = _MemoryAccessor.fetchProgram(memorySegment);

            // TODO: decide where in disk to place program. Hardcoding at 1,0,0 for now.
            let tsb = "1,0,0";

            // Store Program into disk.
            sessionStorage.setItem(tsb, ""); // Empty out tsb for our input.
            for (let byte of program) {

                if (byte == "--") {
                    byte = "00";
                }
                const currentString = sessionStorage.getItem(tsb);

                if (currentString.length >= 120) {
                    // Increment tsb.

                    //If the block has not reached 7, we can always just add 1 to it.
                    if (Number(tsb[4]) != 7) {
                        let num = Number(tsb[4]) + 1;
                        tsb = tsb.substring(0, 4);
                        tsb += num.toString();

                    } else if (Number(tsb[2]) != 3) { // If sector has not reached 3, we can add 1.
                        // Try incrementing sector. Reset block to 0.
                        let num = Number(tsb[2]) + 1;
                        tsb = tsb.substring(0, 2);
                        tsb += num.toString() + ",0";

                    } else if (Number(tsb[0]) != 3) { // If track has not reached 3, we can add 1.
                        // Try incrementing track. Reset sector and block to 0.
                        let num = Number(tsb[0]) + 1;
                        tsb = tsb.substring(0, 1);
                        tsb += num.toString() + ",0,0";
                    } else {
                        console.log("There is no more space left! Tsb: " + tsb);
                        return;
                    }

                    // Clear out next tsb for the rest of our input.
                    sessionStorage.setItem(tsb, byte.toString());
                } else {
                    sessionStorage.setItem(tsb, currentString + byte);
                }


            }

            // Make sure we show the rest of this line is free storage to be used.
            let lineOfBytes = sessionStorage.getItem(tsb);
            while (lineOfBytes.length < 120) {
                lineOfBytes += "00";
            }
            sessionStorage.setItem(tsb, lineOfBytes);

            // Refresh disk log.
            this.getAllDiskContent();

            // Update pcb in _ResidentList to show program is in disk now.


            // Wipe program from memory. Memory Manager will record space has been freed.
            _MemoryManager.clearSegment(memorySegment);

            _MemoryAccessor.memoryLog(0x0000, _MemoryAccessor.highestNumber);


            // Copy program into
            return;
        }

        // Get our program from the disk by programId.
        public retrieveProgramFromDisk(programId) {

            // find which program will be swapped out of memory. or pass this in through function?
            // hard coding this at 0 for now.



            return;
        }


    }
}
