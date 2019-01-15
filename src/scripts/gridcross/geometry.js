import {intersectCircleCircle, intersectLineLine,} from './intersections';
import Point from './Point';
import {
    AUX_LINE_CLASS,
    AXIS_LINE_CLASS,
    BOTTOM_EDGE,
    CANVAS_PADDING_LEFT,
    CANVAS_PADDING_TOP,
    COINCIDENT_LINE_TOLERANCE,
    DUPLICATE_LINE_TOLERANCE,
    GEOMETRY_PRECISION_TOLERANCE,
    GRID_HEIGHT,
    GRID_WIDTH,
    LEFT_EDGE,
    LIMITED_USER_LINE_CLASSES,
    LIMITED_USER_NODE_CLASSES,
    NODE_STATE_COLLECTION,
    PATH_STATE_COLLECTION,
    RESOLUTION,
    RIGHT_EDGE,
    TASK_LINE_CLASS,
    TASK_NODE_CLASS,
    TOP_EDGE,
    USER_LINE_CLASS,
    USER_NODE_CLASS,
} from './constants';
import {deleteFromSet, isAsc, isEmptyObject, setIncludes} from './utils';
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

export function findLine(point1, point2, stateCollection, tolerance = DUPLICATE_LINE_TOLERANCE) {
    return stateCollection.filter(path => isSameLine(path.geometry.p1, path.geometry.p2, point1, point2, tolerance))
}

export function isSameLine(p1, p2, q1, q2, tolerance = DUPLICATE_LINE_TOLERANCE) {
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

export function isCoincident(a1, a2, b1, b2, tolerance = COINCIDENT_LINE_TOLERANCE) {
    let ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    let ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    let u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

    return Math.abs(u_b) <= tolerance && (Math.abs(ua_t) <= tolerance || Math.abs(ub_t) <= tolerance);
}

export function isSubsegment(p1, p2, q1, q2, symmetric = true) {
    if (!isCoincident(p1, p2, q1, q2)) return false;

    const p = sortPoints([p1, p2]);
    const q = sortPoints([q1, q2]);

    const swap = symmetric && calculateDistance(p[0], p[1]) < calculateDistance(q[0], q[1]);
    const a = swap ? q : p;
    const b = swap ? p : q;

    const xs = [a[0].x, b[0].x, b[1].x, a[1].x];
    const ys = [a[0].y, b[0].y, b[1].y, a[1].y];

    return isAsc(xs) && (isAsc(ys) || isAsc(ys.slice().reverse()))
}

export function getUniquePoints(array) {
    if (array.length === 0) return [];
    const filtered = array
        .slice(1)
        .filter(point => !array[0].equals(point));
    return [array[0]].concat(getUniquePoints(filtered));
}

export function getRepeatedPoints(array) {
    if (array.length === 0) return [];

    const repeated = array.filter(p1 => array.filter(p2 => p1.equals(p2)).length >= 2);
    return getUniquePoints(repeated);
}

export function sortPoints (points) {
    return points.slice().sort((p1, p2) => {
        if (p1.x === p2.x) {
            return p1.y - p2.y;
        }
        return p1.x - p2.x;
    })
}

export function findLinesByPoint(p, collection) {
    return collection.filter(line => isLineOnPoint(p, line.geometry.p1, line.geometry.p2));
}

export function isLineOnPoint(p, q1, q2) {
    const pq1Dist = calculateDistance(p, q1);
    const pq2Dist = calculateDistance(p, q2);
    const qDist = calculateDistance(q1, q2);

    return Math.abs(pq1Dist + pq2Dist - qDist) <= GEOMETRY_PRECISION_TOLERANCE
}

export function splitLineByPoint(p, line) {
    const splitLines = [];

    const lineLength = calculateDistance(line.geometry.p1, line.geometry.p2);
    const p1Dist = calculateDistance(p, line.geometry.p1);
    const p2Dist = calculateDistance(p, line.geometry.p2);

    if (p1Dist >= GEOMETRY_PRECISION_TOLERANCE && Math.abs(p1Dist - lineLength) >= GEOMETRY_PRECISION_TOLERANCE) {
        splitLines.push({
            geometry: {p1: line.geometry.p1, p2: p}
        })
    }
    if (p2Dist >= GEOMETRY_PRECISION_TOLERANCE && Math.abs(p2Dist - lineLength) >= GEOMETRY_PRECISION_TOLERANCE) {
        splitLines.push({
            geometry: {p1: p, p2: line.geometry.p2}
        })
    }

    return splitLines;
}

export function connectLines(p1, p2, q1, q2) {
    if (!isCoincident(p1, p2, q1, q2)) return {};

    const points = [p1, p2, q1, q2];
    const pivot = getRepeatedPoints(points);
    if (pivot.length === 1) {
        const satellites = points.filter(point => !point.equals(pivot[0]));

        console.log('CONNECTED!', pivot, satellites);

        return {geometry: {p1: satellites[0], p2: satellites[1]}};
    }
    return {};
}

export function connectLinesInCollection(p1, p2, lines) {
    return lines.reduce((acc, line) => {
        const connected = connectLines(p1, p2, line.geometry.p1, line.geometry.p2);
        if (!isEmptyObject(connected)) {
            return acc.concat(connected)
        }
        return acc;
    }, []);
}

export function constructAuxLinesForPoint(point, collection) {
    const eligibleLines = collection.filter(line => (
        setIncludes(line.classes, [USER_LINE_CLASS, TASK_LINE_CLASS, AUX_LINE_CLASS]))
    );

    const lines = findLinesByPoint(point, eligibleLines);

    return lines.reduce((acc, line) => {
        const splitLines = splitLineByPoint(point, line);
        return acc.concat(splitLines);
    }, []);
}

export function constructAuxLinesForLine(p1, p2, collections) {
    const {paths, nodes} = collections;

    const eligibleLines = paths.filter(line => (
        setIncludes(line.classes, [USER_LINE_CLASS, TASK_LINE_CLASS, AUX_LINE_CLASS]))
    );

    const connectedCollection = connectLinesInCollection(p1, p2, eligibleLines);

    const linesSplitByPoints = nodes
        .filter(point => setIncludes(point.classes, [TASK_NODE_CLASS, USER_NODE_CLASS]))
        .reduce((acc, point) => {
            const auxLines = constructAuxLinesForPoint(point.geometry.p1, paths);
            if (auxLines.length !== 0) return acc.concat(auxLines);
            return acc
        }, []);

    return connectedCollection.concat(linesSplitByPoints);
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
        ? deleteFromSet(LIMITED_USER_LINE_CLASSES, USER_LINE_CLASS).add(AXIS_LINE_CLASS)
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