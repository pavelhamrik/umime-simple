import {
    getNearestNode,
    extendLineCoordinates,
    generateGridLines,
    generateGridNodes,
    render,
    addElemClassInObject,
    composeStateObject,
    createStateId,
    findLine,
    parseAssignment, checkSolution, isEmptyObject,
} from './functions';
import { intersectLineLine } from './intersections';
import { bootstrap } from './bootstrap';
import StateProvider from './StateProvider';
import {
    API_URL,
    DUPLICATE_NODE_THRESHOLD,
    LINE, NODE,
    NODE_GROUP, PATH_GROUP, WORK_GROUP, BACK_GROUP,
    AXIS_LINE_CLASS_NAME, USER_LINE_CLASS_NAME, NODE_CLASS_NAME, GRID_NODE_CLASS_NAME, USER_NODE_CLASS_NAME,
    PATH_STATE_COLLECTION, NODE_STATE_COLLECTION, GRID_LINE_CLASS_NAME, API_LOAD_ERROR_TEXT,
} from './constants';


// bootstrapping

console.time('init');

const { canvas, canvasWrapper, taskText } = bootstrap();

// these won't change, so we won't store them in the state
const groups = {};
groups[BACK_GROUP] = canvas.group().addClass(BACK_GROUP);
groups[PATH_GROUP] = canvas.group().addClass(PATH_GROUP);
groups[WORK_GROUP] = canvas.group().addClass(WORK_GROUP);
groups[NODE_GROUP] = canvas.group().addClass(NODE_GROUP);

const initialState = {};
initialState[NODE_STATE_COLLECTION] = generateGridNodes(
    new Set([NODE_CLASS_NAME, GRID_NODE_CLASS_NAME]), NODE_STATE_COLLECTION, NODE_GROUP
);
initialState[PATH_STATE_COLLECTION] = generateGridLines(
    new Set([GRID_LINE_CLASS_NAME]), PATH_STATE_COLLECTION, PATH_GROUP
);

const state = new StateProvider(initialState);

function getAssignment() {
    function handleError() {
        taskText.textContent = API_LOAD_ERROR_TEXT;
        loadingIndicator.remove();
    }

    // initial render
    render(state, groups);

    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');
    canvasWrapper.appendChild(loadingIndicator);

    const request = new XMLHttpRequest();
    request.open('GET', API_URL);
    request.responseType = 'json';
    request.onerror = handleError;
    request.ontimeout = handleError;
    request.onabort = handleError;
    request.onload = function() {
        // compose the state update based on the assignment data
        state.set(parseAssignment(request.response, state.get()));

        taskText.textContent = request.response.text;
        loadingIndicator.remove();

        // render assignment
        render(state, groups);
    };
    request.send();
}

getAssignment();

console.timeEnd('init');


// working with the geometry interactions

// todo: className strings and state object identifiers should use constants; then move away as pure, agnostic functions
export function composeNewStateForNode(point, className, stateSnapshot) {
    const nearestNode = getNearestNode(point, stateSnapshot.nodes);
    if (typeof nearestNode.distance === 'undefined') return;

    // node is considered duplicate
    if (nearestNode.distance < DUPLICATE_NODE_THRESHOLD) {
        // if (className === undefined) return stateSnapshot;
        return Object.assign({}, stateSnapshot, {
            nodes: addElemClassInObject(stateSnapshot.nodes, nearestNode.node.id, className)
        })
    }
    // node doesn't exist yet
    const newNodeClasses = className === undefined ? new Set([NODE_CLASS_NAME]) : new Set([NODE_CLASS_NAME, className]);
    return Object.assign({}, stateSnapshot, {
        nodes: stateSnapshot.nodes.concat(
            composeStateObject(
                createStateId(NODE_STATE_COLLECTION, stateSnapshot),
                NODE, newNodeClasses, NODE_STATE_COLLECTION, NODE_GROUP, {p1: point}
            )
        )
    })
}

// todo: className strings and state object identifiers should use constants; then move away as pure, agnostic functions
export function composeNewStateForLine(p1, p2, className = USER_LINE_CLASS_NAME, stateSnapshot) {
    const workingState = [];

    // create the line which the player just drew

    // todo: update the line's class if it alrady exists

    workingState.push(
        Object.assign({}, stateSnapshot, {
            paths: stateSnapshot.paths.concat(
                composeStateObject(
                    createStateId(PATH_STATE_COLLECTION, stateSnapshot),
                    LINE, new Set([NODE_CLASS_NAME, className]), PATH_STATE_COLLECTION, NODE_GROUP, {p1: p1, p2: p2}
                )
            )
        })
    );

    // create the hinting 'axis line'
    const axisLine = extendLineCoordinates(p1, p2);
    if (findLine(axisLine.p1, axisLine.p2, workingState[workingState.length - 1]['paths']).length === 0) {
        workingState.push(
            Object.assign({}, workingState[workingState.length - 1], {
                paths: workingState[workingState.length - 1].paths.concat(
                    composeStateObject(
                        createStateId(PATH_STATE_COLLECTION, stateSnapshot),
                        LINE, new Set([AXIS_LINE_CLASS_NAME]), PATH_STATE_COLLECTION, NODE_GROUP,
                        {p1: axisLine.p1, p2: axisLine.p2}
                    )
                )
            })
        );
    }

    // create or update nodes at intersections of existing lines with the new line
    stateSnapshot.paths.forEach(path => {
        intersectLineLine(path.geometry.p1, path.geometry.p2, axisLine.p1, axisLine.p2).intersections
            .forEach(intersection => {
                workingState.push(
                    composeNewStateForNode(intersection, GRID_NODE_CLASS_NAME, workingState[workingState.length - 1])
                );
            })
    });

    return workingState[workingState.length - 1];
}


// node manipulation; expect access to the file-scoped state object

export function handleNewPath(p1, p2) {
    console.time('new path');
    const currentState = state.get();
    const workingState = [];

    workingState.push(composeNewStateForNode(p1, USER_NODE_CLASS_NAME, currentState, NODE_STATE_COLLECTION));

    if (!p1.equals(p2)) {
        workingState.push(composeNewStateForNode(p2, USER_NODE_CLASS_NAME, workingState[workingState.length - 1]));
        workingState.push(composeNewStateForLine(p1, p2, USER_LINE_CLASS_NAME, workingState[workingState.length - 1]));
    }

    // we only want one state change leading to one history entry, so we store all the stacked changes at once
    state.set(workingState[workingState.length - 1]);

    const validSolution = checkSolution(workingState[workingState.length - 1]);
    console.log('valid solution', !isEmptyObject(validSolution));

    console.timeEnd('new path');

    render(state, groups);
}


export function undo(event) {
    event.stopPropagation();
    event.preventDefault();

    state.rewind(1);
    render(state, groups);
}