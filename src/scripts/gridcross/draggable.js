import SVG from 'svg.js';

import Point from "./Point";
import { handleNewPath } from './gridcross.exercise';
import { draggableSnap, getNearestNode } from './functions';
import { BOTTOM_EDGE, CANVAS_PADDING, LINE, NODE_RADIUS, RIGHT_EDGE } from "./constants";

const tool = {};

export function attachDraggable(node, layer, nodes) {
    node.draggable();

    node.on('dragstart', function (event) {
        const origin = SVG.get(event.detail.handler.el.node.id).attr();
        handleDragStart(event, new Point(origin.cx, origin.cy), layer);
    });

    node.on('dragmove', function (event) {
        handleDragMove(event, nodes);
    });

    node.on('dragend', function (event) {
        const origin = SVG.get(event.detail.handler.el.node.id).attr();
        handleDragEnd(event, new Point(origin.cx, origin.cy), nodes);
    });

    return node;
}


export function attachTouchSurfaceDraggable(surface, layer, nodes) {
    surface.draggable();

    surface.on('dragstart', function (event) {
        const nearestNode = getNearestNode(new Point(event.detail.p.x, event.detail.p.y - window.pageYOffset), nodes);
        handleDragStart(event, nearestNode.point, layer);
    });

    surface.on('dragmove', function (event) {
        handleDragMove(event, nodes);
    });

    surface.on('dragend', function (event) {
        const nearestNode = getNearestNode(
            new Point(event.detail.handler.startPoints.point.x, event.detail.handler.startPoints.point.y - window.pageYOffset),
            nodes
        );
        handleDragEnd(event, nearestNode.point, nodes);
    });

}


function handleDragStart(event, point, layer) {
    event.preventDefault();
    event.stopPropagation();
    holdScroll();

    tool['geometry'] = {
        'shape': layer.line(point.x, point.y, point.x, point.y)
            .addClass('indicator'),
        'vertical': layer.line(point.x, 0, point.x, BOTTOM_EDGE + CANVAS_PADDING)
            .addClass('indicator')
            .addClass('crosshair'),
        'horizontal': layer.line(0, point.y, RIGHT_EDGE + CANVAS_PADDING, point.y)
            .addClass('indicator')
            .addClass('crosshair'),
        'p1': layer.circle(NODE_RADIUS * 2)
            .move(point.x - NODE_RADIUS, point.y - NODE_RADIUS)
            .addClass('indicator'),
        'p2': layer.circle(NODE_RADIUS * 2)
            .move(point.x - NODE_RADIUS, point.y - NODE_RADIUS)
            .addClass('indicator'),
    };
    tool['type'] = LINE;
}


function handleDragMove(event, nodes) {
    event.preventDefault();
    event.stopPropagation();

    const snappedTo = draggableSnap(new Point(event.detail.p.x, event.detail.p.y - window.pageYOffset), nodes);

    tool.geometry.shape.attr('x2', snappedTo.point.x).attr('y2', snappedTo.point.y);
    tool.geometry.p2.attr('cx', snappedTo.point.x).attr('cy', snappedTo.point.y);
    tool.geometry.vertical.attr('x1', snappedTo.point.x).attr('x2', snappedTo.point.x);
    tool.geometry.horizontal.attr('y1', snappedTo.point.y).attr('y2', snappedTo.point.y);

    if (snappedTo.snapped) {
        Object.keys(tool.geometry).forEach(shape => tool.geometry[shape].addClass('snapped'));
    }
    else {
        Object.keys(tool.geometry).forEach(shape => tool.geometry[shape].removeClass('snapped'));
    }
}


function handleDragEnd(event, origin, nodes) {
    releaseScroll();

    Object.keys(tool.geometry).forEach(shape => tool.geometry[shape].remove());
    delete tool['geometry'];
    delete tool['type'];

    const snappedTo = draggableSnap(new Point(event.detail.p.x, event.detail.p.y - window.pageYOffset), nodes);
    if (snappedTo.snapped) {
        handleNewPath(origin, snappedTo.point);
    }
}


export function holdScroll() {
    document.getElementsByTagName('body')[0].classList.add('dragging');

}


export function releaseScroll() {
    document.getElementsByTagName('body')[0].classList.remove('dragging');
}
