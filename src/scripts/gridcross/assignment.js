import {
    AXIS_LINE_CLASS_NAME,
    CONFIG_STATE_COLLECTION,
    LOG,
    NODE_STATE_COLLECTION,
    PATH_STATE_COLLECTION, SELECTED_LINE_CLASS_NAME, SELECTED_NODE_CLASS_NAME,
    SOLUTION_STATE_COLLECTION,
    SOLVED_LINE_CLASS_NAME,
    SOLVED_NODE_CLASS_NAME,
    TASK_LINE_CLASS_NAME,
    TASK_NODE_CLASS_NAME,
    USER_LINE_CLASS_NAME,
    USER_NODE_CLASS_NAME
} from './constants';
import Point from './Point';
import { extendLineCoordinates, findLine, toCanvasCoord } from './functions';
import { composeNewStateForLine, composeNewStateForNode } from './gridcross.exercise';
import { isSubsegment } from './intersections';


export function parseAssignmentBundle(json) {

}


export function parseAssignment(assignments, index, stateSnapshot) {
    const workingState = [stateSnapshot];

    workingState.push(Object.assign({}, workingState[workingState.length - 1], {
        id: assignments[index].id,
        name: assignments[index].name,
        text: assignments[index].item.text,
        explanation: assignments[index].explanation,
        index: index,
        startTime: Date.now(),
    }));

    const assignment = assignments[index].item;

    if (typeof assignment.problem.points !== 'undefined') {
        assignment.problem.points.forEach(point => {
            workingState.push(
                composeNewStateForNode(
                    new Point(
                        toCanvasCoord(point.geometry[0]),
                        toCanvasCoord(point.geometry[1])
                    ),
                    {add: [TASK_NODE_CLASS_NAME]},
                    workingState[workingState.length - 1],
                    point.label
                )
            );
        });
    }

    if (typeof assignment.problem.segments !== 'undefined') {
        assignment.problem.segments.forEach(line => {
            const p1 = new Point(
                toCanvasCoord(line.geometry[0][0]),
                toCanvasCoord(line.geometry[0][1])
            );
            const p2 = new Point(
                toCanvasCoord(line.geometry[1][0]),
                toCanvasCoord(line.geometry[1][1])
            );

            workingState.push(
                composeNewStateForLine(
                    p1, p2,
                    {add: [TASK_LINE_CLASS_NAME]},
                    workingState[workingState.length - 1],
                    line.label
                )
            );
            workingState.push(
                composeNewStateForNode(
                    p1,
                    {add: [TASK_NODE_CLASS_NAME]},
                    workingState[workingState.length - 1]
                )
            );
            workingState.push(
                composeNewStateForNode(
                    p2,
                    {add: [TASK_NODE_CLASS_NAME]},
                    workingState[workingState.length - 1]
                )
            );
        });
    }

    if (typeof assignment.problem.lines !== 'undefined') {
        assignment.problem.lines.forEach(line => {
            const {p1, p2} = extendLineCoordinates(
                new Point(
                    toCanvasCoord(line.geometry[0][0]),
                    toCanvasCoord(line.geometry[0][1])
                ),
                new Point(
                    toCanvasCoord(line.geometry[1][0]),
                    toCanvasCoord(line.geometry[1][1])
                )
            );

            workingState.push(
                composeNewStateForLine(
                    p1, p2,
                    {add: [TASK_LINE_CLASS_NAME]},
                    workingState[workingState.length - 1],
                    line.label
                )
            );
        });
    }

    workingState[workingState.length - 1][SOLUTION_STATE_COLLECTION] = assignment.solutions.map(solution => {
        const transformed = {};

        if (typeof solution.points !== 'undefined') {
            transformed[NODE_STATE_COLLECTION] = solution.points.map(point => (
                new Point(
                    toCanvasCoord(point[0]),
                    toCanvasCoord(point[1])
                )
            ));
        }

        transformed[PATH_STATE_COLLECTION] = [];

        transformed[PATH_STATE_COLLECTION] = transformed[PATH_STATE_COLLECTION]
            .concat(typeof solution.segments !== 'undefined'
                ? solution.segments.map(path => (
                    {
                        p1: new Point(
                            toCanvasCoord(path[0][0]),
                            toCanvasCoord(path[0][1])
                        ),
                        p2: new Point(
                            toCanvasCoord(path[1][0]),
                            toCanvasCoord(path[1][1])
                        ),
                    }
                ))
                : []
            );

        transformed[PATH_STATE_COLLECTION] = transformed[PATH_STATE_COLLECTION]
            .concat(typeof solution.lines !== 'undefined'
                ? solution.lines.map(path => (
                    extendLineCoordinates(
                        new Point(
                            toCanvasCoord(path[0][0]),
                            toCanvasCoord(path[0][1])
                        ),
                        new Point(
                            toCanvasCoord(path[1][0]),
                            toCanvasCoord(path[1][1])
                        )
                    )
                ))
                : []
            );

        return transformed;
    });

    workingState[workingState.length - 1][CONFIG_STATE_COLLECTION] = typeof assignment.config !== 'undefined' ? assignment.config : {};

    return workingState[workingState.length - 1];
}


