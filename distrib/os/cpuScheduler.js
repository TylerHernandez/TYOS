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
        // Give a process in the ready queue 'quantum' cycles, then grab the next process until readyQueue is empty
        roundRobin() {
            // Loop until readyQueue is empty.
            while (!this.readyQueue.isEmpty) {
                let currentPid = this.readyQueue.dequeue();
                for (var i = 0; i < this.quantum; i++) {
                    // Set up CPU for this new process's context.
                    if (_CPU.currentPid != currentPid) {
                        _CPU.loadFromPcb(_PCBLIST[currentPid]);
                        _MemoryManager.setBaseAndLimit(_PCBLIST[currentPid].memorySegment);
                    }
                }
            }
        }
        static roundRobinSetup() {
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
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuScheduler.js.map