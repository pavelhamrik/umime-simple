import SVG from 'svg.js';
import svgDraggableInit from "./svg.draggable";

import { CANVAS_PADDING, RIGHT_EDGE, BOTTOM_EDGE } from './constants';

svgDraggableInit(SVG);

export function svgjsInit() {
    const root = document.getElementById('gridcross');
    const canvasWrapper = document.createElement('div');
    canvasWrapper.id = 'canvas-wrapper';
    canvasWrapper.style.width = RIGHT_EDGE + CANVAS_PADDING;
    root.appendChild(canvasWrapper);

    const canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvas.id = 'canvas';
    canvas.setAttribute('version', '1.1');
    canvasWrapper.appendChild(canvas);

    return SVG('canvas').size(RIGHT_EDGE + CANVAS_PADDING, BOTTOM_EDGE + CANVAS_PADDING);
}