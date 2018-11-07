import { intersectLineLine } from './intersections';
import Point from './Point';
import {
    GRID_WIDTH, GRID_HEIGHT, CANVAS_PADDING, RESOLUTION,
    TOP_EDGE, RIGHT_EDGE, BOTTOM_EDGE, LEFT_EDGE,
    LINE, NODE, NODE_GROUP, PATH_GROUP, WORK_GROUP,
    SNAP_THRESHOLD, NODE_RADIUS, DUPLICATE_LINE_THRESHOLD,
    NODE_STATE_COLLECTION, PATH_STATE_COLLECTION,
    NODE_CLASS_NAME, TASK_NODE_CLASS_NAME, TASK_LINE_CLASS_NAME, BACK_GROUP, USER_NODE_CLASS_NAME,
} from './constants';
import { attachDraggable, attachTouchSurfaceDraggable } from './draggable';
import { composeNewStateForLine, composeNewStateForNode } from './gridcross.exercise';


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


export function extendLineCoordinates(point1, point2) {
    const edgePoint1 = pointAtXByLine(point1, point2, LEFT_EDGE);
    const edgePoint2 = pointAtXByLine(point1, point2, RIGHT_EDGE);

    // corrections for edge cases of the points

    const infCorrPoint1 = edgePoint1.y === Infinity || edgePoint1.y === -Infinity
        ? {x: point1.x, y: BOTTOM_EDGE}
        : edgePoint1;
    const infCorrPoint2 = edgePoint2.y === Infinity || edgePoint2.y === -Infinity
        ? {x: point2.x, y: TOP_EDGE}
        : edgePoint2;

    const topCorrPoint1 = infCorrPoint1.y < TOP_EDGE
        ? intersectLineLine(infCorrPoint1, infCorrPoint2, {x: LEFT_EDGE, y: TOP_EDGE}, {x: RIGHT_EDGE, y: TOP_EDGE}).intersections[0]
        : infCorrPoint1;
    const bottomCorrPoint1 = topCorrPoint1.y > BOTTOM_EDGE
        ? intersectLineLine(infCorrPoint1, infCorrPoint2, {x: LEFT_EDGE, y: BOTTOM_EDGE}, {x: RIGHT_EDGE, y: BOTTOM_EDGE}).intersections[0]
        : topCorrPoint1;

    const topCorrPoint2 = infCorrPoint2.y < TOP_EDGE
        ? intersectLineLine(infCorrPoint1, infCorrPoint2, {x: LEFT_EDGE, y: TOP_EDGE}, {x: RIGHT_EDGE, y: TOP_EDGE}).intersections[0]
        : infCorrPoint2;
    const bottomCorrPoint2 = infCorrPoint2.y > BOTTOM_EDGE
        ? intersectLineLine(infCorrPoint1, infCorrPoint2, {x: LEFT_EDGE, y: BOTTOM_EDGE}, {x: RIGHT_EDGE, y: BOTTOM_EDGE}).intersections[0]
        : topCorrPoint2;

    return {p1: bottomCorrPoint1, p2: bottomCorrPoint2};
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


export function render(state, groups) {
    console.time('render');
    console.log('render:', Object.assign({}, state.get(), {}));

    Object.keys(groups).forEach(key => {
        groups[key].clear();
    });

    const currentState = state.get();
    Object.keys(currentState).map(elemGroup => {
        currentState[elemGroup].map(elem => {
            if (elem.type === NODE) {
                const node = groups[NODE_GROUP].circle(NODE_RADIUS * 2)
                    .move(elem.geometry.p1.x - NODE_RADIUS, elem.geometry.p1.y - NODE_RADIUS);
                elem.classes.forEach(className => {node.addClass(className)});
                attachDraggable(node, groups[WORK_GROUP], currentState.nodes);
            }
            if (elem.type === LINE) {
                const line = groups[PATH_GROUP].line(elem.geometry.p1.x, elem.geometry.p1.y, elem.geometry.p2.x, elem.geometry.p2.y);
                elem.classes.forEach(className => {line.addClass(className)});
            }
        })
    });

    const touchSurface = groups[BACK_GROUP].rect(
        GRID_WIDTH * RESOLUTION + CANVAS_PADDING * 2,
        GRID_HEIGHT * RESOLUTION + CANVAS_PADDING * 2
    ).addClass('touchsurface');
    attachTouchSurfaceDraggable(touchSurface, groups[WORK_GROUP], currentState.nodes);

    console.timeEnd('render');
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


export function findLine(point1, point2, stateCollection) {
    return stateCollection.filter(path => {
        const distance1 = Math.min(
            calculateDistance(path.geometry.p1, point1),
            calculateDistance(path.geometry.p1, point2)
        );
        const distance2 = Math.min(
            calculateDistance(path.geometry.p2, point1),
            calculateDistance(path.geometry.p2, point2)
        );
        return distance1 < DUPLICATE_LINE_THRESHOLD && distance2 < DUPLICATE_LINE_THRESHOLD;
    })
}


export function parseAssignment(json, stateSnapshot) {
    console.log('Data received:', json);

    const workingState = [stateSnapshot];

    if (typeof json.problem.points !== 'undefined') {
        json.problem.points.forEach(point => {
            workingState.push(
                composeNewStateForNode(
                    new Point(
                        toCanvasCoord(point[0]),
                        toCanvasCoord(point[1])
                    ),
                    TASK_NODE_CLASS_NAME,
                    workingState[workingState.length - 1]
                )
            );
        });
    }

    if (typeof json.problem.segments !== 'undefined') {
        json.problem.segments.forEach(line => {
            const p1 = new Point(
                toCanvasCoord(line[0][0]),
                toCanvasCoord(line[0][1])
            );
            const p2 = new Point(
                toCanvasCoord(line[1][0]),
                toCanvasCoord(line[1][1])
            );

            workingState.push(
                composeNewStateForLine(
                    p1, p2,
                    TASK_LINE_CLASS_NAME,
                    workingState[workingState.length - 1]
                )
            );
            workingState.push(
                composeNewStateForNode(p1,
                    TASK_NODE_CLASS_NAME,
                    workingState[workingState.length - 1],
                    NODE_STATE_COLLECTION
                )
            );
            workingState.push(
                composeNewStateForNode(p2,
                    TASK_NODE_CLASS_NAME,
                    workingState[workingState.length - 1],
                    NODE_STATE_COLLECTION
                )
            );
        });
    }

    if (typeof json.problem.lines !== 'undefined') {
        json.problem.lines.forEach(line => {
            const p1 = new Point(
                toCanvasCoord(line[0][0]),
                toCanvasCoord(line[0][1])
            );
            const p2 = new Point(
                toCanvasCoord(line[1][0]),
                toCanvasCoord(line[1][1])
            );

            workingState.push(
                composeNewStateForLine(
                    p1, p2,
                    TASK_LINE_CLASS_NAME,
                    workingState[workingState.length - 1]
                )
            );
        });
    }

    return workingState[workingState.length - 1];
}