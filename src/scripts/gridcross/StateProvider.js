export default class StateProvider {
    constructor(initialState = {}) {
        this.state = [initialState];
    }

    set(entry) {
        this.state.push(entry);
        return this.state[this.state.length - 1];
    }

    get(pastPoint = this.state.length - 1) {

        console.log('getting state');
        return this.state[pastPoint];
    }
}