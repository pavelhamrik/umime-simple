import {
    ACCEPTABLE_SOLUTION_LINE_CLASSES,
    AUX_LINE_CLASS,
    AXIS_LINE_CLASS,
    CONFIG_STATE_COLLECTION,
    GEOMETRY_PRECISION_TOLERANCE,
    LIMITS_CLASS,
    LIMITS_EQ_SING_CLASS,
    LIMITS_LINE_CLASS,
    LIMITS_NODE_CLASS,
    NODE_STATE_COLLECTION,
    PATH_STATE_COLLECTION,
    SELECTED_LINE_CLASS,
    SELECTED_NODE_CLASS,
    SOLUTION_STATE_COLLECTION,
    SOLVED_LINE_CLASS,
    SOLVED_NODE_CLASS,
    TASK_LINE_CLASS,
    TASK_NODE_CLASS,
    USER_LINE_CLASS,
    USER_NODE_CLASS
} from './constants';
import Point from './Point';
import { extendLineCoordinates, findLine, toCanvasXCoord, toCanvasYCoord } from './geometry';
import { composeNewStateForNode } from './state';
import { isSubsegment } from './geometry';
import {composeNewStateForLine} from './state';

export function parseAssignment(assignments, index, stateSnapshot) {
    const workingState = [stateSnapshot];

    workingState.push(Object.assign({}, workingState[workingState.length - 1], {
        id: assignments[index].id,
        name: assignments[index].name,
        text: enrichAssignmentText(assignments[index].item),
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
                        toCanvasXCoord(point.geometry[0]),
                        toCanvasYCoord(point.geometry[1])
                    ),
                    {add: [TASK_NODE_CLASS]},
                    workingState[workingState.length - 1],
                    point.label
                )
            );
        });
    }

    if (typeof assignment.problem.segments !== 'undefined') {
        assignment.problem.segments.forEach(line => {
            const p1 = new Point(
                toCanvasXCoord(line.geometry[0][0]),
                toCanvasYCoord(line.geometry[0][1])
            );
            const p2 = new Point(
                toCanvasXCoord(line.geometry[1][0]),
                toCanvasYCoord(line.geometry[1][1])
            );

            workingState.push(
                composeNewStateForLine(
                    p1, p2,
                    {add: [TASK_LINE_CLASS]},
                    workingState[workingState.length - 1],
                    line.label
                )
            );
            workingState.push(
                composeNewStateForNode(
                    p1,
                    {add: [TASK_NODE_CLASS]},
                    workingState[workingState.length - 1]
                )
            );
            workingState.push(
                composeNewStateForNode(
                    p2,
                    {add: [TASK_NODE_CLASS]},
                    workingState[workingState.length - 1]
                )
            );
        });
    }

    if (typeof assignment.problem.lines !== 'undefined') {
        assignment.problem.lines.forEach(line => {
            const {p1, p2} = extendLineCoordinates(
                new Point(
                    toCanvasXCoord(line.geometry[0][0]),
                    toCanvasYCoord(line.geometry[0][1])
                ),
                new Point(
                    toCanvasXCoord(line.geometry[1][0]),
                    toCanvasYCoord(line.geometry[1][1])
                )
            );

            workingState.push(
                composeNewStateForLine(
                    p1, p2,
                    {add: [TASK_LINE_CLASS]},
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
                    toCanvasXCoord(point[0]),
                    toCanvasYCoord(point[1])
                )
            ));
        }

        transformed[PATH_STATE_COLLECTION] = [];

        transformed[PATH_STATE_COLLECTION] = transformed[PATH_STATE_COLLECTION]
            .concat(typeof solution.segments !== 'undefined'
                ? solution.segments.map(path => (
                    {
                        p1: new Point(
                            toCanvasXCoord(path[0][0]),
                            toCanvasYCoord(path[0][1])
                        ),
                        p2: new Point(
                            toCanvasXCoord(path[1][0]),
                            toCanvasYCoord(path[1][1])
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
                            toCanvasXCoord(path[0][0]),
                            toCanvasYCoord(path[0][1])
                        ),
                        new Point(
                            toCanvasXCoord(path[1][0]),
                            toCanvasYCoord(path[1][1])
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
        return uiOnlySelect ? node.classes.has(SELECTED_NODE_CLASS) : node.classes.has(USER_NODE_CLASS)
    }

    function checkAllowedPathClasses(path) {
        if (uiOnlySelect) return path.classes.has(SELECTED_LINE_CLASS);

        const acceptable = uiEvalSegmentsAsLines
            ? new Set(ACCEPTABLE_SOLUTION_LINE_CLASSES).add(AXIS_LINE_CLASS)
            : ACCEPTABLE_SOLUTION_LINE_CLASSES;
        for (let className of acceptable) {
            if (path.classes.has(className)) return true;
        }

        return false;

        // return uiOnlySelect
        //     ? path.classes.has(SELECTED_LINE_CLASS)
        //     : path.classes.has(USER_LINE_CLASS)
        //         || path.classes.has(TASK_LINE_CLASS)
        //         || (uiEvalSegmentsAsLines ? path.classes.has(AXIS_LINE_CLASS) : false)
    }

    for (const solution of stateSnapshot.solutions) {
        const pointCheck = typeof solution[NODE_STATE_COLLECTION] !== 'undefined'
            ? solution[NODE_STATE_COLLECTION].filter(point => (
            stateSnapshot[NODE_STATE_COLLECTION].filter(userPoint => (
                checkAllowedNodeClasses(userPoint) && userPoint.geometry.p1.equals(point, GEOMETRY_PRECISION_TOLERANCE)
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
                    .filter(node => node.classes.has(SELECTED_NODE_CLASS)).length;
                const selectedPathsQty = stateSnapshot[PATH_STATE_COLLECTION]
                    .filter(path => path.classes.has(SELECTED_LINE_CLASS)).length;
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
        {add: [SOLVED_LINE_CLASS]},
        workingState[workingState.length - 1]
    ));
    workingState.push(composeNewStateForNode(
        p1,
        {add: [SOLVED_NODE_CLASS]},
        workingState[workingState.length - 1]
    ));
    workingState.push(composeNewStateForNode(
        p2,
        {add: [SOLVED_NODE_CLASS]},
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
                    {add: [SOLVED_NODE_CLASS]},
                    workingState[workingState.length - 1]
                ))
            })
        }
        if (collection === PATH_STATE_COLLECTION) {
            solution[collection].forEach(path => {
                workingState.push(highlightSegment(path.p1, path.p2, workingState[workingState.length - 1]));

                // also highlight coincident segments shorter than those which are part of the solution
                stateSnapshot[PATH_STATE_COLLECTION]
                    .filter(userPath => (
                        userPath.classes.has(USER_LINE_CLASS)
                        || userPath.classes.has(TASK_LINE_CLASS)
                        || userPath.classes.has(AUX_LINE_CLASS)
                    ))
                    .map(userPath => {
                        const subsegment = isSubsegment(
                            path.p1, path.p2,
                            userPath.geometry.p1, userPath.geometry.p2,
                            false
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

export function parseKatex(string) {
    return string.replace(
        /\\begin{katex}(.*)\\end{katex}/g,
        (match, p1) => {
            if (typeof window.katex !== 'undefined') {
                return window.katex.renderToString(p1, {throwOnError: false});
            }
            return '';
        }
    );
}

export function enrichAssignmentText(assignment) {
    console.log(assignment);

    const {config = {}} =  assignment;

    const nodeLimit = config.maxUserNodes
        ? `<span class='${LIMITS_CLASS} ${LIMITS_NODE_CLASS}'><span class='${LIMITS_EQ_SING_CLASS}'>&le;</span> ${config.maxUserNodes}</span>`
        : '';
    const lineLimit = config.maxUserLines
        ? `<span class='${LIMITS_CLASS} ${LIMITS_LINE_CLASS}'><span class='${LIMITS_EQ_SING_CLASS}'>&le;</span> ${config.maxUserLines}</span>`
        : ' ';

    return `${assignment.text} ${nodeLimit}${lineLimit}`;
}