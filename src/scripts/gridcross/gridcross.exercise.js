import Snap from 'snapsvg';
import { intersectLineLine } from './intersections';
import { lineToPoints } from './utils';

import {
    GRID_HEIGHT,
    RESOLUTION,
    GRID_WIDTH,
    TOP_EDGE,
    BOTTOM_EDGE,
    LEFT_EDGE,
    RIGHT_EDGE,
    PAPER_PADDING,
    NODE_DIAMETER,
    NODE_HOVER_DIAMETER,
    DEFAULT_COLOR,
} from './gridcross.constants';

// bootstrapping

const root = document.getElementById('gridcross');
const canvasWrapper = document.createElement('div');
canvasWrapper.id = 'canvas-wrapper';
canvasWrapper.style.width = RIGHT_EDGE + PAPER_PADDING;
root.appendChild(canvasWrapper);

const canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
canvas.id = 'canvas';
canvas.setAttribute('width', RIGHT_EDGE + PAPER_PADDING);
canvas.setAttribute('height', BOTTOM_EDGE + PAPER_PADDING);
canvas.setAttribute('version', '1.1');
canvasWrapper.appendChild(canvas);

const paper = Snap('#canvas');

// drawing things

const xGrid = Array.from(Array(GRID_WIDTH + 1), (value, xGridline) => {
    return paper.path(`M${xGridline * RESOLUTION + PAPER_PADDING},${TOP_EDGE} L${xGridline * RESOLUTION + PAPER_PADDING},${BOTTOM_EDGE}`)
        .addClass('gridline')
        .attr({stroke: DEFAULT_COLOR});
});

const yGrid = Array.from(Array(GRID_HEIGHT + 1), (value, yGridline) => {
    return paper.path(`M${LEFT_EDGE},${yGridline * RESOLUTION + PAPER_PADDING} L${RIGHT_EDGE},${yGridline * RESOLUTION + PAPER_PADDING}`)
        .addClass('gridline')
        .attr({stroke: DEFAULT_COLOR});
});

let nodes = xGrid.map(xLine => {
    return yGrid.map(yLine => {
        const xLinePoints = lineToPoints(xLine);
        const yLinePoints = lineToPoints(yLine);
        return intersectLineLine(xLinePoints[0], xLinePoints[1], yLinePoints[0], yLinePoints[1],).intersections
            .map(intersection => (
                paper.circle(intersection.x, intersection.y, NODE_DIAMETER)
                    .addClass('node')
                    .addClass('gridnode')
                    .attr({stroke: DEFAULT_COLOR})
            ));
    }).flat();
}).flat();

console.log(`%cnodes.length: ${nodes.length}`, 'color: peru');

// sandboxing

// console.log(xGrid[0].attr());

let dragOrigin = {
    point: {x: Infinity, y: Infinity},
    element: {},
    indicator: {},
};

const dragmove = function (dx, dy, x, y, event) {
    // console.log(Object.assign({}, dragOrigin.indicator, {}));

    // console.log(dragOrigin.indicator.attr());

    dragOrigin.indicator.attr('x2', dragOrigin.point.x + dx);
    dragOrigin.indicator.attr('y2', dragOrigin.point.y + dy);
};

const dragstart = function (x, y, event) {
    const xOrigin = event.target.cx.baseVal.value;
    const yOrigin = event.target.cy.baseVal.value;

    console.log(xOrigin, yOrigin);

    dragOrigin.point= {x: xOrigin, y: yOrigin};
    dragOrigin.element = event.target;

    dragOrigin.indicator = paper.line(xOrigin, yOrigin, xOrigin, yOrigin).addClass('indicator');
};
const dragend = function (event) {
    // console.log(Snap.getElementByPoint(event.x, event.y));
    // console.log(event);

    dragOrigin.point = {x: Infinity, y: Infinity};
    dragOrigin.element = {};

    dragOrigin.indicator.remove();
    dragOrigin.indicator = {};

    // console.log(this);
};

nodes.map(node => {
    node.node.onclick = function () {
        node.attr("fill", "red");
    };

    node.drag(dragmove, dragstart, dragend);

    // node.hover(
    //     () => node.attr('r', NODE_HOVER_DIAMETER),
    //     () => node.attr('r', NODE_DIAMETER)
    // );

    node.mouseover(() => node.attr('r', NODE_HOVER_DIAMETER));
    node.mouseout(() => node.attr('r', NODE_DIAMETER));

    console.log(node);

    // node.addEventListener('mouseover', () => node.attr('r', NODE_HOVER_DIAMETER));
    // node.addEventListener('mouseout', () => node.attr('r', NODE_DIAMETER));

    return null;
});

