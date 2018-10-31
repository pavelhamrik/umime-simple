import Raphael from './_raphael.min';

import {
    GRID_HEIGHT,
    RESOLUTION,
    GRID_WIDTH,
    TOP_EDGE,
    BOTTOM_EDGE,
    LEFT_EDGE,
    RIGHT_EDGE,
    PAPER_PADDING, NODE_DIAMETER
} from './gridcross.constants';

// bootstrapping

const root = document.getElementById('gridcross');

const canvas = document.createElement('div');
canvas.classList.add('canvas');
canvas.id = 'canvas';
root.appendChild(canvas);

const paper = Raphael('canvas', BOTTOM_EDGE + PAPER_PADDING, RIGHT_EDGE + PAPER_PADDING);
paper.setViewBox(0, 0, 242, 242, true);

// drawing things

const xGrid = Array.from(Array(GRID_WIDTH + 1), (value, xGridline) => {
    return paper.path(`M${xGridline * RESOLUTION + PAPER_PADDING},${TOP_EDGE} L${xGridline * RESOLUTION + PAPER_PADDING},${BOTTOM_EDGE}`);
});

const yGrid = Array.from(Array(GRID_HEIGHT + 1), (value, yGridline) => {
    return paper.path(`M${LEFT_EDGE},${yGridline * RESOLUTION + PAPER_PADDING} L${RIGHT_EDGE},${yGridline * RESOLUTION + PAPER_PADDING}`);
});


// for (let yGridline = 0; yGridline <= GRID_HEIGHT; yGridline++) {
//     paper.path(`M${TOP_EDGE},${yGridline * RESOLUTION + PAPER_PADDING} L${BOTTOM_EDGE},${yGridline * RESOLUTION + PAPER_PADDING}`);
// }


const nodes = xGrid.map(xLine => {
    yGrid.map(yLine => {
        const node = Raphael.pathIntersection(xLine, yLine);
        node.length > 0 ? console.log() : function() {};
        paper.circle(node.x, node.y, NODE_DIAMETER);
    })
});


const path1 = paper.path(`M0,0 L100,100`);
const path2 = paper.path(`M100,0 L0,100`);
console.log(Raphael.pathIntersection(path1, path2));