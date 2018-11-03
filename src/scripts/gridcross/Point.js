export default function Point(x, y) {
    Object.defineProperties(this, {
        x: {
            value: x !== undefined ? x : 0.0,
            writable: false,
            enumerable: true,
            configurable: false
        },
        y: {
            value: y !== undefined ? y : 0.0,
            writable: false,
            enumerable: true,
            configurable: false
        },
    });
}