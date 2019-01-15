// from https://github.com/thelonious/kld-intersections

import {
    OK,
    ERROR,
    PARALLEL,
    COINCIDENT,
    NO_INTERSECTION,
    COINCIDENT_LINE_THRESHOLD,
} from "./constants";
import Point from './Point';
import { calculateDistance } from './functions';

export const intersectLineLine = function(a1, a2, b1, b2) {
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

export const isCoincident = function(a1, a2, b1, b2, tolerance = COINCIDENT_LINE_THRESHOLD) {
    let ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    let ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    let u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

    return Math.abs(u_b) <= tolerance && (Math.abs(ua_t) <= tolerance || Math.abs(ub_t) <= tolerance);
};


export const subsegmentLines = function(p1, p2, q1, q2, symmetric = true) {
    if (!isCoincident(p1, p2, q1, q2)) return {applies: false, geometry: []};

    const p = sortPoints([p1, p2]);
    const q = sortPoints([q1, q2]);

    const swap = symmetric && calculateDistance(p[0], p[1]) < calculateDistance(q[0], q[1]);
    const a = swap ? q : p;
    const b = swap ? p : q;

    const xs = [a[0].x, b[0].x, b[1].x, a[1].x];
    const ys = [a[0].y, b[0].y, b[1].y, a[1].y];

    if (isAsc(xs) && (isAsc(ys) || isAsc(ys.slice().reverse()))) {
        const unique = getUniquePoints([a[0], a[1], b[0], b[1]]);

        const geometry = [];

        if (unique.length === 4) {
            geometry.push({geometry: {p1: a[0], p2: b[0]}});
            geometry.push({geometry: {p1: b[1], p2: a[1]}});
        }
        else if (unique.length === 3) {
            if (a[0].equals(b[0])) geometry.push({geometry: {p1: a[1], p2: b[1]}});
            else if (a[1].equals(b[1])) geometry.push({geometry: {p1: a[0], p2: b[0]}});
        }

        return {
            applies: true,
            geometry: geometry,
        }
    }

    return {applies: false, geometry: []}
};


export const overlapLines = function(p1, p2, q1, q2) {
    if (!isCoincident(p1, p2, q1, q2)) return {applies: false, geometry: []};

    const p = sortPoints([p1, p2]);
    const q = sortPoints([q1, q2]);

    const swap = p[0].x > q[0].x;
    const a = swap ? q : p;
    const b = swap ? p : q;

    const xs = [a[0].x, b[0].x, a[1].x, b[1].x];
    const ys1 = [a[0].y, b[0].y, a[1].y, b[1].y];
    const ys2 = [b[0].y, a[0].y, b[1].y, a[1].y];

    // console.log(xs, ys1, ys2);

    if (isAsc(xs)) {
        if (isAsc(ys1) || isAsc(ys1.slice().reverse())) {
            return {
                applies: true,
                geometry: [
                    {geometry: {p1: new Point(a[0].x, a[0].y), p2: new Point(b[0].x, b[0].y)}},
                    {geometry: {p1: new Point(b[0].x, b[0].y), p2: new Point(a[1].x, a[1].y)}},
                    {geometry: {p1: new Point(a[1].x, a[1].y), p2: new Point(b[1].x, b[1].y)}},
                ]
            }
        }
        if (isAsc(ys2) || isAsc(ys2.slice().reverse())) {
            return {
                applies: true,
                geometry: [
                    {geometry: {p1: new Point(a[0].x, b[0].y), p2: new Point(b[0].x, a[0].y)}},
                    {geometry: {p1: new Point(b[0].x, a[0].y), p2: new Point(a[1].x, b[1].y)}},
                    {geometry: {p1: new Point(a[1].x, b[1].y), p2: new Point(b[1].x, a[1].y)}},
                ]
            }
        }
    }

    return {applies: false, geometry: []};
};


export const isConnected = function(p1, p2, q1, q2) {
    if (!isCoincident(p1, p2, q1, q2)) return false;

    const uniques = getUniquePoints([p1, p2, q1, q2]);
    if (uniques.length === 3) {
        const pLength = calculateDistance(p1, p2);
        const qLength = calculateDistance(q1, q2);
        const abLength = calculateDistance(uniques[0], uniques[1]);
        const bcLength = calculateDistance(uniques[1], uniques[2]);
        const acLength = calculateDistance(uniques[0], uniques[2]);

        if (Math.max(abLength, bcLength, acLength) > Math.max(pLength, qLength)) return true;
    }

    return false;
};


export const combineOverlappingLines = function(p1, p2, q1, q2) {
    const subsegment = subsegmentLines(p1, p2, q1, q2);
    if (subsegment.applies) {
        console.log('%cSUBSEGMENT', 'color: aqua');
        return subsegment.geometry;
    }
    if (isConnected(p1, p2, q1, q2)) {
        console.log('%cCONNECTED', 'color: yellow');
        if (p2.equals(q1)) return {geometry: {p1: p1, p2: q2}};
        if (p2.equals(q2)) return {geometry: {p1: p1, p2: q1}};
        if (p1.equals(q1)) return {geometry: {p1: p2, p2: q2}};
        if (p1.equals(q2)) return {geometry: {p1: p2, p2: q1}};
    }

    const overlap = overlapLines(p1, p2, q1, q2);
    console.log(overlap);
    if (overlap.applies) {
        console.log('%cOVERLAP', 'color: lime');
        return overlap.geometry;
    }

    if (LOG) console.error('Unhandled intersect type');
    return [];
};


export const countUniquePoints = function(array) {
    if (array.length === 0) return 0;
    const filtered = array
        .slice(1)
        .filter(point => !array[0].equals(point));
    return 1 + countUniquePoints(filtered);
};


export const getUniquePoints = function(array) {
    if (array.length === 0) return [];
    const filtered = array
        .slice(1)
        .filter(point => !array[0].equals(point));
    return [array[0]].concat(getUniquePoints(filtered));
};


export const isAsc = function(array) {
    let max = -Infinity;
    for (let n of array) {
        if (n < max) return false;
        max = n;
    }
    return true;
};


export const sortPoints = function(points) {
    return points.slice().sort((p1, p2) => {
        if (p1.x === p2.x) {
            return p1.y - p2.y;
        }
        return p1.x - p2.x;
    })
};