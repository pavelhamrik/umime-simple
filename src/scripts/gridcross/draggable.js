import SVG from 'svg.js';

import Point from "./Point";
import { handleNewPath } from './gridcross.exercise';
import { draggableSnap } from './functions';
import { LINE, NODE_RADIUS } from "./constants";

let tool = {};

export function attachDraggable(node, layer, nodes) {
    node.draggable();

    node.on('dragstart', function (event) {
        event.preventDefault();
        event.stopPropagation();
        holdScroll();

        const origin = SVG.get(event.detail.handler.el.node.id).attr();

        tool = {
            shape: layer.line(origin.cx, origin.cy, origin.cx, origin.cy).addClass('indicator'),
            p1: layer.circle(NODE_RADIUS * 2)
                .move(origin.cx - NODE_RADIUS, origin.cy - NODE_RADIUS).addClass('indicator'),
            p2: layer.circle(NODE_RADIUS * 2)
                .move(origin.cx - NODE_RADIUS, origin.cy - NODE_RADIUS).addClass('indicator'),
            type: LINE,
        }
    });

    node.on('dragmove', function (event) {
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
    });

    node.on('dragend', function (event) {
        releaseScroll();

        tool.shape.remove();
        tool.p1.remove();
        tool.p2.remove();
        tool = {};

        const originAttr = SVG.get(event.detail.handler.el.node.id).attr();
        const origin = new Point(originAttr.cx, originAttr.cy);
        const snappedTo = draggableSnap(new Point(event.detail.p.x, event.detail.p.y), nodes);

        if (snappedTo.snapped) {
            handleNewPath(origin, snappedTo.point);
        }
    });

    return node;
}

export function holdScroll(event) {
    event.stopPropagation();
    event.preventDefault();
    document.getElementsByTagName('body')[0].classList.add('dragging');

}

export function releaseScroll() {
    event.stopPropagation();
    event.preventDefault();
    document.getElementsByTagName('body')[0].classList.remove('dragging');
}