import {
    BACK_GROUP,
    CANVAS_PADDING_BOTTOM,
    CANVAS_PADDING_LEFT,
    CANVAS_PADDING_RIGHT,
    CANVAS_PADDING_TOP,
    FLASH_LINE_CLASS_NAME,
    FLASH_NODE_CLASS_NAME,
    GRID_HEIGHT,
    GRID_WIDTH,
    LABEL_CLASS_NAME,
    LABEL_GROUP,
    LABEL_OFFSET,
    LABEL_OFFSET_VERTICAL_CORRECTION,
    LINE_RENDERING_ORDER,
    NODE_CLASS_NAME,
    // LOG,
    NODE_GROUP,
    NODE_RADIUS,
    NODE_STATE_COLLECTION,
    PATH_GROUP,
    PATH_STATE_COLLECTION,
    RESOLUTION,
    SELECTED_LINE_CLASS_NAME,
    SELECTED_NODE_CLASS_NAME,
    SOLVED_LINE_CLASS_NAME,
    SOLVED_NODE_CLASS_NAME, TASK_NODE_CLASS_NAME,
    USER_NODE_CLASS_NAME,
    WORK_GROUP
} from './constants';
import { attachDraggable, attachTouchSurfaceDraggable } from './draggable';
import { exportGeometry } from './util';
import { getConfigValue } from './assignment';
import { attachTouchSurfaceSelectable } from './selectable';
import { isEmptyObject, noPointerEvents } from './functions';

export function render(state, groups, interactive = true) {
    const stateSnapshot = state.get();
    const stateTime = state.length;
    const uiOnlySelect = getConfigValue('uiOnlySelect', stateSnapshot);

    function getLabelPosition(elem) {
        const origin = Object.keys(elem.geometry).length === 2
            ? {
                x: (elem.geometry.p1.x + elem.geometry.p2.x) / 2,
                y: (elem.geometry.p1.y + elem.geometry.p2.y) / 2,
            }
            : elem.geometry.p1;
        const labelOffsetX = typeof elem.label.position !== 'undefined'
            ? elem.label.position[0] * LABEL_OFFSET
            : LABEL_OFFSET;
        const labelOffsetY = typeof elem.label.position !== 'undefined'
            ? elem.label.position[1] * LABEL_OFFSET + LABEL_OFFSET_VERTICAL_CORRECTION
            : LABEL_OFFSET * -1 + LABEL_OFFSET_VERTICAL_CORRECTION;
        return {x: origin.x + labelOffsetX, y: origin.y + labelOffsetY}
    }

    if (LOG) {
        console.time('render');
        console.log('%crender:', 'color: plum' , Object.assign({}, stateSnapshot, {}));
        exportGeometry(stateSnapshot);
    }

    Object.keys(groups).forEach(key => {
        groups[key].clear();
    });

    Object.keys(stateSnapshot).forEach(elemGroup => {
        if (elemGroup === NODE_STATE_COLLECTION) {
            stateSnapshot[elemGroup].forEach(elem => {
                if (elem.updatedAt === stateTime
                    && (elem.classes.has(USER_NODE_CLASS_NAME) || elem.classes.has(TASK_NODE_CLASS_NAME))
                    && (elem.classes.has(SELECTED_NODE_CLASS_NAME) || elem.classes.has(SOLVED_NODE_CLASS_NAME))) {
                    const flashnode = groups[NODE_GROUP]
                        .circle(NODE_RADIUS * 2)
                        .move(elem.geometry.p1.x - NODE_RADIUS, elem.geometry.p1.y - NODE_RADIUS);
                    flashnode.addClass(NODE_CLASS_NAME);
                    flashnode.addClass(FLASH_NODE_CLASS_NAME);
                    if (elem.classes.has(SOLVED_NODE_CLASS_NAME)) flashnode.addClass(SOLVED_NODE_CLASS_NAME)
                }
                const node = groups[NODE_GROUP]
                    .circle(NODE_RADIUS * 2)
                    .move(elem.geometry.p1.x - NODE_RADIUS, elem.geometry.p1.y - NODE_RADIUS);
                elem.classes.forEach(className => {
                    node.addClass(className)
                });
                if (interactive) {
                    uiOnlySelect
                        ? noPointerEvents(node)
                        : attachDraggable(node, groups[WORK_GROUP], stateSnapshot.nodes);
                }
                if (!isEmptyObject(elem.label)) {
                    const position = getLabelPosition(elem);
                    const label = groups[LABEL_GROUP]
                        .text(elem.label.text)
                        .center(position.x, position.y);
                    label.addClass(LABEL_CLASS_NAME);
                }
            })
        }
        if (elemGroup === PATH_STATE_COLLECTION) {
            LINE_RENDERING_ORDER.map((group, index) => {
                const laterGroups = LINE_RENDERING_ORDER.length - 1 > index
                    ? LINE_RENDERING_ORDER.slice(index + 1, LINE_RENDERING_ORDER.length -1)
                    : [];
                stateSnapshot[elemGroup]
                    .filter(elem => {
                        const inLaterGroup = laterGroups
                            .reduce((acc, laterGroup) => acc || elem.classes.has(laterGroup), false);
                        return elem.classes.has(group) && !inLaterGroup;
                    })
                    .forEach(elem => {
                        if (elem.updatedAt === stateTime && (elem.classes.has(SELECTED_LINE_CLASS_NAME) || elem.classes.has(SOLVED_LINE_CLASS_NAME))) {
                            const flashline = groups[PATH_GROUP]
                                .line(elem.geometry.p1.x, elem.geometry.p1.y, elem.geometry.p2.x, elem.geometry.p2.y);
                            flashline.addClass(FLASH_LINE_CLASS_NAME);
                            if (elem.classes.has(SOLVED_LINE_CLASS_NAME)) flashline.addClass(SOLVED_LINE_CLASS_NAME)
                        }
                        const line = groups[PATH_GROUP]
                            .line(elem.geometry.p1.x, elem.geometry.p1.y, elem.geometry.p2.x, elem.geometry.p2.y);
                        noPointerEvents(line);
                        elem.classes.forEach(className => {
                            line.addClass(className)
                        });
                        if (!isEmptyObject(elem.label)) {
                            const position = getLabelPosition(elem);
                            const label = groups[LABEL_GROUP]
                                .text(elem.label.text)
                                .center(position.x, position.y);
                            label.addClass(LABEL_CLASS_NAME);
                        }
                    });
            });
        }
    });

    const touchSurface = groups[BACK_GROUP].rect(
        GRID_WIDTH * RESOLUTION + CANVAS_PADDING_LEFT + CANVAS_PADDING_RIGHT,
        GRID_HEIGHT * RESOLUTION + CANVAS_PADDING_TOP + CANVAS_PADDING_BOTTOM
    ).addClass('touchsurface');
    if (interactive) {
        uiOnlySelect
            ? attachTouchSurfaceSelectable(touchSurface, stateSnapshot)
            : attachTouchSurfaceDraggable(touchSurface, groups[WORK_GROUP], stateSnapshot.nodes)
    }

    if (LOG) console.timeEnd('render');
}