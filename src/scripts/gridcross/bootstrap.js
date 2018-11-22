import SVG from 'svg.js';
import svgDraggableInit from "./svg.draggable";

import {
    CANVAS_PADDING,
    RIGHT_EDGE,
    BOTTOM_EDGE,
    BACK_BUTTON_LABEL,
    TASK_TEXT_DEFAULT,
    NEXT_BUTTON_LABEL,
} from './constants';

svgDraggableInit(SVG);

export function bootstrap() {
    const root = document.getElementById('gridcross');

    // create the task text paragraph
    const taskText = document.createElement('div');
    taskText.innerHTML = TASK_TEXT_DEFAULT;
    taskText.classList.add('task-copy');
    root.appendChild(taskText);

    // attach the exercise root element
    const canvasWrapper = document.createElement('div');
    canvasWrapper.id = 'canvas-wrapper';
    canvasWrapper.style.width = RIGHT_EDGE + CANVAS_PADDING;
    root.appendChild(canvasWrapper);

    // create the svg canvas to draw on
    const canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvas.id = 'canvas';
    canvas.setAttribute('version', '1.1');
    canvasWrapper.appendChild(canvas);

    // create the button wrapper
    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add('button-wrapper');
    root.appendChild(buttonWrapper);

    // create the undo button
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.setAttribute('title', BACK_BUTTON_LABEL);
    undoButton.disabled = true;
    buttonWrapper.appendChild(undoButton);

    // create the next assignment button
    const nextButton = document.createElement('button');
    const nextButtonLabel = document.createTextNode(NEXT_BUTTON_LABEL);
    nextButton.appendChild(nextButtonLabel);
    nextButton.classList.add('next-button');
    nextButton.disabled = true;
    buttonWrapper.appendChild(nextButton);

    return {
        canvas: SVG('canvas').size(RIGHT_EDGE + CANVAS_PADDING, BOTTOM_EDGE + CANVAS_PADDING),
        undoButton: undoButton,
        nextButton: nextButton,
        root: root,
        canvasWrapper: canvasWrapper,
        taskText: taskText,
    };
}