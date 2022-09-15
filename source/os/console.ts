/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        // Holds a log for text, to be utilized for redrawing canvas.
        private textLog: String;
        private canvasIsResetting: Boolean;

        constructor(public currentFont = _DefaultFontFamily,
            public currentFontSize = _DefaultFontSize,
            public currentXPosition = 0,
            public currentYPosition = _DefaultFontSize,
            public buffer = "") {
            this.textLog = "";
            this.canvasIsResetting = false;
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }

        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {

                let index = 0;
                var textArray: string[] = text.split("");
                var offset: number;

                // Draw every character individually to properly calculate what text fits on the line.
                while (index < textArray.length) {

                    // If text does not fit on x axis, advance line.
                    if (_DrawingContext.measureText(this.currentFont, this.currentFontSize, textArray[index]) + this.currentXPosition >= _Canvas.width) {
                        this.advanceLine();
                    }

                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition,
                        textArray[index]);
                    offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, textArray[index]);
                    this.currentXPosition = this.currentXPosition + offset;

                    if (!this.canvasIsResetting) {
                        this.textLog += textArray[index];
                    }

                    index++;
                }
            }
        }

        public advanceLine(): void {
            if (!this.canvasIsResetting) {
                this.textLog += "\n";
            }

            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;

            // If the Y position is not visible, keep removing the oldest line. Prevent recursion with canvasIsResetting.
            while ((this.currentYPosition > _Canvas.height) && !this.canvasIsResetting) {
                this.removeOldestLine();
            }

        }

        public removeOldestLine(): void {
            // Record we are resetting canvas so we don't store this text as new text in textLog.
            this.canvasIsResetting = true;
            // Clear canvas.
            this.clearScreen();
            this.resetXY();

            // Slim down textLog, removing the oldest line from the string.
            this.textLog = this.textLog.slice(this.textLog.indexOf("\n") + 1);

            // For every text in textLog, draw to canvas.
            var text: String = "";
            var textLogArray: String[] = this.textLog.split("\n");
            for (let i: number = 0; i < textLogArray.length; i++) {
                this.putText(textLogArray[i]);
                this.advanceLine();
            }

            this.canvasIsResetting = false;
        }
    }
}
