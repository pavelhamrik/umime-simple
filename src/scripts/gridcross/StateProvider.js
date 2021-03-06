export default class StateProvider {
    constructor(initialState = {}) {
        this.initialState = initialState;
        this.state = [this.initialState];
        this.operationsCount = 0;
    }

    set(entry) {
        this.operationsCount += 1;
        this.state.push(entry);
        return this.state[this.state.length - 1];
    }

    get(pastPoint = this.state.length - 1) {
        return this.state[pastPoint];
    }

    rewind(steps = 0) {
        // we want to keep the initial grid and content generated by the assignment data
        if (this.state.length === 2) return;
        if (steps < 1) return;

        this.operationsCount += steps;
        this.state = this.state.slice(0, this.state.length - steps);
        return this.state[this.state.length - 1];
    }

    wipe() {
        this.operationsCount = 0;
        this.state = [this.initialState];
    }

    get length() {
        return this.state.length;
    }

    getOperationsCount() {
        return this.operationsCount;
    }
}