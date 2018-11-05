export const GRID_WIDTH = 6;
export const GRID_HEIGHT = 6;

export const RESOLUTION = 40;

export const CANVAS_PADDING = 20;

export const TOP_EDGE = CANVAS_PADDING;
export const RIGHT_EDGE = GRID_WIDTH * RESOLUTION + CANVAS_PADDING;
export const BOTTOM_EDGE = GRID_HEIGHT * RESOLUTION + CANVAS_PADDING;
export const LEFT_EDGE = CANVAS_PADDING;

export const NODE_RADIUS = 4;

export const OK = 'OK';
export const ERROR = 'ERROR';
export const PARALLEL = 'PARALLEL';
export const COINCIDENT = 'COINCIDENT';
export const NO_INTERSECTION = 'NO_INTERSECTION';

export const SNAP_THRESHOLD = 10;
export const DUPLICATE_NODE_THRESHOLD = 0.1;
export const DUPLICATE_LINE_THRESHOLD = 0.1;

export const NODE = 'NODE';
export const LINE = 'LINE';
export const CIRCLE = 'CIRCLE';

export const PATH_GROUP = 'pathGroup';
export const NODE_GROUP = 'nodeGroup';
export const WORK_GROUP = 'workGroup';