import Point from './Point';
import { handleSelectedElem } from './gridcross.exercise';
import { getNearestLine, getNearestNode, isEmptyObject, noPointerEvents } from './functions';
import {
    LOG,
    NODE_STATE_COLLECTION,
    PATH_STATE_COLLECTION,
    TASK_LINE_CLASS_NAME,
    TASK_NODE_CLASS_NAME, TOUCH_SELECT_TOLERANCE
} from './constants';

// export function attachSelectable(elem) {
//     function handleSelect(event) {
//         event.stopPropagation();
//         event.preventDefault();
//
//         const attr = event.target.attributes;
//
//         if (typeof attr.cx !== 'undefined'
//             && typeof attr.cy !== 'undefined'
//             && typeof attr.r !== 'undefined') {
//             handleSelectedElem(new Point(parseFloat(attr.cx.value), parseFloat(attr.cy.value)));
//         }
//         else if (typeof attr.x1 !== 'undefined'
//             && typeof attr.y1 !== 'undefined'
//             && typeof attr.x2 !== 'undefined'
//             && typeof attr.y2 !== 'undefined') {
//             handleSelectedElem(
//                 new Point(parseFloat(attr.x1.value), parseFloat(attr.y1.value)),
//                 new Point(parseFloat(attr.x2.value), parseFloat(attr.y2.value))
//             );
//         }
//     }
//
//     elem.on('touchstart', handleSelect);
//     elem.on('click', handleSelect);
//     noPointerEvents(elem);
// }


export function attachTouchSurfaceSelectable(surface, stateSnapshot) {
    function handleTouchSurfaceSelect() {
        if (LOG) console.time('handleTouchSurfaceSelect');

        event.stopPropagation();
        event.preventDefault();

        const surfaceBoundingBox = event.target.getBoundingClientRect();
        const origin = new Point(
            event.x - surfaceBoundingBox.left,
            event.y - surfaceBoundingBox.top
        );

        const nodes = stateSnapshot[NODE_STATE_COLLECTION].filter(node => node.classes.has(TASK_NODE_CLASS_NAME));
        const lines = stateSnapshot[PATH_STATE_COLLECTION].filter(node => node.classes.has(TASK_LINE_CLASS_NAME));

        const nearestNode = getNearestNode(origin, nodes);
        const nearestLine = getNearestLine(origin, lines);

        if (nearestNode.distance <= TOUCH_SELECT_TOLERANCE && nearestLine.distance <= TOUCH_SELECT_TOLERANCE) {
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

    surface.on('touchstart', handleTouchSurfaceSelect);
    surface.on('click', handleTouchSurfaceSelect);
}