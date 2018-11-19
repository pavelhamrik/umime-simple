// from https://github.com/thelonious/kld-intersections

import { OK, ERROR, PARALLEL, COINCIDENT, NO_INTERSECTION, COINCIDENT_LINE_THRESHOLD } from "./constants";
import Point from './Point';
import { calculateDistance } from './functions';

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
            intersections.push(
                new Point(
                    a1.x + ua * (a2.x - a1.x),
                    a1.y + ua * (a2.y - a1.y)
                )
            );
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


export const intersectCircleCircle = function(c1, r1, c2, r2) {
    const result = [];

    // Determine minimum and maximum radii where circles can intersect
    const r_max = r1 + r2;
    const r_min = Math.abs(r1 - r2);

    // Determine actual distance between circle circles
    const c_dist = calculateDistance(c1, c2);

    // if ( c_dist > r_max ) {
    //     result = new Intersection("Outside");
    // }
    // else if ( c_dist < r_min ) {
    //     result = new Intersection("Inside");
    // }
    // else {

    if (c_dist < r_max && c_dist > r_min) {
        const a = (r1*r1 - r2*r2 + c_dist*c_dist) / ( 2*c_dist );
        const h = Math.sqrt(r1*r1 - a*a);
        const p = c1.lerp(c2, a/c_dist);
        const b = h / c_dist;

        result.push(
            new Point(
                p.x - b * (c2.y - c1.y),
                p.y + b * (c2.x - c1.x)
            )
        );
        result.push(
            new Point(
                p.x + b * (c2.y - c1.y),
                p.y - b * (c2.x - c1.x)
            )
        );
    }

    return result;
};


// because we consider lines automatically extended from segments, we need to introduce a small tolerance
// to account for computational imprecision

export const lineCoincidence = function (a1, a2, b1, b2, tolerance = COINCIDENT_LINE_THRESHOLD) {
    let ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    let ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    let u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

    return Math.abs(u_b) <= tolerance && (Math.abs(ua_t) <= tolerance || Math.abs(ub_t) <= tolerance);
};


// test if a path segment is a sub-segment of another one

export const isSubsegment = function (a1, a2, b1, b2, tolerance = COINCIDENT_LINE_THRESHOLD) {
    const l1x = Math.min(a1.x, a2.x);
    const l2x = Math.max(a1.x, a2.x);
    const l1y = Math.min(a1.y, a2.y);
    const l2y = Math.max(a1.y, a2.y);

    const p1x = Math.min(b1.x, b2.x);
    const p2x = Math.max(b1.x, b2.x);
    const p1y = Math.min(b1.y, b2.y);
    const p2y = Math.max(b1.y, b2.y);

    return lineCoincidence(a1, a2, b1, b2, tolerance)
        ? l1x <= p1x && p1x <= p2x && p2x <= l2x && l1y <= p1y && p1y <= p2y && p2y <= l2y
        : false;
};