import {intersectCircleCircle, intersectLineLine,} from './intersections';
import Point from './Point';
import {
    AUX_LINE_CLASS_NAME,
    AXIS_LINE_CLASS_NAME,
    BOTTOM_EDGE,
    CANVAS_PADDING_LEFT,
    CANVAS_PADDING_TOP,
    COINCIDENT_LINE_THRESHOLD,
    DUPLICATE_LINE_THRESHOLD,
    GRID_HEIGHT,
    GRID_WIDTH,
    LEFT_EDGE,
    LIMITED_USER_LINE_CLASSES,
    LIMITED_USER_NODE_CLASSES,
    NODE_STATE_COLLECTION,
    PATH_STATE_COLLECTION,
    RESOLUTION,
    RIGHT_EDGE,
    SOLVED_LINE_CLASS_NAME,
    TASK_LINE_CLASS_NAME,
    TOP_EDGE,
    USER_LINE_CLASS_NAME,
} from './constants';
import {deleteFromSet, isAsc, isEmptyObject} from './utils';
import {getConfigValue} from './assignment';

export function calculateDistance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export function getNearestNode(point, nodes) {
    return nodes
        .map(node => {
            const distance = calculateDistance(point, node.geometry.p1);
            return {point: new Point(node.geometry.p1.x, node.geometry.p1.y), distance: distance, node: node};
        })
        .reduce((accumulator, node) => (
            accumulator.distance > node.distance ? node : accumulator
        ), {
            point: new Point(Infinity, Infinity),
            distance: Infinity,
            node: {}
        });
}

export function getNearestLine(point, lines) {
    return lines
        .map(line => {
            const r1 = calculateDistance(point, line.geometry.p1);
            const r2 = calculateDistance(point, line.geometry.p2);
            const intersections = intersectCircleCircle(line.geometry.p1, r1, line.geometry.p2, r2);
            const distance = calculateDistance(intersections[0], intersections[1]);
            return {geometry: line.geometry, distance: distance, line: line}
        })
        .reduce((acc, line) => (
            acc.distance > line.distance ? line : acc
        ), {
            geometry: {p1: new Point(Infinity, Infinity), p2: new Point(Infinity, Infinity)},
            distance: Infinity,
            node: {}
        });
}

export function pointAtXByLine(p1, p2, x) {
    const y = p1.y + (x - p1.x) * ((p2.y - p1.y) / (p2.x - p1.x));
    return {x: x, y: y}
}

export function extendLineCoordinates(p1, p2) {
    const edgeP1 = pointAtXByLine(p1, p2, LEFT_EDGE);
    const edgeP2 = pointAtXByLine(p1, p2, RIGHT_EDGE);

    // corrections for edge cases of the points

    const infCorrP1 = edgeP1.y === Infinity || edgeP1.y === -Infinity || isNaN(edgeP1.y)
        ? {x: p1.x, y: BOTTOM_EDGE}
        : edgeP1;
    const infCorrP2 = edgeP2.y === Infinity || edgeP2.y === -Infinity || isNaN(edgeP2.y)
        ? {x: p2.x, y: TOP_EDGE}
        : edgeP2;

    const topCorrP1 = infCorrP1.y < TOP_EDGE
        ? intersectLineLine(infCorrP1, infCorrP2, {x: LEFT_EDGE, y: TOP_EDGE}, {x: RIGHT_EDGE, y: TOP_EDGE}).intersections[0]
        : infCorrP1;
    const bottomCorrP1 = topCorrP1.y > BOTTOM_EDGE
        ? intersectLineLine(infCorrP1, infCorrP2, {x: LEFT_EDGE, y: BOTTOM_EDGE}, {x: RIGHT_EDGE, y: BOTTOM_EDGE}).intersections[0]
        : topCorrP1;

    const topCorrP2 = infCorrP2.y < TOP_EDGE
        ? intersectLineLine(infCorrP1, infCorrP2, {x: LEFT_EDGE, y: TOP_EDGE}, {x: RIGHT_EDGE, y: TOP_EDGE}).intersections[0]
        : infCorrP2;
    const bottomCorrP2 = infCorrP2.y > BOTTOM_EDGE
        ? intersectLineLine(infCorrP1, infCorrP2, {x: LEFT_EDGE, y: BOTTOM_EDGE}, {x: RIGHT_EDGE, y: BOTTOM_EDGE}).intersections[0]
        : topCorrP2;

    return {p1: new Point(bottomCorrP1.x, bottomCorrP1.y), p2: new Point(bottomCorrP2.x, bottomCorrP2.y)};
}

