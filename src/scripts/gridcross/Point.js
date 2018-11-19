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

    Point.prototype.equals = function (point, tolerance = 0) {
        return (
            Math.abs(this.x - point.x) <= tolerance &&
            Math.abs(this.y - point.y) <= tolerance
        );
    };

    Point.prototype.lerp = function(point, t) {
        const omt = 1.0 - t;
        return new this.constructor(
            this.x * omt + point.x * t,
            this.y * omt + point.y * t
        );
    };
}