export function checkSolution(stateSnapshot) {
    const uiEvalSegmentsAsLines = getConfigValue('uiEvalSegmentsAsLines', stateSnapshot);
    const uiOnlySelect = getConfigValue('uiOnlySelect', stateSnapshot);

    function checkAllowedNodeClasses(node) {
        return uiOnlySelect ? node.classes.has(SELECTED_NODE_CLASS_NAME) : node.classes.has(USER_NODE_CLASS_NAME)
    }

    function checkAllowedPathClasses(path) {
        return uiOnlySelect
            ? path.classes.has(SELECTED_LINE_CLASS_NAME)
            : path.classes.has(USER_LINE_CLASS_NAME)
                || path.classes.has(TASK_LINE_CLASS_NAME)
                || (uiEvalSegmentsAsLines ? path.classes.has(AXIS_LINE_CLASS_NAME) : false)
    }

    for (const solution of stateSnapshot.solutions) {
        const pointCheck = typeof solution[NODE_STATE_COLLECTION] !== 'undefined'
            ? solution[NODE_STATE_COLLECTION].filter(point => (
            stateSnapshot[NODE_STATE_COLLECTION].filter(userPoint => (
                checkAllowedNodeClasses(userPoint) && userPoint.geometry.p1.equals(point)
            )).length === 0
        )).length === 0
            : true;

        const pathCheck = typeof solution[PATH_STATE_COLLECTION] !== 'undefined'
            ? solution[PATH_STATE_COLLECTION].filter(path => {
            const matches = findLine(path.p1, path.p2, stateSnapshot.paths);
            return matches.length === 0 || matches.filter(match => checkAllowedPathClasses(match)).length === 0
        }).length === 0
            : true;

        if (pointCheck && pathCheck) {
            if (!uiOnlySelect) return solution;
            else {
                const selectedNodesQty = stateSnapshot[NODE_STATE_COLLECTION]
                    .filter(node => node.classes.has(SELECTED_NODE_CLASS_NAME)).length;
                const selectedPathsQty = stateSnapshot[PATH_STATE_COLLECTION]
                    .filter(path => path.classes.has(SELECTED_LINE_CLASS_NAME)).length;
                const solutionNodesQty = typeof solution[NODE_STATE_COLLECTION] !== 'undefined'
                    ? solution[NODE_STATE_COLLECTION].length
                    : 0;
                const solutionPathsQty = typeof solution[PATH_STATE_COLLECTION] !== 'undefined'
                    ? solution[PATH_STATE_COLLECTION].length
                    : 0;
                if (selectedNodesQty === solutionNodesQty && selectedPathsQty === solutionPathsQty) return solution;
            }
        }
    }
    return {};
}


function highlightSegment(p1, p2, stateSnapshot) {
    const workingState = [stateSnapshot];

    workingState.push(composeNewStateForLine(
        p1,
        p2,
        {add: [SOLVED_LINE_CLASS_NAME]},
        workingState[workingState.length - 1]
    ));
    workingState.push(composeNewStateForNode(
        p1,
        {add: [SOLVED_NODE_CLASS_NAME]},
        workingState[workingState.length - 1]
    ));
    workingState.push(composeNewStateForNode(
        p2,
        {add: [SOLVED_NODE_CLASS_NAME]},
        workingState[workingState.length - 1]
    ));

    return workingState[workingState.length - 1];
}


export function highlightSolution(solution, stateSnapshot) {
    if (LOG) console.time('highlightSolution');
    const workingState = [stateSnapshot];

    Object.keys(solution).forEach(collection => {
        if (collection === NODE_STATE_COLLECTION) {
            solution[collection].forEach(node => {
                workingState.push(composeNewStateForNode(
                    node,
                    {add: [SOLVED_NODE_CLASS_NAME]},
                    workingState[workingState.length - 1]
                ))
            })
        }
        if (collection === PATH_STATE_COLLECTION) {
            solution[collection].forEach(path => {
                workingState.push(highlightSegment(path.p1, path.p2, workingState[workingState.length - 1]));

                // also highlight coincident segments shorter than those which are part of the solution
                stateSnapshot[PATH_STATE_COLLECTION]
                    .filter(userPath => userPath.classes.has(USER_LINE_CLASS_NAME) || userPath.classes.has(TASK_LINE_CLASS_NAME))
                    .map(userPath => {
                        const subsegment = isSubsegment(
                            path.p1, path.p2,
                            userPath.geometry.p1, userPath.geometry.p2
                        );
                        if (subsegment) {
                            workingState.push(highlightSegment(
                                userPath.geometry.p1, userPath.geometry.p2,
                                workingState[workingState.length - 1])
                            );
                        }
                    });
            });
        }
    });

    if (LOG) console.timeEnd('highlightSolution');

    return workingState[workingState.length - 1];
}


export function getConfigValue(key, stateSnapshot) {
    if (typeof stateSnapshot.config === 'undefined') return false;
    return typeof stateSnapshot.config[key] !== 'undefined' ? stateSnapshot.config[key] : false;
}