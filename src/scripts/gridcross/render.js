import {
    BACK_GROUP,
    CANVAS_PADDING,
    GRID_HEIGHT,
    GRID_WIDTH,
    LINE_RENDERING_ORDER, LOG,
    NODE_GROUP,
    NODE_RADIUS,
    NODE_STATE_COLLECTION,
    PATH_GROUP,
    PATH_STATE_COLLECTION,
    RESOLUTION,
    WORK_GROUP
} from './constants';
import { attachDraggable, attachTouchSurfaceDraggable } from './draggable';
import { exportGeometry } from './util';

export function render(state, groups, interactive = true) {
    if (LOG) {
        const stateSnapshot =  Object.assign({}, state.get(), {});
        console.time('render');
        console.log('%crender:', 'color: plum' , stateSnapshot);
        exportGeometry(stateSnapshot);
    }

    Object.keys(groups).forEach(key => {
        groups[key].clear();
    });

    const currentState = state.get();
    Object.keys(currentState).forEach(elemGroup => {
        if (elemGroup === NODE_STATE_COLLECTION) {
            currentState[elemGroup].forEach(elem => {
                const node = groups[NODE_GROUP]
                    .circle(NODE_RADIUS * 2)
                    .move(elem.geometry.p1.x - NODE_RADIUS, elem.geometry.p1.y - NODE_RADIUS);
                elem.classes.forEach(className => {
                    node.addClass(className)
                });
                if (interactive) attachDraggable(node, groups[WORK_GROUP], currentState.nodes);
            })
        }
        if (elemGroup === PATH_STATE_COLLECTION) {
            LINE_RENDERING_ORDER.forEach(group => {
                currentState[elemGroup]
                    .filter(elem => elem.classes.has(group))
                    .forEach(elem => {
                        const line = groups[PATH_GROUP].line(
                            elem.geometry.p1.x, elem.geometry.p1.y, elem.geometry.p2.x, elem.geometry.p2.y
                        );
                        // todo: selecting lines
                        // line.on('click', function() {console.log('line clicked')});
                        elem.classes.forEach(className => {line.addClass(className)});
                    });
            });
        }
    });

    const touchSurface = groups[BACK_GROUP].rect(
        GRID_WIDTH * RESOLUTION + CANVAS_PADDING * 2,
        GRID_HEIGHT * RESOLUTION + CANVAS_PADDING * 2
    ).addClass('touchsurface');
    if (interactive) attachTouchSurfaceDraggable(touchSurface, groups[WORK_GROUP], currentState.nodes);

    if (LOG) console.timeEnd('render');
}