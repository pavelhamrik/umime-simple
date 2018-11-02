import SVG from 'svg.js';

import { intersectLineLine } from './intersections';
import {
    svgLineToPoints,
    bootstrap,
    draggableSnap,
    getNearestNode,
    extendLineCoordinates, calculateDistance,
} from './gridcross.utils';

import {
    GRID_HEIGHT,
    RESOLUTION,
    GRID_WIDTH,
    TOP_EDGE,
    BOTTOM_EDGE,
    LEFT_EDGE,
    RIGHT_EDGE,
    PAPER_PADDING,
    DUPLICATE_NODE_THRESHOLD,
    DUPLICATE_LINE_THRESHOLD,
    NODE_RADIUS,
} from './gridcross.constants';


// bootstrapping

const canvas = bootstrap();


// drawing the grid

const pathGroup = canvas.group().addClass('pathGroup');
const workGroup = canvas.group().addClass('workGroup');
const nodeGroup = canvas.group().addClass('nodeGroup');

const xGrid = Array.from(Array(GRID_WIDTH + 1), (value, xGridline) => {
    return pathGroup.line(xGridline * RESOLUTION + PAPER_PADDING, TOP_EDGE, xGridline * RESOLUTION + PAPER_PADDING, BOTTOM_EDGE)
        .addClass('gridline');
});

const yGrid = Array.from(Array(GRID_HEIGHT + 1), (value, yGridline) => {
    return pathGroup.line(LEFT_EDGE, yGridline * RESOLUTION + PAPER_PADDING, RIGHT_EDGE, yGridline * RESOLUTION + PAPER_PADDING)
        .addClass('gridline');
});


// mutable

let paths = xGrid.concat(yGrid);

let nodes = xGrid.map(xLine => {
    return yGrid.map(yLine => {
        const xLinePoints = svgLineToPoints(xLine);
        const yLinePoints = svgLineToPoints(yLine);
        return intersectLineLine(xLinePoints[0], xLinePoints[1], yLinePoints[0], yLinePoints[1],).intersections
            .map(intersection => (
                addNode({x: intersection.x, y: intersection.y}, nodeGroup, [], ['gridnode'])
            ));
    }).flat();
}).flat();

let dragIndicator = {};


// node manipulation

function findLine(point1, point2, paths) {
    return paths.filter(path => {
        const pathPoints = svgLineToPoints(path);
        const distance1 = Math.min(calculateDistance(pathPoints[0], point1), calculateDistance(pathPoints[0], point2));
        const distance2 = Math.min(calculateDistance(pathPoints[1], point1), calculateDistance(pathPoints[1], point2));

        console.log('distances', distance1, distance2, distance1 < DUPLICATE_LINE_THRESHOLD && distance2 < DUPLICATE_LINE_THRESHOLD);

        return distance1 < DUPLICATE_LINE_THRESHOLD && distance2 < DUPLICATE_LINE_THRESHOLD;
    })
}

function addNode(coords, group, nodes, classes = ['gridnode']) {
    const nearestNode = getNearestNode(coords.x, coords.y, nodes);
    if (typeof nearestNode.distance !== 'undefined' && nearestNode.distance < DUPLICATE_NODE_THRESHOLD) return;

    const node = group.circle(NODE_RADIUS * 2)
        .move(coords.x - NODE_RADIUS, coords.y - NODE_RADIUS)
        .addClass('node')
        .addClass(classes.join(' '));

    return attachDraggable(node);
}

function addLine(point1, point2, classes, paths, pathGroup, nodes, nodeGroup) {

    console.time('addLine');

    if (findLine(point1, point2, paths).length !== 0) return {paths: paths, nodes: nodes};

    const newLine = pathGroup.line(point1.x, point1.y, point2.x, point2.y)
        .addClass('line')
        .addClass(classes.join(' '));

    const axisCoords = extendLineCoordinates(point1, point2);

    console.log(findLine(axisCoords[0], axisCoords[1], paths).length);

    const axisLine = findLine(axisCoords[0], axisCoords[1], paths).length === 0
        ? pathGroup.line(axisCoords[0].x, axisCoords[0].y, axisCoords[1].x, axisCoords[1].y).addClass('axisline')
        : undefined;

    const newNodes = paths.reduce((accumulator, line) => {
        const linePoints = svgLineToPoints(line);
        return accumulator.concat(
            intersectLineLine(linePoints[0], linePoints[1], axisCoords[0], axisCoords[1])
                .intersections
                .map(node => {
                    const classList = line.hasClass('gridline') || line.hasClass('axisline') ? [] : ['usernode'];
                    return addNode({x: node.x, y: node.y}, nodeGroup, nodes, classList);
                })
                .filter(node => typeof node !== 'undefined')
        );
    }, []);

    const pathsWithAxisLine = typeof axisLine !== 'undefined'
        ? paths.concat([newLine, axisLine])
        : paths.concat([newLine]);

    console.timeEnd('addLine');

    return {
        paths: pathsWithAxisLine,
        nodes: nodes.concat(newNodes),
    };
}

// dragging

function attachDraggable(node) {
    node.draggable();

    node.on('dragstart', function (event) {
        const originNode = SVG.get(event.detail.handler.el.node.id);
        const origin = originNode.attr();
        originNode.addClass('usernode');
        dragIndicator = workGroup.line(origin.cx, origin.cy, origin.cx, origin.cy).addClass('indicator');
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

            if (originNode !== snapTo.node) {
                snapTo.node.addClass('usernode');
                const nodesAndPaths = addLine(
                    {x: origin.cx, y: origin.cy},
                    {x: snapTo.x, y: snapTo.y},
                    ['userline'],
                    paths,
                    pathGroup,
                    nodes,
                    nodeGroup
                );
                nodes = nodesAndPaths.nodes;
                paths = nodesAndPaths.paths;
            }
        }
        else {
            originNode.removeClass('usernode');
        }
    });

    return node;
}
