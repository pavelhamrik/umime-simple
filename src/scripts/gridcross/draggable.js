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

        const origin = SVG.get(event.detail.handler.el.node.id).attr();

        tool = {
            line: layer.line(origin.cx, origin.cy, origin.cx, origin.cy).addClass('indicator'),
            start: layer.circle(NODE_RADIUS * 2)
                .move(origin.cx - NODE_RADIUS, origin.cy - NODE_RADIUS).addClass('indicator'),
            end: layer.circle(NODE_RADIUS * 2)
                .move(origin.cx - NODE_RADIUS, origin.cy - NODE_RADIUS).addClass('indicator'),
            type: LINE,
        }
    });

    node.on('dragmove', function (event) {
        event.preventDefault();
        event.stopPropagation();

        const snappedTo = draggableSnap(new Point(event.detail.p.x, event.detail.p.y), nodes);

        tool.line.attr('x2', snappedTo.point.x).attr('y2', snappedTo.point.y);
        tool.end.attr('cx', snappedTo.point.x).attr('cy', snappedTo.point.y);

        if (snappedTo.snapped) {
            tool.line.addClass('snapped');
            tool.start.addClass('snapped');
            tool.end.addClass('snapped');
        }
        else {
            tool.line.removeClass('snapped');
            tool.start.removeClass('snapped');
            tool.end.removeClass('snapped');
        }
    });

    node.on('dragend', function (event) {
        tool.line.remove();
        tool.start.remove();
        tool.end.remove();
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