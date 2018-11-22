import {
    getNearestNode,
    extendLineCoordinates,
    generateGridLines,
    generateGridNodes,
    composeStateObject,
    createStateId,
    findLine,
    isEmptyObject,
    enableButton,
    disableButton, updateElemClassesForState,
} from './functions';
import { parseAssignment, checkSolution, highlightSolution } from './assignment';
import { render } from './render';
import { intersectLineLine } from './intersections';
import { bootstrap } from './bootstrap';
import StateProvider from './StateProvider';
import {
    API_URL,
    DUPLICATE_NODE_THRESHOLD,
    NODE_GROUP,
    PATH_GROUP,
    WORK_GROUP,
    BACK_GROUP,
    AXIS_LINE_CLASS_NAME,
    USER_LINE_CLASS_NAME,
    NODE_CLASS_NAME,
    GRID_NODE_CLASS_NAME,
    USER_NODE_CLASS_NAME,
    PATH_STATE_COLLECTION,
    NODE_STATE_COLLECTION,
    GRID_LINE_CLASS_NAME,
    API_LOAD_ERROR_TEXT,
    LOG,
    LOCAL_IO,
    SELECTED_NODE_CLASS_NAME,
    SELECTED_LINE_CLASS_NAME,
    LABEL_GROUP,
    API_ITEMS_ENDPOINT,
    API_ERROR_ENDPOINT,
    API_LOAD_TIMEOUT_TEXT,
    API_LOG_ENDPOINT,
    TASK_NODE_CLASS_NAME,
    TASK_LINE_CLASS_NAME,
    FRONTEND_URL,
    EXERCISE_NAME,
    APP_NAME, TIMEOUT, CHANGE_BROWSER_HISTORY,
} from './constants';
import { createLocalInput } from './util';


// bootstrapping

if (LOG) console.time('init');

const ui = {};
const groups = {};

const initialState = {};
initialState[NODE_STATE_COLLECTION] = generateGridNodes(
    new Set([NODE_CLASS_NAME, GRID_NODE_CLASS_NAME]), NODE_STATE_COLLECTION, NODE_GROUP
);
initialState[PATH_STATE_COLLECTION] = generateGridLines(
    new Set([GRID_LINE_CLASS_NAME]), PATH_STATE_COLLECTION, PATH_GROUP
);

const state = new StateProvider(initialState);
const assignments = [];


// init

window.onload = () => {
    const uiBootstrap = bootstrap();
    ui.canvas = uiBootstrap.canvas;
    ui.canvasWrapper = uiBootstrap.canvasWrapper;
    ui.taskText =  uiBootstrap.taskText;
    ui.nextButton = uiBootstrap.nextButton;
    ui.undoButton = uiBootstrap.undoButton;

    groups[BACK_GROUP] = ui.canvas.group().addClass(BACK_GROUP);
    groups[PATH_GROUP] = ui.canvas.group().addClass(PATH_GROUP);
    groups[WORK_GROUP] = ui.canvas.group().addClass(WORK_GROUP);
    groups[NODE_GROUP] = ui.canvas.group().addClass(NODE_GROUP);
    groups[LABEL_GROUP] = ui.canvas.group().addClass(LABEL_GROUP);

    if (LOCAL_IO) createLocalInput();

    getAssignment();
};

if (LOG) console.timeEnd('init');


// present the assignment

export function presentAssignment(index) {
    // compose the state update based on the assignment data
    state.set(parseAssignment(assignments, index, state.get()));

    ui.taskText.textContent = assignments[index].item.text;

    if (CHANGE_BROWSER_HISTORY) {
        // there are some document-scoped variables in use
        const historyStateObj = {html: `${FRONTEND_URL}${url}/${assignments[index].id}`};
        const historyTitle = `${EXERCISE_NAME}: ${assignments[index].name} – ${APP_NAME}`;
        const historyUrl = `/${url}/${assignments[index].id}`;
        if (index === 0) window.history.replaceState(historyStateObj, historyTitle, historyUrl);
        else window.history.pushState(historyStateObj, historyTitle, historyUrl);
        document.title = historyTitle;
    }

    disableButton(ui.nextButton, [nextAssignment]);
    disableButton(ui.undoButton, [undo]);

    // render assignment
    render(state, groups);
}


