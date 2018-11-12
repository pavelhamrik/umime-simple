import {
    LOG,
    NODE_STATE_COLLECTION,
    PATH_STATE_COLLECTION,
    SOLUTION_STATE_COLLECTION,
    SOLVED_LINE_CLASS_NAME,
    SOLVED_NODE_CLASS_NAME,
    TASK_LINE_CLASS_NAME,
    TASK_NODE_CLASS_NAME,
    USER_LINE_CLASS_NAME,
    USER_NODE_CLASS_NAME
} from './constants';
import Point from './Point';
import { findLine, toCanvasCoord } from './functions';
import { composeNewStateForLine, composeNewStateForNode } from './gridcross.exercise';

export function parseAssignment(json, stateSnapshot) {
    if (LOG) console.log('%cdata received:', 'color: cornflowerblue', json);

    const workingState = [stateSnapshot];

    if (typeof json.problem.points !== 'undefined') {
        json.problem.points.forEach(point => {
            workingState.push(
                composeNewStateForNode(
                    new Point(
                        toCanvasCoord(point[0]),
                        toCanvasCoord(point[1])
                    ),
                    TASK_NODE_CLASS_NAME,
                    workingState[workingState.length - 1]
                )
            );
        });
    }

    if (typeof json.problem.segments !== 'undefined') {
        json.problem.segments.forEach(line => {
            const p1 = new Point(
                toCanvasCoord(line[0][0]),
                toCanvasCoord(line[0][1])
            );
            const p2 = new Point(
                toCanvasCoord(line[1][0]),
                toCanvasCoord(line[1][1])
            );

            workingState.push(
                composeNewStateForLine(
                    p1, p2,
                    TASK_LINE_CLASS_NAME,
                    workingState[workingState.length - 1]
                )
            );
            workingState.push(
                composeNewStateForNode(p1,
                    TASK_NODE_CLASS_NAME,
                    workingState[workingState.length - 1],
                    NODE_STATE_COLLECTION
                )
            );
            workingState.push(
                composeNewStateForNode(p2,
                    TASK_NODE_CLASS_NAME,
                    workingState[workingState.length - 1],
                    NODE_STATE_COLLECTION
                )
            );
        });
    }

    if (typeof json.problem.lines !== 'undefined') {
        json.problem.lines.forEach(line => {
            const p1 = new Point(
                toCanvasCoord(line[0][0]),
                toCanvasCoord(line[0][1])
            );
            const p2 = new Point(
                toCanvasCoord(line[1][0]),
                toCanvasCoord(line[1][1])
            );

            workingState.push(
                composeNewStateForLine(
                    p1, p2,
                    TASK_LINE_CLASS_NAME,
                    workingState[workingState.length - 1]
                )
            );
        });
    }

    workingState[workingState.length - 1][SOLUTION_STATE_COLLECTION] = json.solutions.map(solution => {
        const transformed = {};
        if (typeof solution.points !== 'undefined') {
            transformed[NODE_STATE_COLLECTION] = solution.points.map(point => (
                new Point(
                    toCanvasCoord(point[0]),
                    toCanvasCoord(point[1])
                )
            ));
        }

        const segments = typeof solution.segments !== 'undefined' ? solution.segments : [];
        const lines = typeof solution.lines !== 'undefined' ? solution.lines: [];
        const paths = segments.concat(lines);

        if (paths.length !== 0) {
            transformed[PATH_STATE_COLLECTION] = paths.map(path => {
                return {
                    p1: new Point(
                        toCanvasCoord(path[0][0]),
                        toCanvasCoord(path[0][1])
                    ),
                    p2: new Point(
                        toCanvasCoord(path[1][0]),
                        toCanvasCoord(path[1][1])
                    ),
                }
            });
        }
        return transformed;
    });

    return workingState[workingState.length - 1];
}


export function checkSolution(stateSnapshot) {
    for (const solution of stateSnapshot.solutions) {
        const pointCheck = typeof solution[NODE_STATE_COLLECTION] !== 'undefined'
            ? solution[NODE_STATE_COLLECTION].filter(point => (
            stateSnapshot[NODE_STATE_COLLECTION].filter(userPoint => (
                userPoint.classes.has(USER_NODE_CLASS_NAME) && userPoint.geometry.p1.equals(point)
            )).length === 0
        )).length === 0
            : true;

        const pathCheck = typeof solution[PATH_STATE_COLLECTION] !== 'undefined'
            ? solution[PATH_STATE_COLLECTION].filter(path => {
            const matches = findLine(path.p1, path.p2, stateSnapshot.paths, true);
            return matches.length === 0
                || matches.filter(match => match.classes.has(USER_LINE_CLASS_NAME)
                    || match.classes.has(TASK_LINE_CLASS_NAME)).length === 0;
        }).length === 0
            : true;

        if (pointCheck && pathCheck) return solution;
    }
    return {};
}


export function highlightSolution(solution, stateSnapshot) {
    const workingState = [stateSnapshot];

    Object.keys(solution).forEach(collection => {
        if (collection === NODE_STATE_COLLECTION) {
            solution[collection].forEach(node => {
                workingState.push(composeNewStateForNode(
                    node,
                    SOLVED_NODE_CLASS_NAME,
                    workingState[workingState.length - 1]
                ))
            })
        }
        if (collection === PATH_STATE_COLLECTION) {
            solution[collection].forEach(path => {
                workingState.push(composeNewStateForLine(
                    path.p1,
                    path.p2,
                    SOLVED_LINE_CLASS_NAME,
                    workingState[workingState.length - 1]
                ));
                workingState.push(composeNewStateForNode(
                    path.p1,
                    SOLVED_NODE_CLASS_NAME,
                    workingState[workingState.length - 1]
                ));
                workingState.push(composeNewStateForNode(
                    path.p2,
                    SOLVED_NODE_CLASS_NAME,
                    workingState[workingState.length - 1]
                ))
            })
        }
    });

    return workingState[workingState.length - 1];
}