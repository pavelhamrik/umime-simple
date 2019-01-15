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
    disableButton,
    updateElemForState,
    countGeometry,
    flashButton,
    deleteFromSet,
    enableKeyboardShortcuts,
    disableKeyboardShortcuts,
    splitOrCombineLinesWithLine,
} from './functions';
import { parseAssignment, checkSolution, highlightSolution, parseKatex, getConfigValue } from './assignment';
import { render } from './render';
import { intersectLineLine } from './intersections';
import { bootstrap } from './bootstrap';
import StateProvider from './StateProvider';
import {
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
    SELECTED_NODE_CLASS_NAME,
    SELECTED_LINE_CLASS_NAME,
    LABEL_GROUP,
    API_LOAD_TIMEOUT_TEXT,
    FRONTEND_URL,
    EXERCISE_NAME,
    APP_NAME,
    TIMEOUT,
    ACCEPTABLE_SOLUTION_NODE_CLASSES,
    ACCEPTABLE_SOLUTION_LINE_CLASSES,
    LIMITED_USER_NODE_CLASSES,
    LIMITED_USER_LINE_CLASSES,
    FLASH_BUTTON_CLASS_NAME,
    RESET_BUTTON_TEST,
    AUX_LINE_CLASS_NAME, TASK_LINE_CLASS_NAME,
} from './constants';
import { createLocalInput } from './util';
import { logToRemote, logErrorToRemote } from './remoteLogging';
import GAUtils from '../utils/googleAnalytics';


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

function init() {
    const uiBootstrap = bootstrap();
    ui.canvas = uiBootstrap.canvas;
    ui.canvasWrapper = uiBootstrap.canvasWrapper;
    ui.taskText =  uiBootstrap.taskText;
    ui.nextButton = uiBootstrap.nextButton;
    ui.undoButton = uiBootstrap.undoButton;
    ui.resetButton = uiBootstrap.resetButton;

    groups[BACK_GROUP] = ui.canvas.group().addClass(BACK_GROUP);
    groups[PATH_GROUP] = ui.canvas.group().addClass(PATH_GROUP);
    groups[WORK_GROUP] = ui.canvas.group().addClass(WORK_GROUP);
    groups[NODE_GROUP] = ui.canvas.group().addClass(NODE_GROUP);
    groups[LABEL_GROUP] = ui.canvas.group().addClass(LABEL_GROUP);

    if (LOCAL_IO) createLocalInput();

    getAssignment();
}
window.addEventListener('load', init);

if (LOG) console.timeEnd('init');


// present the assignment

export function presentAssignment(index) {
    // compose the state update based on the assignment data
    const assignment = parseAssignment(assignments, index, state.get());
    state.set(assignment);
    logToRemote(assignment.id);

    ui.taskText.innerHTML = parseKatex(assignments[index].item.text);

    if (CHANGE_BROWSER_HISTORY) {
        // there are some document-scoped variables in use
        const historyStateObj = {html: `${FRONTEND_URL}${url}/${assignments[index].id}`};
        const historyTitle = `${EXERCISE_NAME}: ${assignments[index].name} – ${APP_NAME}`;
        const historyUrl = `/${url}/${assignments[index].id}`;
        if (index === 0) window.history.replaceState(historyStateObj, historyTitle, historyUrl);
        else window.history.pushState(historyStateObj, historyTitle, historyUrl);
        document.title = historyTitle;
    }

    if (index > 0) {
        GAUtils.getTestVariant(RESET_BUTTON_TEST.name, false);
        GAUtils.sendPageView();
    }

    disableButton(ui.nextButton, [nextAssignment]);
    disableButton(ui.undoButton, [undo]);
    disableButton(ui.resetButton, [reset]);
    disableKeyboardShortcuts([
        handleUndoKeyboardShortcut,
        handleResetKeyboardShortcut,
        handleNextAssignmentKeyboardShortcut
    ]);

    render(state, groups);
}