function getAssignment() {
    function handleError() {
        ui.taskText.textContent = API_LOAD_ERROR_TEXT;
        loadingIndicator.remove();
        logErrorToRemote(requestUrl);
    }

    function handleTimeout() {
        ui.taskText.textContent = API_LOAD_TIMEOUT_TEXT;
        request.open('GET', requestUrl);
        request.send();
        logErrorToRemote(requestUrl);
    }

    function handleLoad() {
        if (LOG) console.log('%cassignment received:', 'color: cornflowerblue', request.status, request.response);
        if (request.status !== 200) {
            handleError();
            return;
        }
        loadingIndicator.remove();

        request.response.items.map(item => {
            assignments.push(item);
        });

        if (assignments.length !== 0) presentAssignment(0);
    }

    // initial render
    render(state, groups);

    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');
    ui.canvasWrapper.appendChild(loadingIndicator);

    // there are some document-scoped variables in use
    const requestUrl = `${API_URL}${API_ITEMS_ENDPOINT}?user=${user}&ps=${ps}&chosenProblem=${chosenProblem}&cookieHash=${cookieHash}&deviceType=${deviceType}&source=${source}`;
    const request = new XMLHttpRequest();
    request.open('GET', requestUrl);
    request.responseType = 'json';
    request.timeout = TIMEOUT;
    request.onerror = handleError;
    request.ontimeout = handleTimeout;
    request.onabort = handleError;
    request.onloadstart = () => {if (LOG) console.log(`%crequesting assignment: ${requestUrl}`, 'color: cornflowerblue')};
    request.onload = handleLoad;
    request.send();
}


// working with the geometry interactions

// todo: className strings and state object identifiers should use constants; then move away as pure, agnostic functions
export function composeNewStateForNode(point, classes, stateSnapshot, label = {}) {
    const nearestNode = getNearestNode(point, stateSnapshot.nodes);
    if (typeof nearestNode.distance === 'undefined') return;

    // node is considered duplicate
    if (nearestNode.distance < DUPLICATE_NODE_THRESHOLD) {
        return Object.assign({}, stateSnapshot, {
            nodes: updateElemClassesForState(stateSnapshot.nodes, nearestNode.node.id, classes)
        })
    }
    // node doesn't exist yet
    const newNodeClasses = classes.add === undefined
        ? new Set([NODE_CLASS_NAME])
        : new Set([NODE_CLASS_NAME].concat(classes.add));
    return Object.assign({}, stateSnapshot, {
        nodes: stateSnapshot.nodes.concat(
            composeStateObject(
                createStateId(NODE_STATE_COLLECTION, stateSnapshot),
                newNodeClasses,
                {p1: point},
                label
            )
        )
    })
}

// todo: className strings and state object identifiers should use constants; then move away as pure, agnostic functions
export function composeNewStateForLine(p1, p2, classes, stateSnapshot, label = {}) {
    const workingState = [];

    // create or update the line which the player just drew

    const foundLines = findLine(p1, p2, stateSnapshot.paths);
    const newPathsStateObject = foundLines.length !== 0
        ? updateElemClassesForState(stateSnapshot.paths, foundLines[0].id, classes)
        : stateSnapshot.paths.concat(
            composeStateObject(
                createStateId(PATH_STATE_COLLECTION, stateSnapshot),
                new Set(classes.add),
                {p1: p1, p2: p2},
                label
            )
        );
    workingState.push(
        Object.assign({}, stateSnapshot, {
            paths: newPathsStateObject
        })
    );

    // create the hinting 'axis line'
    const axisLine = extendLineCoordinates(p1, p2);
    const existingAxisLine = findLine(axisLine.p1, axisLine.p2, workingState[workingState.length - 1][PATH_STATE_COLLECTION]);
    if (existingAxisLine.length === 0) {
        workingState.push(
            Object.assign({}, workingState[workingState.length - 1], {
                paths: workingState[workingState.length - 1].paths.concat(
                    composeStateObject(
                        createStateId(PATH_STATE_COLLECTION, workingState[workingState.length - 1]),
                        new Set([AXIS_LINE_CLASS_NAME]),
                        {p1: axisLine.p1, p2: axisLine.p2}
                    )
                )
            })
        );
    }
    else {
        workingState.push(
            Object.assign({}, workingState[workingState.length - 1], {
                paths: updateElemClassesForState(workingState[workingState.length - 1][PATH_STATE_COLLECTION],
                    existingAxisLine[0].id, {add: [AXIS_LINE_CLASS_NAME]})
            })
        );
    }

    // create or update nodes at intersections of existing lines with the new line
    stateSnapshot[PATH_STATE_COLLECTION].forEach(path => {
        intersectLineLine(path.geometry.p1, path.geometry.p2, axisLine.p1, axisLine.p2).intersections
            .forEach(intersection => {
                workingState.push(
                    composeNewStateForNode(intersection, {add: [GRID_NODE_CLASS_NAME]}, workingState[workingState.length - 1])
                );
            })
    });

    return workingState[workingState.length - 1];
}


// node manipulation; expect access to the file-scoped state object

