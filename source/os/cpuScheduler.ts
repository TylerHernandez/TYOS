module TSOS {

    export class cpuScheduler {

        // TODO: take this out of the constructor, make a global variable for it.
        constructor(public readyQueue: Queue, public quantum: number) {
        }

        // Sets up CPU and Memory Manager for a context switch if needed.
        public static roundRobinSetup(): void {
            _CPU.isExecuting = false;

            // put current process back in ready queue if it is not terminated.
            const oldPid = _CPU.currentPid;

            if (_ReadyQueue.isEmpty() && _ResidentList[_CPU.currentPid].state == "TERMINATED") {
                _StdOut.putText("Finished execution of all programs. ");
                _CPU.isExecuting = false;
                return;
            }


            if (_ResidentList[oldPid].state == "READY") {
                _ReadyQueue.enqueue(oldPid);
            }

            // get new process id from ready queue.
            const currentPid = _ReadyQueue.dequeue();

            // Swap old program with current one and load from our PCB!
            if (_ResidentList[currentPid].memorySegment == -1) {
                _DiskSystemDeviceDriver.swapPrograms(oldPid, currentPid);
                _CPU.loadFromPcb(_ResidentList[currentPid]);
            }
            // Set up CPU for this new process's context.
            else if (_CPU.currentPid != currentPid) {
                console.log("Context switching from process " + oldPid + " to " + currentPid);
                // if ()

                _CPU.loadFromPcb(_ResidentList[currentPid]);
                _MemoryManager.setBaseAndLimit(_ResidentList[currentPid].memorySegment);
            } else {
                console.log("Not context switching?");
            }

            // reset _processCycleCounter.
            _processCycleCounter = 0;

            _CPU.isExecuting = true;
        }

        // Turns on round robin flag and sets up for initial execution.
        public static initializeRoundRobin(): void {

            _RoundRobinEnabled = true;

            // get a process id from ready queue.
            let currentPid = _ReadyQueue.dequeue();

            // Set up CPU for this new process's context.
            _CPU.loadFromPcb(_ResidentList[currentPid]);
            _MemoryManager.setBaseAndLimit(_ResidentList[currentPid].memorySegment);

            // reset _processCycleCounter.
            _processCycleCounter = 0;

        }

        public static removeProcessFromReadyQueue(targetPid: number): void {

            var pid = _ReadyQueue.dequeue();
            var i = 0;

            while (i < _ReadyQueue.q.length) {
                if (pid != targetPid) {
                    pid = _ReadyQueue.dequeue();
                    _ReadyQueue.enqueue(pid)
                }
                i++;
            }

        }

    }

}