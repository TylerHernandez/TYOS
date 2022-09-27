/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    class Control {
        static hostInit() {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }
        static hostLog(msg, source = "?") {
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        }
        //
        // Host Events
        //
        static hostBtnStartOS_click(btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.CPU(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            // Initializes Memory.
            // _Memory = new Memory();
            _Memory = new Memory();
            // Initializes MMU.
            _MMU = new MMU(_Memory, _CPU);
            // Initializes MMU inside CPU to allow for proper function.
            _CPU.setMMU(_MMU);
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        }
        static hostBtnHaltOS_click(btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }
        static hostBtnReset_click(btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
    }
    TSOS.Control = Control;
    // For some reason I have to declare these classes here to not get an error during run time. 
    // Previous error was "TSOS.Memory is not a constructor". Been stuck on this all day so will just put this here
    // and move on to a new issue.
    class Hardware {
        id;
        name;
        debug = true;
        constructor(id, name) {
            this.id = id;
            this.name = name;
        }
        log(message) {
            if (this.debug) {
                console.log("[HW - "
                    + this.name
                    + " id: " + this.id
                    + " - " + Date.now()
                    + "]: " + message);
            }
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
    } // ends export Hardware
    TSOS.Hardware = Hardware;
    class Memory {
        // Creates MemoryArray with up to FFFF(65535) +1 addressable spaces.
        MemoryArray = [0x0000];
        // // Memory Address Register.
        MAR = 0x0000;
        // // Memory Data Register.
        MDR = 0x00;
        constructor() {
        }
        // init() {
        //     this.MAR = 0x0000;
        //     this.MDR = 0x00;
        // }
        // Sets all (65536)MemoryArray elements to '0x00'.
        reset() {
            for (let index = 0x00; index <= 0xFFFF; index++) {
                this.MemoryArray[index] = 0x00;
            }
        }
        // Returns MAR.
        getMAR() {
            return this.MAR;
        }
        // Sets MAR to a given input.
        setMAR(input) {
            this.MAR = input;
        }
        // Returns MDR.
        getMDR() {
            return this.MDR;
        }
        // Sets MDR to a given input.
        setMDR(input) {
            this.MDR = input;
        }
        // Grabs MAR memory location and gives data output to MDR.
        read() {
            var data = this.MemoryArray[this.MAR];
            this.setMDR(data);
        }
        // Writes contents of MDR to Memory Location : MAR.
        write() {
            this.MemoryArray[this.MAR] = this.MDR;
        }
        // Returns Memory value at a given index.
        getMemoryAt(index) {
            return this.MemoryArray[index];
        }
        // Displays contents of memory from address 0x00 to 0x14.
        displayZeroFourteen() {
            // loop through 0x00 -> 0x14, log each memory address + value.
            for (var x = 0x00; x < 0x15; x++) {
                this.displayMemory(x);
            }
        }
        displayMemory(location) {
            //this.log( "Address : " + this.hexLog(location, 4) + " Contains Value : " + this.hexLog(this.getMemoryAt(location), 2));
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
    } // ends export
    TSOS.Memory = Memory;
    class MMU extends Hardware {
        cpu;
        memory;
        lowOrderByte;
        highOrderByte;
        // Hard-coded program to be added to memory.
        program = [0xA9, 0x0A, 0x8D, 0x60, 0x00, 0xA9, 0x00, 0x8D, 0x61, 0x00, 0x8D, 0x64, 0x00, 0xA9, 0x01, 0x8D, 0x62, 0x00, 0xAD, 0x61, 0x00, 0x6D, 0x62, 0x00, 0x8D, 0x63, 0x00, 0xAD, 0x62, 0x00, 0x8D, 0x61, 0x00, 0xAD, 0x63, 0x00, 0x8D, 0x62, 0x00, 0xA2, 0x01, 0xAC, 0x63, 0x00, 0xFF, 0xA9, 0xFF, 0x8D, 0x65, 0x00, 0xAD, 0x60, 0x00, 0x6D, 0x65, 0x00, 0x8D, 0x60, 0x00, 0xAE, 0x60, 0x00, 0xEC, 0x64, 0x00, 0xA2, 0x00, 0xD0, 0xCD];
        constructor(memory, cpu) {
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
        // Inserts given string program into memory.
        insertStringProgram(program) {
            //loops through program and copies data to MAR and MDR
            for (var index = 0x00; index < program.length; index++) {
                this.writeImmediate(index, parseInt("0x" + program[index]));
            }
            this.memoryDump(0x0000, program.length);
            return true;
        }
        // Flips bytes for desired endianness. 
        flipBytes(bytes) {
            var str = String(bytes);
            // variables are named according to conversion of little to big endian.
            let lowOrder = str.substring(0, 2);
            let highOrder = str.substring(2, 4);
            str = highOrder + lowOrder;
            return parseInt(str);
        }
        // Puts a low order byte in register
        setLowOrderByte(lob) {
            this.lowOrderByte = lob;
        }
        // Puts high order byte in register
        setHighOrderByte(hob) {
            this.highOrderByte = hob;
        }
        // Puts low and high order bytes in MAR
        putBytesInMar() {
            //Construct hexadecimal value 0xLOHO with "lowOrderByte + highOrderByte"
            var byte = this.hexLog(this.lowOrderByte, 2) + "" + this.hexLog(this.highOrderByte, 2);
            this.setMAR(parseInt(byte));
        }
        // Loads a static program into memory
        writeImmediate(marValue, mdrValue) {
            this.memory.setMAR(marValue);
            this.memory.setMDR(mdrValue);
            this.write();
        }
        // Writes to memory.
        write() {
            this.memory.write();
        }
        // Retrieves content at MAR Location
        fetchMemoryContent() {
            this.memory.read();
            return this.memory.getMDR();
        }
        // Sets MAR to memory address 'x'.
        setMAR(x) {
            this.memory.setMAR(x);
        }
        // Sets MDR to data 'x'.
        setMDR(x) {
            this.memory.setMDR(x);
        }
        // Retrieves MAR.
        getMAR() {
            return this.memory.getMAR();
        }
        // Shows contents of memory from startAddress to endAddress.
        memoryDump(startAddress, endAddress) {
            this.log("Memory Dump: Debug");
            this.log("--------------------------------------");
            for (let index = startAddress; index <= endAddress - 1; index++) {
                let currentMemory = this.memory.getMemoryAt(index);
                this.log("Addr " + this.hexLog(index, 4) + ":   |  " + this.hexLog(currentMemory, 2));
            }
            this.log("--------------------------------------");
            this.log("Memory Dump: Complete");
        }
    } // ends export MMU
    TSOS.MMU = MMU;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=control.js.map