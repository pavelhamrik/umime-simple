import SVG from 'svg.js';
import svgDraggableInit from './svg.draggable';

import { BOTTOM_EDGE, PAPER_PADDING, RIGHT_EDGE, SNAP_THRESHOLD } from "./gridcross.constants";

svgDraggableInit(SVG);

export function lineToPoints(line) {
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

export function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export function draggableSnap(x, y, nodes) {
    const nodeDistances = nodes.map(node => {
        const attr = node.attr();
        const distance = calculateDistance(x, y, attr.cx, attr.cy);
        return {x: attr.cx, y: attr.cy, distance: distance, node: node};
    });

    const nearestNode = nodeDistances.reduce((accumulator, node) => (
        accumulator.distance > node.distance ? node : accumulator
    ), {x: Infinity, y: Infinity, distance: Infinity, node: {}});

    return nearestNode.distance <= SNAP_THRESHOLD
        ? {x: nearestNode.x, y: nearestNode.y, snapped: true, node: nearestNode.node}
        : {x: x, y: y, snapped: false, node: {}}
}