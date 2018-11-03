import SVG from 'svg.js';

import { intersectLineLine } from './intersections';
import {
    svgLineToPoints,
    svgjsInit,
    draggableSnap,
    getNearestNode,
    extendLineCoordinates, calculateDistance,
} from './utils';

import Point from './Point';
import StateProvider from './StateProvider';

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
    LINE,
    NODE,
} from './constants';


// bootstrapping

const initialState = {
    'nodes': [
        {type: NODE, className: 'node', stateType: 'nodes', svgGroup: 'nodeGroup', geometry: {p1: new Point(0, 0)}}
    ],
    'paths': [
        // {type: LINE, className: 'line', stateType: 'paths', svgGroup: 'pathGroup', geometry: {p1: new Point(0, 0), p2: new Point(0, 0)}}
    ],
};

const state = new StateProvider(initialState);

function storeElement(elem, state) {
    const currentState = state.get();
    const entry = {};
    entry[elem.type] = currentState[elem.type].concat(elem);
    state.set(Object.assign({}, currentState, entry));
}

function storeElements(elems, type, state) {
    const entry = {};
    entry[type] = elems;
    state.set(Object.assign({}, state.get(), entry));
}

// these won't change, so we won't store them in the state

const canvas = svgjsInit();
const groups = {
    pathGroup: canvas.group().addClass('pathGroup'),
    workGroup: canvas.group().addClass('workGroup'),
    nodeGroup: canvas.group().addClass('nodeGroup'),
};


// generating the grid

const xGrid = Array.from(Array(GRID_WIDTH + 1), (value, xGridline) => {
    return {type: LINE, className: 'gridline', stateType: 'paths', svgGroup: 'pathGroup',
        geometry: {
            p1: new Point(xGridline * RESOLUTION + PAPER_PADDING, TOP_EDGE),
            p2: new Point(xGridline * RESOLUTION + PAPER_PADDING, BOTTOM_EDGE),
        }
    };
});
const yGrid = Array.from(Array(GRID_WIDTH + 1), (value, yGridline) => {
    return {type: LINE, className: 'gridline', stateType: 'paths', svgGroup: 'pathGroup',
        geometry: {
            p1: new Point(LEFT_EDGE, yGridline * RESOLUTION + PAPER_PADDING),
            p2: new Point(RIGHT_EDGE, yGridline * RESOLUTION + PAPER_PADDING),
        }
    };
});

storeElements(xGrid.concat(yGrid), 'paths', state);

console.log(state.get());

// rendering from state
function render(state, groups) {
    console.log(state);
    console.log(state.get());

    state.get().map(elemGroup => {
        elemGroup.map(elem => {
            if (elem.type === NODE) {
                groups.nodeGroup.circle(NODE_RADIUS * 2)
                    .move(elem.geometry.p1.x - NODE_RADIUS, elem.geometry.p1.y - NODE_RADIUS)
                    .addClass(elem.className)
            }
            if (elem.type === LINE) {
                groups.nodeGroup.line(elem.geometry.p1.x, elem.geometry.p1.y, elem.geometry.p2.x, elem.geometry.p2.y)
                    .addClass(elem.className)
            }
        })
    })
}

// initial render
render(state, groups);


