// from https://github.com/thelonious/kld-intersections

import { OK, ERROR, PARALLEL, COINCIDENT, NO_INTERSECTION } from "./constants";

export const intersectLineLine = function (a1, a2, b1, b2) {
    let intersections = [];
    let status = ERROR;

    let ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    let ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    let u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

    if (u_b !== 0) {
        let ua = ua_t / u_b;
        let ub = ub_t / u_b;

        if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
            intersections.push({
                x: a1.x + ua * (a2.x - a1.x),
                y: a1.y + ua * (a2.y - a1.y),
            });
            status = OK;
        }
        else {
            status = NO_INTERSECTION;
        }
    }
    else {
        if (ua_t === 0 || ub_t === 0) {
            status = COINCIDENT;
        }
        else {
            status = PARALLEL;
        }
    }

    return {
        intersections: intersections,
        status: status,
    };
};