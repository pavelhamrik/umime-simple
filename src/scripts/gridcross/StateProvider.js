export default class StateProvider {
    constructor(initialState = {}) {
        this.state = [initialState];
    }

    set(entry) {
        this.state.push(entry);
        return this.state[this.state.length - 1];
    }

    get(pastPoint = this.state.length - 1) {
        return this.state[pastPoint];
    }

    rewind(steps = 0) {
        // we want to keep the initial grid and content generated by the assignment data
        if (this.state.length === 2) return;

        this.state = this.state.slice(0, this.state.length - steps);
        return this.state[this.state.length - 1];
    }
}