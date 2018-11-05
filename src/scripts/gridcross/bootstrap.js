import SVG from 'svg.js';
import svgDraggableInit from "./svg.draggable";

import { undo } from './gridcross.exercise';
import { CANVAS_PADDING, RIGHT_EDGE, BOTTOM_EDGE, API_URL } from './constants';

svgDraggableInit(SVG);

export function bootstrap() {
    // attach the exercise root element
    const root = document.getElementById('gridcross');
    const canvasWrapper = document.createElement('div');
    canvasWrapper.id = 'canvas-wrapper';
    canvasWrapper.style.width = RIGHT_EDGE + CANVAS_PADDING;
    root.appendChild(canvasWrapper);

    // create the svg canvas to draw on
    const canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvas.id = 'canvas';
    canvas.setAttribute('version', '1.1');
    canvasWrapper.appendChild(canvas);

    // create the undo button
    const undoButton = document.createElement('button');
    const undoButtonLabel = document.createTextNode('Zpět');
    undoButton.appendChild(undoButtonLabel);
    undoButton.classList.add('undoButton');
    undoButton.addEventListener('touchstart', undo);
    undoButton.addEventListener('click', undo);
    root.appendChild(undoButton);

    // create the loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loadingIndicator');
    canvasWrapper.appendChild(loadingIndicator);

    return {
        canvas: SVG('canvas').size(RIGHT_EDGE + CANVAS_PADDING, BOTTOM_EDGE + CANVAS_PADDING),
        undoButton: undoButton,
        root: root,
        canvasWrapper: canvasWrapper,
        loadingIndicator: loadingIndicator,
    };
}