// let paths = xGrid.concat(yGrid);
//
// let nodes = xGrid.map(xLine => {
//     return yGrid.map(yLine => {
//         const xLinePoints = svgLineToPoints(xLine);
//         const yLinePoints = svgLineToPoints(yLine);
//         return intersectLineLine(xLinePoints[0], xLinePoints[1], yLinePoints[0], yLinePoints[1],).intersections
//             .map(intersection => (
//                 addNode({x: intersection.x, y: intersection.y}, nodeGroup, [], ['gridnode'])
//             ));
//     }).flat();
// }).flat();
//
// let dragIndicator = {};
//
//
// // node manipulation
//
// function findLine(point1, point2, paths) {
//     return paths.filter(path => {
//         const pathPoints = svgLineToPoints(path);
//         const distance1 = Math.min(calculateDistance(pathPoints[0], point1), calculateDistance(pathPoints[0], point2));
//         const distance2 = Math.min(calculateDistance(pathPoints[1], point1), calculateDistance(pathPoints[1], point2));
//
//         console.log('distances', distance1, distance2, distance1 < DUPLICATE_LINE_THRESHOLD && distance2 < DUPLICATE_LINE_THRESHOLD);
//
//         return distance1 < DUPLICATE_LINE_THRESHOLD && distance2 < DUPLICATE_LINE_THRESHOLD;
//     })
// }
//
// function addNode(coords, group, nodes, classes = ['gridnode']) {
//     const nearestNode = getNearestNode(coords.x, coords.y, nodes);
//     if (typeof nearestNode.distance !== 'undefined' && nearestNode.distance < DUPLICATE_NODE_THRESHOLD) return;
//
//     const node = group.circle(NODE_RADIUS * 2)
//         .move(coords.x - NODE_RADIUS, coords.y - NODE_RADIUS)
//         .addClass('node')
//         .addClass(classes.join(' '));
//
//     return attachDraggable(node);
// }
//
// function addLine(point1, point2, classes, paths, pathGroup, nodes, nodeGroup) {
//
//     console.time('addLine');
//
//     if (findLine(point1, point2, paths).length !== 0) return {paths: paths, nodes: nodes};
//
//     const newLine = pathGroup.line(point1.x, point1.y, point2.x, point2.y)
//         .addClass('line')
//         .addClass(classes.join(' '));
//
//     const axisCoords = extendLineCoordinates(point1, point2);
//
//     console.log(findLine(axisCoords[0], axisCoords[1], paths).length);
//
//     const axisLine = findLine(axisCoords[0], axisCoords[1], paths).length === 0
//         ? pathGroup.line(axisCoords[0].x, axisCoords[0].y, axisCoords[1].x, axisCoords[1].y).addClass('axisline')
//         : undefined;
//
//     const newNodes = paths.reduce((accumulator, line) => {
//         const linePoints = svgLineToPoints(line);
//         return accumulator.concat(
//             intersectLineLine(linePoints[0], linePoints[1], axisCoords[0], axisCoords[1])
//                 .intersections
//                 .map(node => {
//                     const classList = line.hasClass('gridline') || line.hasClass('axisline') ? [] : ['usernode'];
//                     return addNode({x: node.x, y: node.y}, nodeGroup, nodes, classList);
//                 })
//                 .filter(node => typeof node !== 'undefined')
//         );
//     }, []);
//
//     const pathsWithAxisLine = typeof axisLine !== 'undefined'
//         ? paths.concat([newLine, axisLine])
//         : paths.concat([newLine]);
//
//     console.timeEnd('addLine');
//
//     return {
//         paths: pathsWithAxisLine,
//         nodes: nodes.concat(newNodes),
//     };
// }
//
// // dragging
//
// function attachDraggable(node) {
//     node.draggable();
//
//     node.on('dragstart', function (event) {
//         const originNode = SVG.get(event.detail.handler.el.node.id);
//         const origin = originNode.attr();
//         originNode.addClass('usernode');
//         dragIndicator = workGroup.line(origin.cx, origin.cy, origin.cx, origin.cy).addClass('indicator');
//     });
//
//     node.on('dragmove', function (event) {
//         event.preventDefault();
//
//         const snapTo = draggableSnap(event.detail.p.x, event.detail.p.y, nodes);
//         dragIndicator
//             .attr('x2', snapTo.x)
//             .attr('y2', snapTo.y);
//         if (snapTo.snapped) {
//             dragIndicator.addClass('snapped');
//             snapTo.node.addClass('snapped');
//         }
//         else {
//             dragIndicator.removeClass('snapped');
//         }
//     });
//
//     node.on('dragend', function (event) {
//         const originNode = SVG.get(event.detail.handler.el.node.id);
//         const origin = originNode.attr();
//         const snapTo = draggableSnap(event.detail.p.x, event.detail.p.y, nodes);
//
//         dragIndicator.remove();
//         dragIndicator = {};
//
//         if (snapTo.snapped) {
//             originNode.addClass('usernode');
//
//             if (originNode !== snapTo.node) {
//                 snapTo.node.addClass('usernode');
//                 const nodesAndPaths = addLine(
//                     {x: origin.cx, y: origin.cy},
//                     {x: snapTo.x, y: snapTo.y},
//                     ['userline'],
//                     paths,
//                     pathGroup,
//                     nodes,
//                     nodeGroup
//                 );
//                 nodes = nodesAndPaths.nodes;
//                 paths = nodesAndPaths.paths;
//             }
//         }
//         else {
//             originNode.removeClass('usernode');
//         }
//     });
//
//     return node;
// }
