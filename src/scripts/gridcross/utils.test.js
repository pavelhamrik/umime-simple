import {isAsc} from './utils';

test('isAsc', () => {
    expect(isAsc([-Infinity, 0, 0, 1])).toBe(true);

    expect(isAsc([0, 2, 1])).toBe(false);

    expect(isAsc([0, 3, 2, 5])).toBe(false);

    expect(isAsc([])).toBe(true);
});