export function handleNewPath(p1, p2) {
    const currentState = state.get();
    const workingState = [currentState];

    enableButton(ui.undoButton, [undo]);

    workingState.push(composeNewStateForNode(p1, {add: [USER_NODE_CLASS_NAME]}, workingState[workingState.length - 1], NODE_STATE_COLLECTION));

    if (!p1.equals(p2)) {
        workingState.push(composeNewStateForNode(p2, {add: [USER_NODE_CLASS_NAME]}, workingState[workingState.length - 1]));
        workingState.push(composeNewStateForLine(p1, p2, {add: [USER_LINE_CLASS_NAME]}, workingState[workingState.length - 1]));
    }

    const validSolution = checkSolution(workingState[workingState.length - 1]);
    if (!isEmptyObject(validSolution)) {
        handleValidSolution(validSolution);
        workingState.push(highlightSolution(validSolution, workingState[workingState.length - 1]));
    }

    // we only want one state change leading to one history entry, so we store all the stacked changes at once
    state.set(workingState[workingState.length - 1]);

    render(state, groups, isEmptyObject(validSolution));
}


export function handleSelectedElem(p1, p2) {
    const workingState = [state.get()];

    enableButton(ui.undoButton, [undo]);

    if (typeof p2 !== 'undefined') {
        workingState.push(composeNewStateForLine(p1, p2, {toggle: [SELECTED_LINE_CLASS_NAME]}, workingState[workingState.length - 1]));
    }
    else {
        workingState.push(composeNewStateForNode(p1, {toggle: [SELECTED_NODE_CLASS_NAME]}, workingState[workingState.length - 1]));
    }

    const validSolution = checkSolution(workingState[workingState.length - 1]);
    if (!isEmptyObject(validSolution)) {
        handleValidSolution(validSolution);
        workingState.push(highlightSolution(validSolution, workingState[workingState.length - 1]));
    }

    state.set(workingState[workingState.length - 1]);
    render(state, groups, isEmptyObject(validSolution));
}


function handleValidSolution(solution) {
    console.log('%cvalid solution:', 'color: wheat', solution);

    const stateSnapshot = state.get();

    const nodesCount = stateSnapshot[NODE_STATE_COLLECTION].filter(node => (
        node.classes.has(USER_NODE_CLASS_NAME) || node.classes.has(TASK_NODE_CLASS_NAME) || node.classes.has(SELECTED_NODE_CLASS_NAME)
    )).length;
    const pathsCount = stateSnapshot[PATH_STATE_COLLECTION].filter(path => (
        path.classes.has(TASK_LINE_CLASS_NAME) || path.classes.has(USER_LINE_CLASS_NAME) || path.classes.has(SELECTED_LINE_CLASS_NAME)
    )).length;

    logSolutionToRemote(stateSnapshot.id, nodesCount + pathsCount, state.getOperationsCount(), Date.now() - stateSnapshot.startTime);

    enableButton(ui.nextButton, [nextAssignment]);
    disableButton(ui.undoButton, [undo]);
}


export function undo(event) {
    event.stopPropagation();
    event.preventDefault();

    state.rewind(1);

    if (state.length === 2) disableButton(ui.undoButton, [undo]);

    render(state, groups);
}


export function nextAssignment(event) {
    event.stopPropagation();
    event.preventDefault();
    handleAssignment();
}


export function handleAssignment(assignment) {
    const stateSnapshot = Object.assign({}, state.get(), {});
    state.wipe();

    if (typeof assignment === 'undefined') {
        if (assignments.length > stateSnapshot.index + 1) presentAssignment(stateSnapshot.index + 1);
        else {
            // document-scoped function and variable
            showFinalBoardEndSet(mode);
        }
    }
    else {
        assignments.map(() => assignments.pop());
        assignments.push({
            item: assignment,
            id: 0,
            explanation: '',
            name: assignment.text,
        });
        presentAssignment(0)
    }
}


function logSolutionToRemote(itemId, geometryCount, moves, responseTime) {
    function handleTimeout() {
        request.open('GET', url);
        request.send();
        logErrorToRemote(url);
    }

    const url = `${API_URL}${API_LOG_ENDPOINT}?ps=${ps}&user=${user}&item=${itemId}&answer=${geometryCount}&correct=1&moves=${moves}&responseTime=${responseTime}&cookieHash=${cookieHash}&deviceType=${deviceType}`;
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.timeout = TIMEOUT;
    request.onerror = () => {logErrorToRemote(url)};
    request.ontimeout = handleTimeout;
    request.onabort = () => {logErrorToRemote(url)};
    request.onloadstart = () => {if (LOG) console.log(`%clogging solution: ${url}`, 'color: wheat')};
    request.onload = () => {if (LOG && request.status === 200) console.log(`%csolution logged`, 'color: wheat')};
    request.send();
}


function logErrorToRemote(error) {
    const errorLogUrl = `${API_URL}${API_ERROR_ENDPOINT}?user=${user}&description=${encodeURIComponent(error)}`;
    const errorRequest = new XMLHttpRequest();
    errorRequest.open('GET', errorLogUrl);
    errorRequest.send();
}