module TSOS {

    export class cpuScheduler {

        // TODO: take this out of the constructor, make a global variable for it.
        constructor(public readyQueue: Queue, public quantum: number) {
        }

        // Sets up CPU and Memory Manager for a context switch if needed.
        public static roundRobinSetup(): void {

            // put current process back in ready queue if it is not terminated.
            let oldPid = _CPU.currentPid;
            if (_PCBLIST[oldPid].state == "READY") {
                _ReadyQueue.enqueue(oldPid);
            }

            // get new process id from ready queue.
            let currentPid = _ReadyQueue.dequeue();

            // Set up CPU for this new process's context.
            if (_CPU.currentPid != currentPid) {
                _CPU.loadFromPcb(_PCBLIST[currentPid]);
                _MemoryManager.setBaseAndLimit(_PCBLIST[currentPid].memorySegment);
            }

            // reset _processCycleCounter.
            _processCycleCounter = 0;

        }

    }

}