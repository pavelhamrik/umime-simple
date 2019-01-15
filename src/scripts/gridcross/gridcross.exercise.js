import {countGeometry, generateGridLines, generateGridNodes, isGeometryMaxed,} from './geometry';
import {checkSolution, highlightSolution, parseAssignment, parseKatex} from './assignment';
import {render} from './render';
import {bootstrap} from './bootstrap';
import StateProvider from './StateProvider';
import {
    ACCEPTABLE_SOLUTION_LINE_CLASSES,
    ACCEPTABLE_SOLUTION_NODE_CLASSES,
    API_LOAD_ERROR_TEXT,
    API_LOAD_TIMEOUT_TEXT,
    APP_NAME,
    BACK_GROUP,
    EXERCISE_NAME,
    FLASH_BUTTON_CLASS_NAME,
    FRONTEND_URL,
    GRID_LINE_CLASS_NAME,
    GRID_NODE_CLASS_NAME,
    LABEL_GROUP,
    NODE_CLASS_NAME,
    NODE_GROUP,
    NODE_STATE_COLLECTION,
    PATH_GROUP,
    PATH_STATE_COLLECTION,
    RESET_BUTTON_TEST,
    SELECTED_LINE_CLASS_NAME,
    SELECTED_NODE_CLASS_NAME,
    TIMEOUT,
    USER_LINE_CLASS_NAME,
    USER_NODE_CLASS_NAME,
    WORK_GROUP,
} from './constants';
import {
    disableButton,
    disableKeyboardShortcuts,
    enableButton,
    enableKeyboardShortcuts,
    flashButton,
    isEmptyObject
} from './utils';
import {logErrorToRemote, logToRemote} from './remoteLogging';
import GAUtils from '../utils/googleAnalytics';
import {createLocalInput} from './localIO';
import {composeNewStateForLine, composeNewStateForNode} from './state';


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

export const state = new StateProvider(initialState);
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