function getAssignment() {
    function handleError() {
        ui.taskText.innerHTML = API_LOAD_ERROR_TEXT;
        loadingIndicator.remove();
        logErrorToRemote(requestUrl);
    }

    function handleTimeout() {
        ui.taskText.innerHTML = API_LOAD_TIMEOUT_TEXT;
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

export function composeNewStateForNode(point, classes, stateSnapshot, label = {}) {
    const nearestNode = getNearestNode(point, stateSnapshot.nodes);
    if (typeof nearestNode.distance === 'undefined') return;

    // node is considered duplicate
    if (nearestNode.distance < DUPLICATE_NODE_THRESHOLD) {
        return Object.assign({}, stateSnapshot, {
            nodes: updateElemForState(stateSnapshot.nodes, nearestNode.node.id, classes, state.length + 1, label)
        })
    }
    // node doesn't exist yet
    const newNodeClasses = classes.add === undefined
        ? new Set([NODE_CLASS_NAME])
        : new Set([NODE_CLASS_NAME].concat(classes.add));
    return Object.assign({}, stateSnapshot, {
        nodes: stateSnapshot.nodes.concat(
            composeStateObject(createStateId(NODE_STATE_COLLECTION, stateSnapshot), newNodeClasses, {p1: point}, state.length + 1, label)
        )
    })
}

export function composeNewStateForLine(p1, p2, classes, stateSnapshot, label = {}) {
    if (LOG) console.time('composeNewStateForLine');

    const workingState = [stateSnapshot];

    // create or update the line which the player just drew

    const foundLines = findLine(p1, p2, workingState[workingState.length - 1].paths);
    const newPathsStateObject = foundLines.length !== 0
        ? updateElemForState(workingState[workingState.length - 1].paths, foundLines[0].id, classes, state.length + 1, label)
        : workingState[workingState.length - 1].paths.concat(
            composeStateObject(
                createStateId(PATH_STATE_COLLECTION, workingState[workingState.length - 1]),
                new Set(classes.add),
                {p1: p1, p2: p2},
                state.length + 1,
                label
            )
        );
    workingState.push(
        Object.assign({}, workingState[workingState.length - 1], {
            paths: newPathsStateObject
        })
    );

    const auxLines = splitOrCombineLinesWithLine(p1, p2, stateSnapshot.paths, classes);
    const auxPathsStateObject = auxLines
        .map(line => {
            console.log(line);
            return line;
        })
        .filter(line => findLine(line.geometry.p1, line.geometry.p2, workingState[workingState.length - 1].paths).length === 0)
        .map(line => composeStateObject(
            createStateId(PATH_STATE_COLLECTION, workingState[workingState.length - 1]),
            new Set([AUX_LINE_CLASS_NAME]),
            {p1: line.geometry.p1, p2: line.geometry.p2},
            state.length + 1,
        )
    );
    workingState.push(
        Object.assign({}, workingState[workingState.length - 1], {
            paths: workingState[workingState.length - 1].paths.concat(auxPathsStateObject)
        })
    );

    const auxPathsUpdatedLinesStateObject = auxLines
        .reduce((acc, line) => {
            const existingLines = findLine(line.geometry.p1, line.geometry.p2, workingState[workingState.length - 1].paths);
            if (existingLines.length !== 0) {
                return updateElemForState(acc, existingLines[0].id, {add: [AUX_LINE_CLASS_NAME]}, state.length + 1);
            }
            return acc;
        }, workingState[workingState.length - 1].paths);
    workingState.push(
        Object.assign({}, workingState[workingState.length - 1], {
            paths: auxPathsUpdatedLinesStateObject
        })
    );

    // create the hinting 'axis line'
    const axisLine = extendLineCoordinates(p1, p2);
    const existingAxisLine = findLine(axisLine.p1, axisLine.p2, workingState[workingState.length - 1][PATH_STATE_COLLECTION]);
    if (existingAxisLine.length === 0) {
        workingState.push(
            Object.assign({}, workingState[workingState.length - 1], {
                paths: workingState[workingState.length - 1].paths.concat(
                    composeStateObject(createStateId(PATH_STATE_COLLECTION, workingState[workingState.length - 1]), new Set([AXIS_LINE_CLASS_NAME]), {
                        p1: axisLine.p1,
                        p2: axisLine.p2
                    }, state.length + 1)
                )
            })
        );
    }
    else {
        workingState.push(
            Object.assign({}, workingState[workingState.length - 1], {
                paths: updateElemForState(
                    workingState[workingState.length - 1][PATH_STATE_COLLECTION],
                    existingAxisLine[0].id,
                    {add: [AXIS_LINE_CLASS_NAME]},
                    state.length + 1,
                    label
                )
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

    if (LOG) console.timeEnd('composeNewStateForLine');

    return workingState[workingState.length - 1];
}


// node manipulation; expect access to the file-scoped state object

export function handleNewPath(p1, p2) {
    const currentState = state.get();
    const workingState = [currentState];

    if (!p1.equals(p2)) {
        workingState.push(composeNewStateForNode(p1, {add: [USER_NODE_CLASS_NAME]}, workingState[workingState.length - 1]));
        workingState.push(composeNewStateForNode(p2, {add: [USER_NODE_CLASS_NAME]}, workingState[workingState.length - 1]));
        workingState.push(composeNewStateForLine(p1, p2, {add: [USER_LINE_CLASS_NAME]}, workingState[workingState.length - 1]));
    }
    else {
        const classes = currentState.config.uiOnlySelect
            ? {add: [USER_NODE_CLASS_NAME, SELECTED_NODE_CLASS_NAME]}
            : {add: [USER_NODE_CLASS_NAME]};
        workingState.push(composeNewStateForNode(p1, classes, workingState[workingState.length - 1]));
    }

    handleGeometryChange(workingState[workingState.length - 1]);
}


export function handleSelectedElem(p1, p2) {
    const stateSnapshot = Object.assign({}, state.get(), {});

    const updatedState = typeof p2 !== 'undefined'
        ? composeNewStateForLine(p1, p2, {toggle: [SELECTED_LINE_CLASS_NAME]}, stateSnapshot)
        : composeNewStateForNode(p1, {toggle: [SELECTED_NODE_CLASS_NAME]}, stateSnapshot);

    handleGeometryChange(updatedState);
}


function handleGeometryChange(stateSnapshot) {
    enableButton(ui.undoButton, [undo]);
    enableButton(ui.resetButton, [reset]);
    enableKeyboardShortcuts([handleUndoKeyboardShortcut, handleResetKeyboardShortcut]);

    const workingState = [stateSnapshot];

    const validSolution = checkSolution(workingState[workingState.length - 1]);
    const geometryMaxed = isGeometryMaxed(workingState[workingState.length - 1]);

    if (geometryMaxed.diff > 0 || (geometryMaxed.isMaxed && isEmptyObject(validSolution))) {
        flashButton(ui.undoButton);
        flashButton(ui.resetButton);
    }

    if (geometryMaxed.diff > 0) return;

    if (!isEmptyObject(validSolution)) {
        handleValidSolution(validSolution);
        workingState.push(highlightSolution(validSolution, workingState[workingState.length - 1]));
    }

    state.set(workingState[workingState.length - 1]);
    render(state, groups, isEmptyObject(validSolution));
}


function isGeometryMaxed(stateSnaphot) {
    const { config = {} } = stateSnaphot;
    const { maxUserNodes, maxUserLines } = config;

    if (typeof maxUserNodes === 'undefined' && typeof maxUserLines === 'undefined') return {
        isMaxed: false,
        diff: undefined,
    };

    // counting lines first, typically expecting fewer lines then nodes; then early return
    const acceptableLineClasses = getConfigValue('uiEvalSegmentsAsLines', stateSnaphot)
        ? deleteFromSet(LIMITED_USER_LINE_CLASSES, USER_LINE_CLASS_NAME).add(AXIS_LINE_CLASS_NAME)
        : LIMITED_USER_LINE_CLASSES;
    const linesCount = countGeometry(
        stateSnaphot[PATH_STATE_COLLECTION],
        acceptableLineClasses,
    );

    if (typeof maxUserLines !== 'undefined' && linesCount >= maxUserLines) return {
        isMaxed: true,
        diff: linesCount - maxUserLines,
    };

    const nodesCount = countGeometry(
        stateSnaphot[NODE_STATE_COLLECTION],
        LIMITED_USER_NODE_CLASSES,
    );

    return {
        isMaxed: typeof maxUserNodes !== 'undefined' && nodesCount >= maxUserNodes,
        diff: nodesCount - maxUserNodes,
    };
}


function handleValidSolution(solution) {
    if (LOG) console.log('%cvalid solution:', 'color: wheat', solution);

    const stateSnapshot = Object.assign({}, state.get(), {});

    const nodesCount = countGeometry(stateSnapshot[NODE_STATE_COLLECTION], ACCEPTABLE_SOLUTION_NODE_CLASSES);
    const pathsCount = countGeometry(stateSnapshot[NODE_STATE_COLLECTION], ACCEPTABLE_SOLUTION_LINE_CLASSES);

    logToRemote(stateSnapshot.id, {
        geometryCount: nodesCount + pathsCount,
        moves: state.getOperationsCount(),
        responseTime: Date.now() - stateSnapshot.startTime,
        correct: 1,
    });

    enableButton(ui.nextButton, [nextAssignment]);
    enableKeyboardShortcuts([handleNextAssignmentKeyboardShortcut]);

    disableButton(ui.undoButton, [undo]);
    disableButton(ui.resetButton, [reset]);
    disableKeyboardShortcuts([handleUndoKeyboardShortcut, handleResetKeyboardShortcut]);
}


export function undo(event) {
    event.stopPropagation();
    event.preventDefault();

    if (typeof this !== 'undefined' && typeof this.blur === 'function') this.blur();

    GAUtils.sendEvent({action: 'Undo button click', label: 'Mrizkovana'});

    state.rewind(1);
    handleRewindUIChanges();
}


export function reset(event) {
    event.stopPropagation();
    event.preventDefault();

    if (typeof this !== 'undefined' && typeof this.blur === 'function') this.blur();

    GAUtils.sendEvent({action: 'Reset button click', label: 'Mrizkovana'});

    state.rewind(state.length - 2);
    handleRewindUIChanges();
}


function handleRewindUIChanges() {
    ui.undoButton.classList.remove(FLASH_BUTTON_CLASS_NAME);
    if (ui.resetButton) ui.resetButton.classList.remove(FLASH_BUTTON_CLASS_NAME);

    if (state.length === 2) {
        disableButton(ui.undoButton, [undo]);
        disableButton(ui.resetButton, [reset]);
        disableKeyboardShortcuts([handleUndoKeyboardShortcut, handleResetKeyboardShortcut]);
    }

    render(state, groups);
}


function handleUndoKeyboardShortcut(event) {
    if (event.code === 'KeyZ') undo(event);
}

function handleResetKeyboardShortcut(event) {
    if (event.code === 'KeyR') reset(event);
}

function handleNextAssignmentKeyboardShortcut(event) {
    if ((event.code === 'Space' || event.code === 'Enter') && event.target === document.body) {
        event.stopPropagation();
        event.preventDefault();
        nextAssignment(event);
    }
}


export function nextAssignment(event) {
    event.stopPropagation();
    event.preventDefault();

    if (typeof this !== 'undefined' && typeof this.blur === 'function') this.blur();

    GAUtils.sendEvent({action: 'Next button click', label: 'Mrizkovana'});

    handleAssignment();
}


export function handleAssignment(assignment) {
    const stateSnapshot = Object.assign({}, state.get(), {});
    state.wipe();

    if (typeof assignment === 'undefined' || isEmptyObject(assignment)) {
        if (assignments.length > stateSnapshot.index + 1) presentAssignment(stateSnapshot.index + 1);
        else {
            // document-scoped function and variable
            showFinalBoardEndSet(mode);
        }
    }
    else {
        Array.from(assignments).forEach(() => assignments.pop());
        assignments.push({
            item: assignment,
            id: 0,
            explanation: '',
            name: assignment.text,
        });
        presentAssignment(0);
    }
}