export function toCanvasXCoord(value) {
    return value * RESOLUTION + CANVAS_PADDING_LEFT;
}

export function toCanvasYCoord(value) {
    return value * RESOLUTION + CANVAS_PADDING_TOP;
}

export function fromCanvasXCoord(value) {
    return (value - CANVAS_PADDING_LEFT) / RESOLUTION;
}

export function fromCanvasYCoord(value) {
    return (value - CANVAS_PADDING_TOP) / RESOLUTION;
}

export function generateGridLines(classes) {
    const xGrid = Array.from(Array(GRID_WIDTH + 1), (value, xLine) => {
        return composeStateObject((xLine + 1) * 2 - 1, classes, {
            p1: new Point(toCanvasXCoord(xLine), TOP_EDGE),
            p2: new Point(toCanvasXCoord(xLine), BOTTOM_EDGE),
        }, 1);
    });
    const yGrid = Array.from(Array(GRID_WIDTH + 1), (value, yLine) => {
        return composeStateObject((yLine + 1) * 2, classes, {
            p1: new Point(LEFT_EDGE, toCanvasYCoord(yLine)),
            p2: new Point(RIGHT_EDGE, toCanvasYCoord(yLine)),
        }, 1);
    });
    return xGrid.concat(yGrid);
}

export function generateGridNodes(classes) {
    const idMagnitude = Math.ceil(Math.log(GRID_WIDTH + 1) * Math.LOG10E);
    return Array.from(Array(GRID_WIDTH + 1), (value, xLine) => {
        return Array.from(Array(GRID_HEIGHT + 1), (value, yLine) => {
            return composeStateObject(xLine * (10 ** idMagnitude) + yLine, classes, {p1: new Point(toCanvasXCoord(xLine), toCanvasYCoord(yLine))}, 1);
        })
    }).reduce((acc, nodeRow) => {
        return acc.concat(nodeRow)
    }, []);
}

export function updateElemForState(container, elemId, classes, updatedAt, label = {}) {
    const { add = [], remove = [], toggle = [] } = classes;
    return container.map(elem => {
        if (elem.id === elemId) {
            const updatedClasses = new Set(elem.classes);
            add.map(className => updatedClasses.add(className));
            remove.map(className => updatedClasses.delete(className));
            toggle.map(className => elem.classes.has(className) ? updatedClasses.delete(className) : updatedClasses.add(className));
            return !isEmptyObject(label)
                ? Object.assign({}, elem, {classes: updatedClasses, updatedAt: updatedAt, label: label})
                : Object.assign({}, elem, {classes: updatedClasses, updatedAt: updatedAt});
        }
        return elem;
    });
}

export function composeStateObject(id, classes, geometry, updatedAt, label = {}) {
    return {
        id: id, classes: classes, geometry: geometry, updatedAt: updatedAt, label: label
    }
}

export function createStateId(stateType, stateSnapshot) {
    const lastId = stateSnapshot[stateType].reduce((acc, cur) => {
        return acc < cur.id ? cur.id : acc;
    }, -Infinity);
    return lastId === -Infinity ? 1 : lastId + 1;
}

export function findLine(point1, point2, stateCollection, tolerance = DUPLICATE_LINE_THRESHOLD) {
    return stateCollection.filter(path => isSameLine(path.geometry.p1, path.geometry.p2, point1, point2, tolerance))
}

