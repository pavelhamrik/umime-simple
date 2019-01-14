import { determineResolution } from './functions';

export const GRID_WIDTH = 6;
export const GRID_HEIGHT = 6;

export const CANVAS_PADDING_TOP = 20;
export const CANVAS_PADDING_RIGHT = 20;
export const CANVAS_PADDING_BOTTOM = 40;
export const CANVAS_PADDING_LEFT = 20;

export const RESOLUTION = determineResolution(GRID_WIDTH, GRID_HEIGHT, CANVAS_PADDING_LEFT + CANVAS_PADDING_RIGHT);

export const LABEL_OFFSET = 12;
export const LABEL_OFFSET_VERTICAL_CORRECTION = 2;

export const TOP_EDGE = CANVAS_PADDING_TOP;
export const RIGHT_EDGE = GRID_WIDTH * RESOLUTION + CANVAS_PADDING_LEFT;
export const BOTTOM_EDGE = GRID_HEIGHT * RESOLUTION + CANVAS_PADDING_TOP;
export const LEFT_EDGE = CANVAS_PADDING_LEFT;

export const NODE_RADIUS = 4;

export const OK = 'OK';
export const ERROR = 'ERROR';
export const PARALLEL = 'PARALLEL';
export const COINCIDENT = 'COINCIDENT';
export const NO_INTERSECTION = 'NO_INTERSECTION';

export const SNAP_THRESHOLD = 10;
export const DUPLICATE_NODE_THRESHOLD = 0.1;
export const DUPLICATE_LINE_THRESHOLD = 0.1;
export const COINCIDENT_LINE_THRESHOLD = 0.001;
export const TOUCH_SELECT_TOLERANCE = 20;

export const NODE = 'NODE';
export const LINE = 'LINE';

export const BACK_GROUP = 'backGroup';
export const PATH_GROUP = 'pathGroup';
export const NODE_GROUP = 'nodeGroup';
export const WORK_GROUP = 'workGroup';
export const LABEL_GROUP = 'labelGroup';

export const NODE_STATE_COLLECTION = 'nodes';
export const PATH_STATE_COLLECTION = 'paths';
export const SOLUTION_STATE_COLLECTION = 'solutions';
export const CONFIG_STATE_COLLECTION = 'config';

export const LABEL_CLASS_NAME = 'label';

export const NODE_CLASS_NAME = 'node';
export const GRID_NODE_CLASS_NAME = 'gridnode';
export const USER_NODE_CLASS_NAME = 'usernode';
export const TASK_NODE_CLASS_NAME = 'tasknode';
export const SELECTED_NODE_CLASS_NAME = 'selectednode';
export const SOLVED_NODE_CLASS_NAME = 'solvednode';
export const FLASH_NODE_CLASS_NAME = 'flashnode';

export const GRID_LINE_CLASS_NAME = 'gridline';
export const AUX_LINE_CLASS_NAME = 'auxline';
export const AXIS_LINE_CLASS_NAME = 'axisline';
export const TASK_LINE_CLASS_NAME = 'taskline';
export const USER_LINE_CLASS_NAME = 'userline';
export const SELECTED_LINE_CLASS_NAME = 'selectedline';
export const SOLVED_LINE_CLASS_NAME = 'solvedline';
export const FLASH_LINE_CLASS_NAME = 'flashline';

export const LINE_RENDERING_ORDER = [
    GRID_LINE_CLASS_NAME,
    AXIS_LINE_CLASS_NAME,
    TASK_LINE_CLASS_NAME,
    USER_LINE_CLASS_NAME,
    SELECTED_LINE_CLASS_NAME,
    SOLVED_LINE_CLASS_NAME,
];

export const ACCEPTABLE_SOLUTION_NODE_CLASSES = new Set([
    USER_NODE_CLASS_NAME,
    TASK_NODE_CLASS_NAME,
    SELECTED_NODE_CLASS_NAME,
]);

export const ACCEPTABLE_SOLUTION_LINE_CLASSES = new Set([
    TASK_LINE_CLASS_NAME,
    USER_LINE_CLASS_NAME,
    AUX_LINE_CLASS_NAME,
    SELECTED_LINE_CLASS_NAME,
]);

export const LIMITED_USER_NODE_CLASSES = new Set([
    USER_NODE_CLASS_NAME,
    SELECTED_NODE_CLASS_NAME,
]);

export const LIMITED_USER_LINE_CLASSES = new Set([
    USER_LINE_CLASS_NAME,
    SELECTED_LINE_CLASS_NAME,
]);

export const FLASH_BUTTON_CLASS_NAME = 'button-flash';

export const APP_NAME = 'Umíme matiku';
export const EXERCISE_NAME = 'Mřížkovaná';

export const BACK_BUTTON_LABEL = 'Zpět';
export const RESET_BUTTON_LABEL = 'Od začátku';
export const NEXT_BUTTON_LABEL = 'Další';
export const TASK_TEXT_DEFAULT = 'Načítám zadání…';
export const API_LOAD_ERROR_TEXT = 'Nepodařilo se načíst zadání. Zkuste prosím obnovit stránku.';
export const API_LOAD_TIMEOUT_TEXT = 'Načítání zadání nám trochu trvá, ale zkoušíme dál…';

export const FRONTEND_URL = 'https://www.umimematiku.cz/';

export const TIMEOUT = 20000;

export const RESET_BUTTON_TEST = {
    name: 'reset-button',
    variants: 2,
    id: 'lX-VcSRhTd2nyk-Rr1kQrA',
};
