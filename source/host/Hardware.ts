// Super class for all hardware

module TSOS {
    export class Hardware {

        id: number;
        name: string;
        debug: boolean = true;

        constructor(id, name) {
            this.id = id;
            this.name = name;
        }

        public log(message): void {
            if (this.debug) {
                console.log(
                    "[HW - "
                    + this.name
                    + " id: " + this.id
                    + " - " + Date.now()
                    + "]: " + message);
            }
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

    }// ends export Hardware
}