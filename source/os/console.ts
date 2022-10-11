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
        private commandHistory: string[];
        private commandIndex: number;

        constructor(public currentFont = _DefaultFontFamily,
            public currentFontSize = _DefaultFontSize,
            public currentXPosition = 0,
            public currentYPosition = _DefaultFontSize,
            public buffer = "") {
            this.textLog = "";
            this.canvasIsResetting = false;
            this.commandHistory = [];
            this.commandIndex = 0;
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
                    // record command in history.
                    this.commandHistory[this.commandHistory.length] = this.buffer;
                    this.commandIndex = this.commandHistory.length;
                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) { // Backspace, remove the last char.
                    this.removeLastCharFromScreen();
                } else if (chr === String.fromCharCode(9)) { // Tab key.
                    this.autoComplete();
                } else if (chr === String.fromCharCode(38)) { // Up arrow key

                    this.commandIndex -= 1;
                    this.keepIndexInBounds();

                    // put this in the buffer and redraw screen.
                    this.textLog = this.textLog.substring(0, this.textLog.length - this.buffer.length);
                    this.buffer = this.commandHistory[this.commandIndex];
                    this.textLog += this.buffer;
                    this.repaintCanvas();

                } else if (chr === String.fromCharCode(40)) { // Down arrow key

                    this.commandIndex += 1;
                    this.keepIndexInBounds();

                    if (this.commandHistory[this.commandIndex] == undefined) {
                        this.textLog = this.textLog.substring(0, this.textLog.length - this.buffer.length);
                        this.buffer = "";
                    } else {
                        this.textLog = this.textLog.substring(0, this.textLog.length - this.buffer.length);
                        this.buffer = this.commandHistory[this.commandIndex];
                        this.textLog += this.buffer;
                    }

                    this.repaintCanvas();

                    // TODO(@tyh): Add intercept for right arrow key, this will call _CPU.cycle.
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

                // Prevent extra line being added at end of loop.
                if (i != textLogArray.length - 1) {
                    this.advanceLine();
                }
            }

            this.canvasIsResetting = false;
        }

        public repaintCanvas(): void {
            // Record we are resetting canvas so we don't store this text as new text in textLog.
            this.canvasIsResetting = true;
            // Clear canvas.
            this.clearScreen();
            this.resetXY();

            // For every text in textLog, draw to canvas.
            var text: String = "";
            var textLogArray: String[] = this.textLog.split("\n");
            for (let i: number = 0; i < textLogArray.length; i++) {
                this.putText(textLogArray[i]);

                // Prevent extra line being added at end of loop.
                if (i != textLogArray.length - 1) {
                    this.advanceLine();
                }
            }

            this.canvasIsResetting = false;
        }

        // Given a string, if any existing commands in commands list start with the string.
        public autoComplete(): void {
            const firstFewLetters: string = this.buffer;
            var matchedCommands: string[] = [];

            if (!firstFewLetters.includes(" ")) { // Only allow tab command on first word in buffer.
                for (var i: number = 0; _OsShell.commandList.length > i; i++) {

                    // matches user input with the first few letters of each command.
                    if (_OsShell.commandList[i].command.substring(0, firstFewLetters.length) == firstFewLetters) {
                        matchedCommands[matchedCommands.length] = _OsShell.commandList[i].command;
                    }
                }

                if (matchedCommands.length > 1) {
                    this.textLog = this.textLog.substring(0, this.textLog.length - firstFewLetters.length);
                    this.advanceLine();
                    // Write the available commands,
                    for (var i = 0; matchedCommands.length > i; i++) {
                        this.putText(matchedCommands[i] + ", ");
                    }
                    // Repaint buffer on the next line.
                    this.advanceLine();
                    this.textLog += ">" + firstFewLetters;
                    this.repaintCanvas();

                } else { // We found one command the user would probably like to use.
                    // Remove buffer from textLog.
                    this.textLog = this.textLog.substring(0, this.textLog.length - firstFewLetters.length);

                    // Replace buffer with matched command and repaint canvas.
                    this.buffer = matchedCommands[0];
                    this.textLog += this.buffer;
                    this.repaintCanvas();
                }

            }
        }

        // Removes the last char from textlog, screen, and buffer.
        public removeLastCharFromScreen(): void {
            if (this.buffer.length > 0) {
                this.textLog = this.textLog.substring(0, this.textLog.length - 1);
                this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                this.repaintCanvas();
            }
        }

        // Calculate highest length index we can get using commandHistory
        // Simplify the index to stay between 0 and commandHistory.length
        public keepIndexInBounds(): void {
            if (this.commandIndex < 0) {
                this.commandIndex = 0;
            }
            else if (this.commandIndex > this.commandHistory.length) {
                this.commandIndex = this.commandHistory.length;
            }
        }
    }
}
