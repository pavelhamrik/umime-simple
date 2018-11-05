// based on https://github.com/thelonious/kld-affine/blob/development/lib/Point2D.js

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

    Point.prototype.equals = function (point) {
        return (this.x === point.x && this.y === point.y);
    };

    // Point.prototype.roughlyEquals = function(point, tolerance) {
    //     return (
    //         Math.abs(this.x - point.x) < tolerance &&
    //         Math.abs(this.y - point.y) < tolerance
    //     );
    // };
}