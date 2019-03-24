import SVG from 'svg.js';
import svgDraggableInit from "./svg.draggable";

import {
    RIGHT_EDGE,
    BOTTOM_EDGE,
    BACK_BUTTON_LABEL,
    TASK_TEXT_DEFAULT,
    NEXT_BUTTON_LABEL,
    CANVAS_PADDING_RIGHT,
    CANVAS_PADDING_BOTTOM,
    RESET_BUTTON_LABEL,
    RESET_BUTTON_TEST,
    TASK_TITLE_DEFAULT,
    RESOLUTION,
    GRID_WIDTH,
    CANVAS_PADDING_LEFT,
} from './constants';
import GAUtils from '../utils/googleAnalytics';

export function bootstrap() {
    svgDraggableInit(SVG);

    GAUtils.createTest(RESET_BUTTON_TEST);

    const root = document.getElementById('gridcross');

    const wrapper = document.createElement('div');
    wrapper.classList.add('gridcross-wrapper');
    wrapper.style.width = `${GRID_WIDTH * RESOLUTION + CANVAS_PADDING_LEFT + CANVAS_PADDING_RIGHT}px`;
    root.appendChild(wrapper);

    // create the task's title, assignment text and geometry limits

    const taskTitle = document.createElement('div');
    taskTitle.innerHTML = TASK_TITLE_DEFAULT;
    taskTitle.classList.add('task-title');
    wrapper.appendChild(taskTitle);

    const taskText = document.createElement('div');
    taskText.innerHTML = TASK_TEXT_DEFAULT;
    taskText.classList.add('task-copy');
    wrapper.appendChild(taskText);

    // const taskLimits = document.createElement('span');
    // taskLimits.classList.add('task-limits');
    // taskText.appendChild(taskLimits);


    // attach the exercise root element

    const canvasWrapper = document.createElement('div');
    canvasWrapper.id = 'canvas-wrapper';
    canvasWrapper.style.width = RIGHT_EDGE + CANVAS_PADDING_RIGHT;
    wrapper.appendChild(canvasWrapper);

    // create the svg canvas to draw on

    const canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvas.id = 'canvas';
    canvas.setAttribute('version', '1.1');
    canvasWrapper.appendChild(canvas);

    // create the button wrappers

    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add('button-wrapper');
    canvasWrapper.appendChild(buttonWrapper);

    const buttonWrapperLeft = document.createElement('div');
    buttonWrapperLeft.classList.add('button-wrapper-left');
    buttonWrapper.appendChild(buttonWrapperLeft);

    const buttonWrapperRight = document.createElement('div');
    buttonWrapperRight.classList.add('button-wrapper-right');
    buttonWrapper.appendChild(buttonWrapperRight);

    // create the reset button

    const resetButton = document.createElement('button');
    resetButton.classList.add('reset-button');
    resetButton.setAttribute('title', RESET_BUTTON_LABEL);
    resetButton.disabled = true;
    buttonWrapperLeft.appendChild(resetButton);

    // create the undo button

    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.setAttribute('title', BACK_BUTTON_LABEL);
    undoButton.disabled = true;
    buttonWrapperLeft.appendChild(undoButton);

    // create the next assignment button

    const nextButton = document.createElement('button');
    const nextButtonLabel = document.createTextNode(NEXT_BUTTON_LABEL);
    nextButton.appendChild(nextButtonLabel);
    nextButton.classList.add('next-button');
    nextButton.disabled = true;
    buttonWrapperRight.appendChild(nextButton);

    return {
        canvas: SVG('canvas').size(RIGHT_EDGE + CANVAS_PADDING_RIGHT, BOTTOM_EDGE + CANVAS_PADDING_BOTTOM),
        undoButton: undoButton,
        nextButton: nextButton,
        resetButton: resetButton,
        // wrapper: wrapper,
        canvasWrapper: canvasWrapper,
        taskTitle: taskTitle,
        taskText: taskText,
    };
}