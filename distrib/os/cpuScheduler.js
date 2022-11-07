var TSOS;
(function (TSOS) {
    class cpuScheduler {
        readyQueue;
        quantum;
        // TODO: take this out of the constructor, make a global variable for it.
        constructor(readyQueue, quantum) {
            this.readyQueue = readyQueue;
            this.quantum = quantum;
        }
        // Sets up CPU and Memory Manager for a context switch if needed.
        static roundRobinSetup() {
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
        // Turns on round robin flag and sets up for initial execution.
        static initializeRoundRobin() {
            _RoundRobinEnabled = true;
            // get a process id from ready queue.
            let currentPid = _ReadyQueue.dequeue();
            // Set up CPU for this new process's context.
            _CPU.loadFromPcb(_PCBLIST[currentPid]);
            _MemoryManager.setBaseAndLimit(_PCBLIST[currentPid].memorySegment);
            // reset _processCycleCounter.
            _processCycleCounter = 0;
        }
        static removeProcessFromReadyQueue(targetPid) {
            var pid = _ReadyQueue.dequeue();
            var i = 0;
            while (i < _ReadyQueue.q.length) {
                if (pid != targetPid) {
                    pid = _ReadyQueue.dequeue();
                    _ReadyQueue.enqueue(pid);
                }
                i++;
            }
        }
    }
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuScheduler.js.map