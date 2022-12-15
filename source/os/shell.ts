/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                "ver",
                "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                "help",
                "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                "shutdown",
                "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                "cls",
                "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                "man",
                "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                "trace",
                "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                "rot13",
                "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                "prompt",
                "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                "date",
                "- Displays the date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereami,
                "whereami",
                "- Displays where you are.");
            this.commandList[this.commandList.length] = sc;

            // surpriseme
            sc = new ShellCommand(this.shellSurpriseme,
                "surpriseme",
                "- Displays a surprise.");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new ShellCommand(this.shellStatus,
                "status",
                "<string> - Sets the status.");
            this.commandList[this.commandList.length] = sc;

            // crash
            sc = new ShellCommand(this.shellCrash,
                "crash",
                "- Triggers a kernel trap error.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                "load",
                "- Copies user's inputted program into main memory.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun,
                "run",
                "<pid> - runs a program in memory.");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new ShellCommand(this.shellRunAll,
                "runall",
                "- runs all programs in memory.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new ShellCommand(this.shellClearMem,
                "clearmem",
                "- Clears all memory segments");
            this.commandList[this.commandList.length] = sc;

            // quantum
            sc = new ShellCommand(this.shellQuantum,
                "quantum",
                "<int> - Changes the quantum.");
            this.commandList[this.commandList.length] = sc;

            // kill
            sc = new ShellCommand(this.shellKill,
                "kill",
                "<pid> - kills a program in memory.");
            this.commandList[this.commandList.length] = sc;


            // killall
            sc = new ShellCommand(this.shellKillAll,
                "killall",
                "- kills all programs in resident list.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new ShellCommand(this.shellPs,
                "ps",
                "- display the PID and state of all processes.");
            this.commandList[this.commandList.length] = sc;

            // Format
            sc = new ShellCommand(this.shellFormat,
                "format",
                "- Formats our disk.");
            this.commandList[this.commandList.length] = sc;

            // swap
            sc = new ShellCommand(this.shellSwap,
                "swap",
                "<memory pid> <disk pid>- Swaps a program in memory with a program on disk. ");
            this.commandList[this.commandList.length] = sc;


            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
        }

        public shellCls(args: string[]) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
            if (args.length > 0) {
                var topic = args[0];
                var recognizedCommand: ShellCommand = null;
                // If topic is a command in commandList, retrieve the ShellCommand.
                for (let index = 0; index < _OsShell.commandList.length; index++) {
                    if (_OsShell.commandList[index].command == topic) {
                        recognizedCommand = _OsShell.commandList[index];
                    }
                }
                if (recognizedCommand != null) {
                    // recognized shell command - print it's description.
                    _StdOut.putText(recognizedCommand.command + recognizedCommand.description);
                } else {
                    _StdOut.putText("No manual entry for " + topic + ".");
                }

            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellStatus(args: string[]) {
            if (args.length > 0) {

                var argsString = "";
                for (var i = 0; i < args.length; i++) {
                    argsString += args[i] + " ";
                }

                document.getElementById("status").innerHTML = argsString;
            } else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        }

        public shellDate(args: string[]) {
            _StdOut.putText(new Date().toLocaleString());
        }

        public shellWhereami(args: string[]) {
            _StdOut.putText("Heres a better question: where do you want to be?");
        }

        public shellSurpriseme(args: string[]) {
            if (Date.now() % 2 == 0)
                _StdOut.putText("Surprise!");
            else
                _StdOut.putText("\n");
        }

        public shellCrash(args: string[]) {
            _Kernel.krnTrapError("SPOOKY BLU SCREEN! Try downloading more ram!");
        }

        public shellLoad(args: string[]) {
            console.log(_MemoryManager.memorySegments);
            var givenProgram: string[] = (<HTMLInputElement>document.getElementById('taProgramInput')
            ).value.replaceAll(' ', '') // Removes all white spaces.
                .replaceAll(',', '') // Removes all commas.
                .split(""); // Splits program into each hex digit.

            // At this point, we should only have hex digits.
            let acceptableItems = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
            // program will contain grouped (by 2's) up hex digits.
            var program: string[] = [];

            for (var i = 0; i < givenProgram.length; i++) {

                // Catches any invalid digits/characters in givenProgram.
                if (!acceptableItems.includes(givenProgram[i])) {
                    _StdOut.putText("This is not a valid program.");
                    return;

                    // Split program numbers into pairs and put them inside program[].
                } else if (i % 2 == 0) { // even number.


                    /* E.g. We want to put the 0th and 1st element of givenProgram 
                     * into program's 0th index. And so on.
                     *
                     * 0 1     2 3     4 5       6 7
                     *  0       1       2         3
                     */

                    program[i / 2] = givenProgram[i];

                } else { // odd number.

                    // See 2 comments above for explanation.
                    program[(i - 1) / 2] += givenProgram[i];
                }

            }
            Utils.pauseProgram();


            // Find a free memory segment to insert our program into.
            let memorySegment = _MemoryManager.determineNextSegment();

            // Assign a PID (this will be dynamic in future versions).
            var assignedPid: number = _PIDCounter;
            _PIDCounter++;

            // Create pcb for our process and put it in our list.
            let pcb = new PCB(assignedPid, memorySegment);
            _ResidentList[assignedPid] = pcb; // PCB's index will always be it's assigned PID.

            if (memorySegment == -1) {

                _StdOut.putText("Memory is full... ");

                if (!_DiskSystemDeviceDriver.isFormatted) {
                    _StdOut.putText("Formatting the disk... ");
                    _DiskSystemDeviceDriver.createDisk();
                }


                _StdOut.putText("Storing on disk... ");
                _DiskSystemDeviceDriver.storeProgramIntoDisk(assignedPid, program);
                _DiskSystemDeviceDriver.refreshDiskDisplay();
            } else {
                // Insert our program into memory!
                _Kernel.insertStringProgram(memorySegment, program);
            }


            // Put process id in the ready queue for round robin scheduling!
            _ReadyQueue.enqueue(assignedPid);

            _StdOut.putText(" -- Assigning program to PID #" + assignedPid);
            TSOS.Control.refreshPcbLog();
        } // ends load

        public shellRun(args: string[]) {
            if (args.length > 0) {

                // if cpu is already executing, save state first.
                Utils.saveState();

                // Given a PID, run a process already in memory.

                const pid = Number(args[0]);

                if (_ResidentList[pid].state == "TERMINATED") {
                    _StdOut.putText("You cannot run a terminated process. ");
                    return;
                }

                let process = _ResidentList[pid];
                // Load the CPU with our process state.
                _CPU.loadFromPcb(process);

                // Request Memory Manager update our accessor's base and limits.
                _MemoryManager.setBaseAndLimit(process.memorySegment);

                // Tell our CPU it may start execution now!
                _CPU.isExecuting = true;

            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
                return;
            }
        } // ends run

        // Enables round robin to run all ready processes in memory.
        public shellRunAll(args: string[]) {

            cpuScheduler.initializeRoundRobin();

            // Start execution on our CPU!
            _CPU.isExecuting = true;

            _StdOut.putText("Round Robin enabled with quantum " + _quantum);
        }

        // Wipes our memory (to store new programs).
        public shellClearMem(args: string[]) {
            if (_CPU.isExecuting) {
                _CPU.isExecuting = false;
                _StdOut.putText("You cannot clear memory while CPU is executing. Pausing execution of CPU.")
                return;
            }
            // TODO: Tell Memory Manager to clear *taken* segments. Return which segments cleared and print return val here.
            _MemoryManager.clearSegment(0);
            _MemoryManager.clearSegment(1);
            _MemoryManager.clearSegment(2);

            // Since we're clearing memory, the cpu should not have any processes loaded.
            _CPU.loadFromPcb(new PCB());

            // This will prevent running processes out of memory.
            for (var i = 0; i < _ResidentList.length; i++) {
                _ResidentList[i].memorySegment = -1;

                cpuScheduler.removeProcessFromReadyQueue(i); // tells our cpu scheduler this process is off limits.
                TSOS.Control.refreshPcbLog();
            }

            _StdOut.putText("Cleared memory segments 0, 1, and 2");
        }

        // Changes our quantum for round robin.
        public shellQuantum(args: string[]) {
            if (args.length > 0) {

                const newQuantum = Number(args[0]);

                if (newQuantum <= 0) {
                    _Kernel.krnTrapError("TYOS: Wow. You think you're cool or whatever don't ya.");
                    return;
                }

                _quantum = newQuantum;
                Control.quantumLog();

                _StdOut.putText("Changed quantum to " + _quantum);
            } else {
                _StdOut.putText("Usage: prompt <int>  Please supply an integer greater than 0.");
            }

        }

        // Given a pid, kills process associated with it.
        public shellKill(args: string[]) {
            if (args.length > 0) {

                // Ensure we don't mess up a currently running program.
                if (_CPU.isExecuting) {
                    Utils.saveState();
                }

                _CPU.isExecuting = false;

                const pid = Number(args[0]);

                _ResidentList[pid].state = "TERMINATED";

                // If our current pid is in the cpu, remove it.
                if (_CPU.currentPid = pid) {
                    _CPU.loadFromPcb(new PCB());
                }

                // Make sure remove the process from the ready queue.
                cpuScheduler.removeProcessFromReadyQueue(pid);

                _StdOut.putText("Terminated process " + pid);

                TSOS.Control.refreshPcbLog();

            } else {
                _StdOut.putText("Usage: prompt <pid>  Please supply a process ID.");
            }
        }

        // Kills all processes in resident list (_ResidentList) and cpu.
        public shellKillAll(args: string[]) {

            // This is just used to tell user which processes have been killed by this command.
            var killedProcesses = "";

            // Turn off CPU execution then save our current CPU state.
            _CPU.isExecuting = false;
            Utils.saveState();

            // Now.... we kill it!
            killedProcesses += _CPU.currentPid + ", ";
            _ResidentList[_CPU.currentPid].state = "TERMINATED";
            _CPU.loadFromPcb(new PCB());
            TSOS.Control.refreshPcbLog();

            // Next, remove all processes from the ready queue and set them to terminated.
            var pid = _ReadyQueue.dequeue();

            while (pid != null) {
                _ResidentList[pid].state = "TERMINATED";
                killedProcesses += pid + ", ";
                pid = _ReadyQueue.dequeue();
                TSOS.Control.refreshPcbLog();
            }
            killedProcesses += "]";

            // Lastly, display text and refresh PCB.
            _StdOut.putText("Killed processes : [ " + killedProcesses);

        }

        // Displays the PID and state of all processes.
        public shellPs(args: string[]) {

            var str = ""; // will hold string to be printed out.
            // Loop through resident list (PCBLIST) and print out pid : state

            for (var i = 0; i < _ResidentList.length; i++) {
                str += ("process " + i + " : " + _ResidentList[i].state + "\n");
            }

            _StdOut.putText(str);

        }

        // Format our disk.
        public shellFormat(args: string[]) {

            // Create and formats disk.
            _DiskSystemDeviceDriver.createDisk();

            // Now display our changes for the user.
            _DiskSystemDeviceDriver.refreshDiskDisplay();

        }

        public shellSwap(args: string[]) {
            if (args.length >= 2) {
                let memorypid = Number(args[0]);
                let diskpid = Number(args[1]);
                _DiskSystemDeviceDriver.swapPrograms(memorypid, diskpid);
            } else {
                _StdOut.putText("Missing <memorypid> <diskpid> parameters for swap.");
            }
        }




    }// ends shell
} // ends module
