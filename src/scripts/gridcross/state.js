import {
    composeStateObject, constructAuxLinesForLine,
    constructAuxLinesForPoint,
    createStateId,
    extendLineCoordinates,
    findLine,
    getNearestNode,
    getUniquePoints,
    updateElemForState
} from './geometry';
import {
    AUX_LINE_CLASS,
    AUX_NODE_CLASS,
    AXIS_LINE_CLASS,
    DUPLICATE_NODE_TOLERANCE,
    GRID_NODE_CLASS,
    NODE_CLASS,
    NODE_STATE_COLLECTION,
    PATH_STATE_COLLECTION,
    TASK_LINE_CLASS,
    USER_LINE_CLASS,
    USER_NODE_CLASS
} from './constants';
import {intersectLineLine} from './intersections';
import {state} from './gridcross.exercise';
import {arrayIncludes, setIncludes} from './utils';

export function composeNewStateForNode(point, classes, stateSnapshot, label = {}) {
    const workingState = [stateSnapshot];

    const nearestNode = getNearestNode(point, stateSnapshot.nodes);
    if (typeof nearestNode.distance === 'undefined') return;

    // update existing node or create a new one

    if (nearestNode.distance < DUPLICATE_NODE_TOLERANCE) {
        const stateUpdate = Object.assign({}, stateSnapshot, {
            nodes: updateElemForState(stateSnapshot.nodes, nearestNode.node.id, classes, state.length + 1, label)
        });
        workingState.push(stateUpdate);
    }
    else {
        const newNodeClasses = typeof classes.add !== 'undefined'
            ? new Set(classes.add.concat(NODE_CLASS))
            : new Set([NODE_CLASS]);
        console.log(newNodeClasses);
        const stateUpdate = Object.assign({}, workingState[workingState.length - 1], {
            nodes: workingState[workingState.length - 1].nodes.concat(
                composeStateObject(
                    createStateId(NODE_STATE_COLLECTION, workingState[workingState.length - 1]),
                    newNodeClasses,
                    {p1: point},
                    state.length + 1,
                    label
                )
            )
        });
        workingState.push(stateUpdate);
    }

    if (typeof classes.add !== 'undefined' && arrayIncludes(classes.add, [USER_NODE_CLASS, AUX_NODE_CLASS])) {
        const auxLines = constructAuxLinesForPoint(point, workingState[workingState.length - 1].paths);
        const auxStateUpdate = composeNewStateForAuxLines(auxLines, workingState[workingState.length - 1]);
        workingState.push(auxStateUpdate);
    }

    return workingState[workingState.length - 1];
}

export function composeNewStateForAuxLines(lines, stateSnapshot) {
    if (lines.length === 0) return stateSnapshot;

    const workingState = [stateSnapshot];

    lines.forEach(line => {
        const existingLines = findLine(line.geometry.p1, line.geometry.p2, workingState[workingState.length - 1].paths);
        if (existingLines.length === 0) {
            // console.log('auxing: creating new line');
            const newLine = composeStateObject(
                createStateId(PATH_STATE_COLLECTION, workingState[workingState.length - 1]),
                new Set([AUX_LINE_CLASS]),
                {p1: line.geometry.p1, p2: line.geometry.p2},
                state.length + 1,
            );
            workingState.push(
                Object.assign({}, workingState[workingState.length - 1], {
                    paths: workingState[workingState.length - 1].paths.concat(newLine)
                })
            );
        }
        else {
            existingLines.forEach(line => {
                // console.log('auxing: existing line found');
                const updatedPathState = updateElemForState(
                    workingState[workingState.length - 1].paths,
                    line.id,
                    {add: [AUX_LINE_CLASS]},
                    state.length + 1,
                );
                workingState.push(
                    Object.assign({}, workingState[workingState.length - 1], {
                        paths: updatedPathState
                    })
                );
            })
        }
    });

    return workingState[workingState.length - 1];
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

    // create the hinting 'axis line'

    const axisLine = extendLineCoordinates(p1, p2);
    const existingAxisLine = findLine(axisLine.p1, axisLine.p2, workingState[workingState.length - 1][PATH_STATE_COLLECTION]);
    if (existingAxisLine.length === 0) {
        workingState.push(
            Object.assign({}, workingState[workingState.length - 1], {
                paths: workingState[workingState.length - 1].paths.concat(
                    composeStateObject(createStateId(PATH_STATE_COLLECTION, workingState[workingState.length - 1]), new Set([AXIS_LINE_CLASS]), {
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
                    {add: [AXIS_LINE_CLASS]},
                    state.length + 1,
                    label
                )
            })
        );
    }

    // connect segments of existing lines if the new line bridges them

    const auxLines = constructAuxLinesForLine(p1, p2, workingState[workingState.length - 1]);
    const auxStateUpdate = composeNewStateForAuxLines(auxLines, workingState[workingState.length - 1]);
    workingState.push(auxStateUpdate);

    // create or update nodes at intersections of existing lines with the new line

    stateSnapshot[PATH_STATE_COLLECTION].forEach(path => {
    // workingState[workingState.length - 1].paths.forEach(path => {
        intersectLineLine(path.geometry.p1, path.geometry.p2, axisLine.p1, axisLine.p2).intersections
            .forEach(intersection => {
                const intersectionClasses = (setIncludes(path.classes, [TASK_LINE_CLASS, USER_LINE_CLASS, AUX_LINE_CLASS])
                    && getUniquePoints([path.geometry.p1, path.geometry.p2, intersection]).length === 2)
                    ? {add: [GRID_NODE_CLASS, AUX_NODE_CLASS]}
                    : {add: [GRID_NODE_CLASS]};
                workingState.push(
                    composeNewStateForNode(intersection, intersectionClasses, workingState[workingState.length - 1])
                );
            })
    });

    // stateSnapshot[PATH_STATE_COLLECTION].forEach(path => {
    //     intersectLineLine(path.geometry.p1, path.geometry.p2, axisLine.p1, axisLine.p2).intersections
    //         .forEach(intersection => {
    //             workingState.push(
    //                 composeNewStateForNode(intersection, {add: [GRID_NODE_CLASS]}, workingState[workingState.length - 1])
    //             );
    //         })
    // });

    if (LOG) console.timeEnd('composeNewStateForLine');

    return workingState[workingState.length - 1];
}