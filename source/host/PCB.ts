module TSOS {
    export class PCB {
        constructor(
            public pid: number,
            public state: string,
            public swapped: boolean,
            public pc: number,
            public ir: number,
            public acc: number,
            public x: number,
            public y: number,
            public z: number
        ) { }

    }
}
