import { intersectLineLine } from './intersections';
import Point from './Point';
import {
    GRID_WIDTH,
    GRID_HEIGHT,
    CANVAS_PADDING,
    RESOLUTION,
    TOP_EDGE,
    RIGHT_EDGE,
    BOTTOM_EDGE,
    LEFT_EDGE,
    LINE,
    NODE,
    SNAP_THRESHOLD,
    DUPLICATE_LINE_THRESHOLD,
} from './constants';


export function calculateDistance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}


export function getNearestNode(point, nodes) {
    return nodes.map(node => {
        const distance = calculateDistance(point, node.geometry.p1);
        return {point: new Point(node.geometry.p1.x, node.geometry.p1.y), distance: distance, node: node};
    }).reduce((accumulator, node) => (
        accumulator.distance > node.distance ? node : accumulator
    ), {point: new Point(Infinity, Infinity), distance: Infinity, node: {}});
}


export function draggableSnap(point, nodes) {
    const nearest = getNearestNode(point, nodes);
    return nearest.distance <= SNAP_THRESHOLD
        ? {point: nearest.point, snapped: true, node: nearest.node}
        : {point: point, snapped: false, node: {}}
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

    return {p1: bottomCorrP1, p2: bottomCorrP2};
}


export function toCanvasCoord(value) {
    return value * RESOLUTION + CANVAS_PADDING
}


export function generateGridLines(classes, stateType, svgGroup) {
    const xGrid = Array.from(Array(GRID_WIDTH + 1), (value, xLine) => {
        return {
            type: LINE, classes: classes, stateType: stateType, svgGroup: svgGroup,
            id: (xLine + 1) * 2 - 1,
            geometry: {
                p1: new Point(toCanvasCoord(xLine), TOP_EDGE),
                p2: new Point(toCanvasCoord(xLine), BOTTOM_EDGE),
            }
        };
    });
    const yGrid = Array.from(Array(GRID_WIDTH + 1), (value, yLine) => {
        return {
            type: LINE, classes: classes, stateType: stateType, svgGroup: svgGroup,
            id: (yLine + 1) * 2,
            geometry: {
                p1: new Point(LEFT_EDGE, toCanvasCoord(yLine)),
                p2: new Point(RIGHT_EDGE, toCanvasCoord(yLine)),
            }
        };
    });
    return xGrid.concat(yGrid);
}


export function generateGridNodes(classes, stateType, svgGroup) {
    const idMagnitude = Math.ceil(Math.log(GRID_WIDTH + 1) * Math.LOG10E);
    return Array.from(Array(GRID_WIDTH + 1), (value, xLine) => {
        return Array.from(Array(GRID_HEIGHT + 1), (value, yLine) => {
            return {
                type: NODE, classes: classes, stateType: stateType, svgGroup: svgGroup,
                id: xLine * (10 ** idMagnitude) + yLine,
                geometry: {p1: new Point(toCanvasCoord(xLine), toCanvasCoord(yLine))}
            }
        })
    }).reduce((acc, nodeRow) => {
        return acc.concat(nodeRow)
    }, []);
}


export function addElemClassInObject(container, elemId, className) {
    return container.map(elem => {
        if (elem.id === elemId) {
            const classes = new Set(elem.classes).add(className);
            // console.log(classes);
            return Object.assign({}, elem, {classes: classes});
        }
        return elem;
    });
}


export function composeStateObject(id, type, classes, stateType, svgGroup, geometry) {
    return {
        type: type, classes: classes, stateType: stateType, svgGroup: svgGroup, id: id, geometry: geometry
    }
}


export function createStateId(stateType, stateSnapshot) {
    const lastId = stateSnapshot[stateType].reduce((acc, cur) => {
        return acc < cur.id ? cur.id : acc;
    }, -Infinity);
    return lastId === -Infinity ? 1 : lastId + 1;
}


export function findLine(point1, point2, stateCollection, exact = false) {
    const tolerance = exact ? 0 : DUPLICATE_LINE_THRESHOLD;
    return stateCollection.filter(path => {
        const distance1 = Math.min(
            calculateDistance(path.geometry.p1, point1),
            calculateDistance(path.geometry.p1, point2)
        );
        const distance2 = Math.min(
            calculateDistance(path.geometry.p2, point1),
            calculateDistance(path.geometry.p2, point2)
        );
        return distance1 <= tolerance && distance2 <= tolerance;
    })
}


export function isEmptyObject(object) {
    return Object.keys(object).length === 0 && object.constructor === Object;
}