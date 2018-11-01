import Snap from 'snapsvg';

export function lineToPoints(line) {
    const lineBBox = line.getBBox();
    return [
        {x: lineBBox.x, y: lineBBox.y},
        {x: lineBBox.x2, y: lineBBox.y2},
    ]
}