export function isSameLine(p1, p2, q1, q2, tolerance = DUPLICATE_LINE_THRESHOLD) {
    const distance1 = Math.min(
        calculateDistance(p1, q1),
        calculateDistance(p1, q2)
    );
    const distance2 = Math.min(
        calculateDistance(p2, q1),
        calculateDistance(p2, q2)
    );
    return distance1 <= tolerance && distance2 <= tolerance;
}

export const isCoincident = function (a1, a2, b1, b2, tolerance = COINCIDENT_LINE_THRESHOLD) {
    let ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    let ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    let u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

    return Math.abs(u_b) <= tolerance && (Math.abs(ua_t) <= tolerance || Math.abs(ub_t) <= tolerance);
};

export const subsegmentLines = function (p1, p2, q1, q2, symmetric = true) {
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

export const overlapLines = function (p1, p2, q1, q2) {
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

export const isConnected = function (p1, p2, q1, q2) {
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

export const combineOverlappingLines = function (p1, p2, q1, q2) {
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

export const getUniquePoints = function (array) {
    if (array.length === 0) return [];
    const filtered = array
        .slice(1)
        .filter(point => !array[0].equals(point));
    return [array[0]].concat(getUniquePoints(filtered));
};

export const sortPoints = function (points) {
    return points.slice().sort((p1, p2) => {
        if (p1.x === p2.x) {
            return p1.y - p2.y;
        }
        return p1.x - p2.x;
    })
};

export function splitOrCombineLinesWithLine(p1, p2, collection, classes) {
    // early return to prevent checking for supplementary geometry such as solution highlights
    if (
        typeof classes.add === 'undefined'
        || classes.add.includes(SOLVED_LINE_CLASS_NAME)
        || !classes.add.includes(USER_LINE_CLASS_NAME)
    ) return [];

    let auxLines = [];

    collection
        .filter(line => (
            line.classes.has(USER_LINE_CLASS_NAME)
            || line.classes.has(TASK_LINE_CLASS_NAME)
            || line.classes.has(AUX_LINE_CLASS_NAME)
        ))
        .filter(line => !isSameLine(line.geometry.p1, line.geometry.p2, p1, p2))
        .forEach(line => {
            const {p1: q1, p2: q2} = line.geometry;

            const newLines = combineOverlappingLines(p1, p2, q1, q2);
            if (newLines.length !== 0) auxLines = auxLines.concat(newLines);
        });

    return auxLines;
}


export function countGeometry(collection, classNames) {
    return collection.filter(elem =>
        Array.from(classNames).filter(className => elem.classes.has(className)).length !== 0
    ).length;
}

export function isGeometryMaxed(stateSnaphot) {
    const {config = {}} = stateSnaphot;
    const {maxUserNodes, maxUserLines} = config;

    if (typeof maxUserNodes === 'undefined' && typeof maxUserLines === 'undefined') return {
        isMaxed: false,
        diff: undefined,
    };

    // counting lines first, typically expecting fewer lines then nodes; then early return
    const acceptableLineClasses = getConfigValue('uiEvalSegmentsAsLines', stateSnaphot)
        ? deleteFromSet(LIMITED_USER_LINE_CLASSES, USER_LINE_CLASS_NAME).add(AXIS_LINE_CLASS_NAME)
        : LIMITED_USER_LINE_CLASSES;
    const linesCount = countGeometry(
        stateSnaphot[PATH_STATE_COLLECTION],
        acceptableLineClasses,
    );

    if (typeof maxUserLines !== 'undefined' && linesCount >= maxUserLines) return {
        isMaxed: true,
        diff: linesCount - maxUserLines,
    };

    const nodesCount = countGeometry(
        stateSnaphot[NODE_STATE_COLLECTION],
        LIMITED_USER_NODE_CLASSES,
    );

    return {
        isMaxed: typeof maxUserNodes !== 'undefined' && nodesCount >= maxUserNodes,
        diff: nodesCount - maxUserNodes,
    };
}