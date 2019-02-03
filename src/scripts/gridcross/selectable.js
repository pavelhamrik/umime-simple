import Point from './Point';
import { handleSelectedElem } from './gridcross.exercise';
import { getNearestLine, getNearestNode} from './geometry';
import {
    NODE_SELECT_RADIUS,
    NODE_STATE_COLLECTION,
    PATH_STATE_COLLECTION,
    TASK_LINE_CLASS,
    TASK_NODE_CLASS, TOUCH_SELECT_TOLERANCE
} from './constants';
import {getConfigValue} from './assignment';

export function attachTouchSurfaceSelectable(surface, stateSnapshot) {
    function handleTouchSelect(event) {
        event.stopPropagation();
        event.preventDefault();

        if (event.touches.length !== 1) return;

        const surfaceBoundingBox = event.target.getBoundingClientRect();
        const origin = new Point(
            event.touches[0].clientX - surfaceBoundingBox.left,
            event.touches[0].clientY - surfaceBoundingBox.top
        );

        handleSelect(origin);
    }

    function handleClickSelect(event) {
        event.stopPropagation();
        event.preventDefault();

        const surfaceBoundingBox = event.target.getBoundingClientRect();
        const origin = new Point(
            event.x - surfaceBoundingBox.left,
            event.y - surfaceBoundingBox.top
        );

        handleSelect(origin);
    }

    function handleSelect(origin) {
        if (LOG) console.time('handleTouchSurfaceSelect');

        const nodes = stateSnapshot[NODE_STATE_COLLECTION].filter(node => node.classes.has(TASK_NODE_CLASS));
        const lines = stateSnapshot[PATH_STATE_COLLECTION].filter(node => node.classes.has(TASK_LINE_CLASS));

        const ignoreNodes = getConfigValue('uiOnlySelectIgnoreNodes', stateSnapshot);
        const ignoreLines = getConfigValue('uiOnlySelectIgnoreLines', stateSnapshot);

        if (ignoreNodes && !ignoreLines) {
            const nearestLine = getNearestLine(origin, lines);
            if (nearestLine.distance <= TOUCH_SELECT_TOLERANCE) {
                handleSelectedElem(nearestLine.geometry.p1, nearestLine.geometry.p2);
            }
            if (LOG) console.timeEnd('handleTouchSurfaceSelect');
            return;
        }

        if (ignoreLines && !ignoreNodes) {
            const nearestNode = getNearestNode(origin, nodes);
            if (nearestNode.distance <= TOUCH_SELECT_TOLERANCE) {
                handleSelectedElem(nearestNode.point);
            }
            if (LOG) console.timeEnd('handleTouchSurfaceSelect');
            return;
        }

        const nearestNode = getNearestNode(origin, nodes);
        const nearestLine = getNearestLine(origin, lines);

        if (nearestNode.distance <= TOUCH_SELECT_TOLERANCE && nearestNode.distance <= NODE_SELECT_RADIUS) {
            handleSelectedElem(nearestNode.point);
        }
        else if (nearestNode.distance <= TOUCH_SELECT_TOLERANCE && nearestLine.distance <= TOUCH_SELECT_TOLERANCE) {
            if (nearestNode.distance <= nearestLine.distance) handleSelectedElem(nearestNode.point);
            else handleSelectedElem(nearestLine.geometry.p1, nearestLine.geometry.p2);
        }
        else if (nearestNode.distance <= TOUCH_SELECT_TOLERANCE) {
            handleSelectedElem(nearestNode.point);
        }
        else if (nearestLine.distance <= TOUCH_SELECT_TOLERANCE) {
            handleSelectedElem(nearestLine.geometry.p1, nearestLine.geometry.p2);
        }

        if (LOG) console.timeEnd('handleTouchSurfaceSelect');
    }

    surface.on('touchstart', handleTouchSelect);
    surface.on('click', handleClickSelect);
}
