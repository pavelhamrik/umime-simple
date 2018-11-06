import SVG from 'svg.js';

import Point from "./Point";
import { handleNewPath } from './gridcross.exercise';
import { draggableSnap, getNearestNode } from './functions';
import { LINE, NODE_RADIUS } from "./constants";

let tool = {};

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
        const nearestNode = getNearestNode(new Point(event.detail.p.x, event.detail.p.y), nodes);
        handleDragStart(event, nearestNode.point, layer);
    });

    surface.on('dragmove', function (event) {
        handleDragMove(event, nodes);
    });

    surface.on('dragend', function (event) {
        const nearestNode = getNearestNode(
            new Point(event.detail.handler.startPoints.point.x, event.detail.handler.startPoints.point.y),
            nodes
        );
        handleDragEnd(event, nearestNode.point, nodes);
    });

}


function handleDragStart(event, point, layer) {
    event.preventDefault();
    event.stopPropagation();
    holdScroll();

    tool = {
        shape: layer.line(point.x, point.y, point.x, point.y).addClass('indicator'),
        p1: layer.circle(NODE_RADIUS * 2)
            .move(point.x - NODE_RADIUS, point.y - NODE_RADIUS).addClass('indicator'),
        p2: layer.circle(NODE_RADIUS * 2)
            .move(point.x - NODE_RADIUS, point.y - NODE_RADIUS).addClass('indicator'),
        type: LINE,
    }
}


function handleDragMove(event, nodes) {
    event.preventDefault();
    event.stopPropagation();

    const snappedTo = draggableSnap(new Point(event.detail.p.x, event.detail.p.y), nodes);

    tool.shape.attr('x2', snappedTo.point.x).attr('y2', snappedTo.point.y);
    tool.p2.attr('cx', snappedTo.point.x).attr('cy', snappedTo.point.y);

    if (snappedTo.snapped) {
        tool.shape.addClass('snapped');
        tool.p1.addClass('snapped');
        tool.p2.addClass('snapped');
    }
    else {
        tool.shape.removeClass('snapped');
        tool.p1.removeClass('snapped');
        tool.p2.removeClass('snapped');
    }
}


function handleDragEnd(event, origin, nodes) {
    releaseScroll();

    tool.shape.remove();
    tool.p1.remove();
    tool.p2.remove();
    tool = {};

    const snappedTo = draggableSnap(new Point(event.detail.p.x, event.detail.p.y), nodes);
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