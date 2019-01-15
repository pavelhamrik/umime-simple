import {
    composeStateObject,
    createStateId,
    extendLineCoordinates,
    findLine,
    getNearestNode,
    splitOrCombineLinesWithLine,
    updateElemForState
} from './geometry';
import {
    AUX_LINE_CLASS_NAME,
    AXIS_LINE_CLASS_NAME,
    DUPLICATE_NODE_THRESHOLD,
    GRID_NODE_CLASS_NAME,
    NODE_CLASS_NAME,
    NODE_STATE_COLLECTION,
    PATH_STATE_COLLECTION
} from './constants';
import {intersectLineLine} from './intersections';
import {state} from './gridcross.exercise';

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