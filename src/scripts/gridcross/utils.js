import {FLASH_BUTTON_CLASS,} from './constants';

export function isValidJSON(json) {
    try {
        JSON.parse(json);
    } catch (e) {
        return false;
    }
    return true;
}

export function isEmptyObject(object) {
    return Object.keys(object).length === 0 && object.constructor === Object;
}

export function enableButton(button, handlers = []) {
    if (typeof button === 'undefined' || button == null) return;

    button.disabled = false;
    handlers.forEach(handler => {
        button.addEventListener('touchstart', handler);
        button.addEventListener('click', handler);
    })
}

export function disableButton(button, handlers = []) {
    if (typeof button === 'undefined' || button == null) return;

    button.disabled = true;
    handlers.forEach(handler => {
        button.removeEventListener('touchstart', handler);
        button.removeEventListener('click', handler);
    })
}

export function flashButton(button) {
    if (typeof button === 'undefined' || button == null) return;

    button.classList.remove(FLASH_BUTTON_CLASS);

    // triggers reflow so the repeated addition of the class would trigger the css animation
    void button.offsetWidth;

    button.classList.add(FLASH_BUTTON_CLASS);
}

export function enableKeyboardShortcuts(handlers) {
    handlers.forEach(handler => {
        document.addEventListener('keydown', handler);
    });
}

export function disableKeyboardShortcuts(handlers) {
    handlers.forEach(handler => {
        document.removeEventListener('keydown', handler);
    });
}

export function noPointerEvents(elem) {
    elem.addClass('no-pointer-events');
}

export function deleteFromSet(set, elem) {
    const outputSet = new Set(set);
    outputSet.delete(elem);
    return outputSet;
}

// export function intersectSets(set1, set2) {
//     const intersection = new Set();
//     set1.forEach(elem => {
//         if (set2.has(elem)) intersection.add(elem);
//     });
//     return intersection;
// }

// export function unifySets(set1, set2) {
//     const union = new Set(set1);
//     set2.forEach(elem => union.add(elem));
//     return union;
// }

export function setIncludes(set, elems) {
    for (let elem of elems) {
        if (set.has(elem)) return true;
    }
    return false;
}

export function arrayIncludes(array, elems) {
    for (let elem of elems) {
        if (array.includes(elem)) return true;
    }
    return false;
}

export function isAsc(array) {
    let max = -Infinity;
    for (let n of array) {
        if (n < max) return false;
        max = n;
    }
    return true;
}

export function determineResolution(gridWidth, gridHeight, canvasPadding) {
    const viewSize = Math.min(window.innerWidth, window.innerHeight * 0.65) - canvasPadding * 1.5;
    const gridSize = Math.max(gridWidth, gridHeight);
    const resolution = Math.floor(viewSize / gridSize / 5) * 5;
    return Math.min(resolution, 100);
}