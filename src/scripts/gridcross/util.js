import {
    LOCAL_IO,
    NODE_STATE_COLLECTION,
    PATH_STATE_COLLECTION,
    TASK_LINE_CLASS_NAME,
    TASK_NODE_CLASS_NAME,
    USER_LINE_CLASS_NAME,
    USER_NODE_CLASS_NAME,
} from './constants';
import { fromCanvasCoord } from './functions';
import { handleAssignment, nextAssignment, presentAssignment } from './gridcross.exercise';

export function exportGeometry(stateSnapshot) {
    if (!LOCAL_IO) return;

    const log = {};
    log['points'] = stateSnapshot[NODE_STATE_COLLECTION]
        .filter(node => (
            node.classes.has(USER_NODE_CLASS_NAME) || node.classes.has(TASK_NODE_CLASS_NAME)
        ))
        .map(node => (
            [fromCanvasCoord(node.geometry.p1.x), fromCanvasCoord(node.geometry.p1.y)]
        ));

    log['segments'] = stateSnapshot[PATH_STATE_COLLECTION]
        .filter(path => (
            path.classes.has(USER_LINE_CLASS_NAME) || path.classes.has(TASK_LINE_CLASS_NAME)
        ))
        .map(path => (
            [
                [fromCanvasCoord(path.geometry.p1.x), fromCanvasCoord(path.geometry.p1.y)],
                [fromCanvasCoord(path.geometry.p2.x), fromCanvasCoord(path.geometry.p2.y)]
            ]
        ));

    console.log(
        JSON.stringify(log, (key, value) => (
            value instanceof Array
                ? value.map(value => (
                    value instanceof Array ? JSON.stringify(value) : value
                ))
                : value
        ), 2)
    );
}


export function createLocalInput() {
    // if (!LOCAL_IO) return {};

    const input = document.createElement('textarea');
    input.id = 'local-io';
    input.placeholder = 'Enter an assignment in JSON format';

    input.addEventListener('keyup', handleLocalInput);
    input.addEventListener('change', handleLocalInput);

    document.getElementById('gridcross').appendChild(input);
}


function handleLocalInput() {
    this.style.height = `calc(${this.scrollHeight + 2}px)`;

    if (isValidJSON(this.value)) {
        handleAssignment(JSON.parse(this.value));
    }
}


function isValidJSON(json) {
    try {
        JSON.parse(json);
    } catch (e) {
        return false;
    }
    return true;
}