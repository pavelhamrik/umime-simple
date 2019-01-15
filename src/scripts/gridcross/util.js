import {
    AUX_LINE_CLASS_NAME,
    // LOCAL_IO,
    NODE_STATE_COLLECTION,
    PATH_STATE_COLLECTION,
    TASK_LINE_CLASS_NAME,
    TASK_NODE_CLASS_NAME,
    USER_LINE_CLASS_NAME,
    USER_NODE_CLASS_NAME,
} from './constants';
import { handleAssignment } from './gridcross.exercise';
import { fromCanvasXCoord, fromCanvasYCoord } from './functions';

export function exportGeometry(stateSnapshot) {
    if (!LOCAL_IO) return;

    const log = {};
    log['points'] = stateSnapshot[NODE_STATE_COLLECTION]
        .filter(node => (
            node.classes.has(USER_NODE_CLASS_NAME) || node.classes.has(TASK_NODE_CLASS_NAME)
        ))
        .map(node => (
            [fromCanvasXCoord(node.geometry.p1.x), fromCanvasYCoord(node.geometry.p1.y)]
        ));

    log['segments'] = stateSnapshot[PATH_STATE_COLLECTION]
        .filter(path => (
            path.classes.has(USER_LINE_CLASS_NAME) || path.classes.has(TASK_LINE_CLASS_NAME)
        ))
        .map(path => (
            [
                [fromCanvasXCoord(path.geometry.p1.x), fromCanvasYCoord(path.geometry.p1.y)],
                [fromCanvasXCoord(path.geometry.p2.x), fromCanvasYCoord(path.geometry.p2.y)]
            ]
        ));

    log['auxiliary segments'] = stateSnapshot[PATH_STATE_COLLECTION]
        .filter(path => (
            path.classes.has(AUX_LINE_CLASS_NAME)
        ))
        .map(path => (
            [
                [fromCanvasXCoord(path.geometry.p1.x), fromCanvasYCoord(path.geometry.p1.y)],
                [fromCanvasXCoord(path.geometry.p2.x), fromCanvasYCoord(path.geometry.p2.y)]
            ]
        ));

    console.log(
        JSON.stringify(log, (key, value) => {
                return value instanceof Array
                ? value.map(value => (
                    value instanceof Array ? JSON.stringify(value) : value
                ))
                : value
        }, 2).replace(/"\[/g, '[').replace(/]"/g, ']')
    );
}


export function createLocalInput() {
    const container = document.createElement('div');
    container.id = 'local-io';

    const inputField = document.createElement('textarea');
    inputField.id = 'local-io-input';
    inputField.placeholder = 'Enter an assignment in JSON format';

    inputField.addEventListener('input', resizeInputField);

    const applyButton = document.createElement('button');
    applyButton.id = 'local-io-apply-button';
    applyButton.setAttribute('title', 'Vložit');

    applyButton.addEventListener('touchstart', handleLocalInput);
    applyButton.addEventListener('click', handleLocalInput);

    document.getElementById('gridcross').appendChild(container);
    container.appendChild(inputField);
    container.appendChild(applyButton);
}


function resizeInputField() {
    this.style.height = `calc(${this.scrollHeight + 2}px)`;
}


function handleLocalInput() {
    const inputField = document.getElementById('local-io-input');
    if (isValidJSON(inputField.value)) {
        handleAssignment(JSON.parse(inputField.value));
    }
    else console.log(`%cInvalid assignment input`, 'color: red');
}


function isValidJSON(json) {
    try {
        JSON.parse(json);
    } catch (e) {
        return false;
    }
    return true;
}