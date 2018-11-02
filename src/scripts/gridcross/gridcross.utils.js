import SVG from 'svg.js';
import svgDraggableInit from './svg.draggable';

import {
    BOTTOM_EDGE,
    LEFT_EDGE,
    PAPER_PADDING,
    RIGHT_EDGE,
    SNAP_THRESHOLD, TOP_EDGE
} from "./gridcross.constants";
import { intersectLineLine } from "./intersections";

svgDraggableInit(SVG);

export function svgLineToPoints(line) {
    const attr = line.attr();
    return [
        {x: attr.x1, y: attr.y1},
        {x: attr.x2, y: attr.y2},
    ]
}

export function roundPoint(point) {
    const {x, y} = point;
    return {
        x: Math.round(x),
        y: Math.round(y),
    };
}

export function bootstrap() {
    const root = document.getElementById('gridcross');
    const canvasWrapper = document.createElement('div');
    canvasWrapper.id = 'canvas-wrapper';
    canvasWrapper.style.width = RIGHT_EDGE + PAPER_PADDING;
    root.appendChild(canvasWrapper);

    const canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvas.id = 'canvas';
    canvas.setAttribute('version', '1.1');
    canvasWrapper.appendChild(canvas);

    return SVG('canvas').size(RIGHT_EDGE + PAPER_PADDING, BOTTOM_EDGE + PAPER_PADDING);
}

export function calculateDistance(point1, point2) {
    return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
}

export function getNearestNode(x, y, nodes) {
    const nodeDistances = nodes.map(node => {
        const attr = node.attr();
        const distance = calculateDistance({x: x, y: y}, {x: attr.cx, y: attr.cy});
        return {x: attr.cx, y: attr.cy, distance: distance, node: node};
    });

    return nodeDistances.reduce((accumulator, node) => (
        accumulator.distance > node.distance ? node : accumulator
    ), {x: Infinity, y: Infinity, distance: Infinity, node: {}});
}


export function draggableSnap(x, y, nodes) {
    const nearestNode = getNearestNode(x, y, nodes);
    return nearestNode.distance <= SNAP_THRESHOLD
        ? {x: nearestNode.x, y: nearestNode.y, snapped: true, node: nearestNode.node}
        : {x: x, y: y, snapped: false, node: {}}
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
        ? intersectLineLine(infCorrPoint1, infCorrPoint2, {x: LEFT_EDGE, y: TOP_EDGE}, {x: RIGHT_EDGE, y: TOP_EDGE})
            .intersections[0]
        : infCorrPoint1;
    const bottomCorrPoint1 = topCorrPoint1.y > BOTTOM_EDGE
        ? intersectLineLine(infCorrPoint1, infCorrPoint2, {x: LEFT_EDGE, y: BOTTOM_EDGE}, {x: RIGHT_EDGE, y: BOTTOM_EDGE})
            .intersections[0]
        : topCorrPoint1;

    const topCorrPoint2 = infCorrPoint2.y < TOP_EDGE
        ? intersectLineLine(infCorrPoint1, infCorrPoint2, {x: LEFT_EDGE, y: TOP_EDGE}, {x: RIGHT_EDGE, y: TOP_EDGE})
            .intersections[0]
        : infCorrPoint2;
    const bottomCorrPoint2 = infCorrPoint2.y > BOTTOM_EDGE
        ? intersectLineLine(infCorrPoint1, infCorrPoint2, {x: LEFT_EDGE, y: BOTTOM_EDGE}, {x: RIGHT_EDGE, y: BOTTOM_EDGE})
            .intersections[0]
        : topCorrPoint2;

    return [bottomCorrPoint1, bottomCorrPoint2];
}