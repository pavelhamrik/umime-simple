import {
    getNearestNode,
    extendLineCoordinates,
    generateGridLines,
    generateGridNodes,
    render,
    updateElemClassInObject,
    composeStateObject,
    createStateId,
    findLine,
    parseAssignment,
} from './functions';
import { intersectLineLine } from './intersections';
import { bootstrap } from './bootstrap';
import StateProvider from './StateProvider';
import {
    API_URL,
    DUPLICATE_NODE_THRESHOLD,
    LINE, NODE, NODE_GROUP, PATH_GROUP, WORK_GROUP,
} from './constants';


// bootstrapping

const { canvas, loadingIndicator } = bootstrap();

// these won't change, so we won't store them in the state
const groups = {};
groups[PATH_GROUP] = canvas.group().addClass(PATH_GROUP);
groups[WORK_GROUP] = canvas.group().addClass(WORK_GROUP);
groups[NODE_GROUP] = canvas.group().addClass(NODE_GROUP);

const initialState = {
    'nodes': generateGridNodes('node gridnode', 'nodes', NODE_GROUP),
    'paths': generateGridLines('gridline', 'paths', PATH_GROUP),
};

const state = new StateProvider(initialState);

function getAssignment() {
    const request = new XMLHttpRequest();
    request.open('GET', API_URL);
    request.responseType = 'json';
    request.send();
    request.onload = function() {
        // compose the state update based on the assignment data
        state.set(parseAssignment(request.response, state.get()));

        loadingIndicator.remove();

        // initial render
        render(state, groups);
    };
}

getAssignment();


// working with the geometry interactions

// todo: className strings and state object identifiers should use constants; then move away as pure, agnostic functions
export function composeNewStateForNode(point, className, stateSnapshot) {
    const nearestNode = getNearestNode(point, stateSnapshot.nodes);
    if (typeof nearestNode.distance === 'undefined') return;

    // node is considered duplicate
    if (nearestNode.distance < DUPLICATE_NODE_THRESHOLD) {
        if (className === undefined) return stateSnapshot;
        return Object.assign({}, stateSnapshot, {
            nodes: updateElemClassInObject(stateSnapshot.nodes, nearestNode.node.id, className)
        })
    }
    // node doesn't exist yet
    const newNodeClassName = className === undefined ? 'node' : className;
    return Object.assign({}, stateSnapshot, {
        nodes: stateSnapshot.nodes.concat(
            composeStateObject(
                createStateId('nodes', stateSnapshot),
                NODE, newNodeClassName, 'nodes', NODE_GROUP, {p1: point}
            )
        )
    })
}

// todo: className strings and state object identifiers should use constants; then move away as pure, agnostic functions
export function composeNewStateForLine(p1, p2, className = 'userline', stateSnapshot) {
    if (findLine(p1, p2, stateSnapshot['paths']).length !== 0) return stateSnapshot;
    const workingState = [];

    // create the line which the player just drew
    workingState.push(
        Object.assign({}, stateSnapshot, {
            paths: stateSnapshot.paths.concat(
                composeStateObject(
                    createStateId('paths', stateSnapshot),
                    LINE, className, 'lines', NODE_GROUP, {p1: p1, p2: p2}
                )
            )
        })
    );

    // create the hinting 'axisline'
    const axisLine = extendLineCoordinates(p1, p2);
    if (findLine(axisLine.p1, axisLine.p2, workingState[workingState.length - 1]['paths']).length === 0) {
        workingState.push(
            Object.assign({}, workingState[workingState.length - 1], {
                paths: workingState[workingState.length - 1].paths.concat(
                    composeStateObject(
                        createStateId('paths', stateSnapshot),
                        LINE, 'axisline', 'lines', NODE_GROUP, {p1: axisLine.p1, p2: axisLine.p2}
                    )
                )
            })
        );
    }

    // create or update nodes at intersections of existing lines with the new line
    stateSnapshot.paths.forEach(path => {
        intersectLineLine(path.geometry.p1, path.geometry.p2, axisLine.p1, axisLine.p2).intersections
            .forEach(intersection => {
                const className = path.className.indexOf('userline') !== -1 ? 'node usernode' : undefined;
                workingState.push(
                    composeNewStateForNode(intersection, className, workingState[workingState.length - 1])
                );
            })
    });

    return workingState[workingState.length - 1];
}


// node manipulation; expect access to the file-scoped state object

export function handleNewPath(p1, p2) {
    const currentState = state.get();
    const workingState = [];

    workingState.push(composeNewStateForNode(p1, 'node usernode', currentState, 'nodes'));

    if (!p1.equals(p2)) {
        workingState.push(composeNewStateForNode(p2, 'node usernode', workingState[workingState.length - 1]));
        workingState.push(composeNewStateForLine(p1, p2, 'userline', workingState[workingState.length - 1]));
    }

    // we only want one state change leading to one history entry, so we store all the stacked changes at once
    state.set(workingState[workingState.length - 1]);

    render(state, groups);
}


export function undo(event) {
    event.stopPropagation();
    event.preventDefault();

    state.rewind(1);
    render(state, groups);
}