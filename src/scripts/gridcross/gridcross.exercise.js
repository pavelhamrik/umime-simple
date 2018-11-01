import SVG from 'svg.js';

import { intersectLineLine } from './intersections';
import { lineToPoints, bootstrap, draggableSnap } from './utils';

import {
    GRID_HEIGHT,
    RESOLUTION,
    GRID_WIDTH,
    TOP_EDGE,
    BOTTOM_EDGE,
    LEFT_EDGE,
    RIGHT_EDGE,
    PAPER_PADDING,
    NODE_RADIUS,
} from './gridcross.constants';


// bootstrapping

const canvas = bootstrap();


// drawing the grid

const xGrid = Array.from(Array(GRID_WIDTH + 1), (value, xGridline) => {
    return canvas.line(xGridline * RESOLUTION + PAPER_PADDING, TOP_EDGE, xGridline * RESOLUTION + PAPER_PADDING, BOTTOM_EDGE)
        .addClass('gridline');
});

const yGrid = Array.from(Array(GRID_HEIGHT + 1), (value, yGridline) => {
    return canvas.line(LEFT_EDGE, yGridline * RESOLUTION + PAPER_PADDING, RIGHT_EDGE, yGridline * RESOLUTION + PAPER_PADDING)
        .addClass('gridline');
});

let paths = xGrid.concat(yGrid);

let nodes = xGrid.map(xLine => {
    return yGrid.map(yLine => {
        const xLinePoints = lineToPoints(xLine);
        const yLinePoints = lineToPoints(yLine);
        return intersectLineLine(xLinePoints[0], xLinePoints[1], yLinePoints[0], yLinePoints[1],).intersections
            .map(intersection => (
                canvas.circle(NODE_RADIUS * 2)
                    .move(intersection.x - NODE_RADIUS, intersection.y - NODE_RADIUS)
                    .addClass('node')
                    .addClass('gridnode')
            ));
    }).flat();
}).flat();


// dragging

let dragIndicator = {};

nodes.map(node => {
    node.draggable();

    node.on('dragstart', function (event) {
        const originNode = SVG.get(event.detail.handler.el.node.id);
        const origin = originNode.attr();
        originNode.addClass('usernode')
        dragIndicator = canvas.line(origin.cx, origin.cy, origin.cx, origin.cy).addClass('indicator');
    });

    node.on('dragmove', function (event) {
        event.preventDefault();

        const snapTo = draggableSnap(event.detail.p.x, event.detail.p.y, nodes);
        dragIndicator
            .attr('x2', snapTo.x)
            .attr('y2', snapTo.y);
        if (snapTo.snapped) {
            dragIndicator.addClass('snapped');
            snapTo.node.addClass('snapped');
        }
        else {
            dragIndicator.removeClass('snapped');
        }
    });

    node.on('dragend', function (event) {
        const originNode = SVG.get(event.detail.handler.el.node.id);
        const origin = originNode.attr();
        const snapTo = draggableSnap(event.detail.p.x, event.detail.p.y, nodes);

        dragIndicator.remove();
        dragIndicator = {};

        if (snapTo.snapped) {
            originNode.addClass('usernode');
            snapTo.node.addClass('usernode');
            const newUserLine = canvas.line(origin.cx, origin.cy, snapTo.x, snapTo.y).addClass('userline');
        }
        else {
            originNode.removeClass('usernode');
        }
    });

    // node.mousemove(() => node.attr('r', NODE_HOVER_RADIUS));
    // node.mouseout(() => node.attr('r', NODE_RADIUS));

    return null;
});

