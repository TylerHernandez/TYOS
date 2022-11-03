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
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement>document.getElementById("taHostLog")).value = "";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement>document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement>document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }

        // Logs the Memory in our HTML text box.
        public static memoryLog(msg: string) {
            var taLog = <HTMLAreaElement>document.getElementById("taMemory");
            taLog.innerHTML = msg;
        }

        // Logs the CPU in our HTML text box.
        public static cpuLog(msg: string) {
            var taLog = <HTMLAreaElement>document.getElementById("taCPU");
            taLog.innerHTML = msg + taLog.innerHTML;
        }

        // Refreshes PCB log when called.
        public static refreshPcbLog(): void {

            // Build the log string.
            var str: string = "";
            _PCBLIST.forEach(function (x) {
                str += ("<tr> <td>" + x.pid + "</td> <td>" + x.memorySegment + "</td> <td>" + x.state + "</td> <td>" + x.swapped + "</td> <td>" + Utils.hexLog(x.pc, 2)
                    + "</td> <td>" + Utils.hexLog(x.ir, 2) + "</td> <td>" + Utils.hexLog(x.acc, 2) + "</td> <td>" + Utils.hexLog(x.x, 2) + "</td> <td>" + Utils.hexLog(x.y, 2) + "</td> <td>" + Utils.hexLog(x.z, 2) + "</td> </tr>");
            });

            // Update the log console.
            var taLog = <HTMLAreaElement>document.getElementById("taPCB");
            taLog.innerHTML = str;
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new CPU();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // Initializes Memory.
            // _Memory = new Memory();
            _Memory = new Memory();


            // Initializes MemoryAccessor.
            _MemoryAccessor = new MemoryAccessor(_Memory, _CPU);

            // Initializes MemoryAccessor inside CPU to allow for proper function.
            _CPU.setMemoryAccessor(_MemoryAccessor);

            var MemoryManager: MemoryManager = null;


            // Initializes PCB list.
            _PCBLIST = [];

            (<HTMLInputElement>document.getElementById('taProgramInput')).innerText =
                //"A9008D7B00A9008D7B00A9008D7C00A9008D7C00A9018D7A00A200EC7A00D039A07DA202FFAC7B00A201FFAD7B008D7A00A9016D7A008D7B00A903AE7B008D7A00A900EC7A00D002A9018D7A00A201EC7A00D005A9018D7C00A900AE7C008D7A00A900EC7A00D002A9018D7A00A200EC7A00D0ACA07FA202FF00000000610061646F6E6500";
                // Loads program input with "12DONE" program as default value.
                //"A9038D4100A9018D4000AC4000A201FFEE4000AE4000EC4100D0EFA9448D4200A94F8D4300A94E8D4400A9458D4500A9008D4600A202A042FF00";
                // Loads program input with default value (Fibonacci of 1-5).
                "A9058D6000A9008D61008D6400A9018D6200AD61006D62008D6300AD62008D6100AD63008D6200A201AC6300FFA9FF8D6500AD60006D65008D6000AE6000EC6400A200D0CD";

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
    }
}
