import {
    sortPoints,
    isAsc,
    countUniquePoints
} from './intersections';
import Point from './Point';


test('countUniquePoints', () => {
    const points = [
        new Point(2, 0),
        new Point(3, 1),
        new Point(0, 2),
        new Point(2, 0),
    ];

    expect(countUniquePoints(points)).toBe(3);
});


test('countUniquePoints: empty', () => {
    const points = [];

    expect(countUniquePoints(points)).toBe(0);
});


test('sortPoints', () => {
    const points = [
        new Point(6, 0),
        new Point(0, 2),
        new Point(2, 4),
        new Point(2, 3),
        new Point(6, 6),
        new Point(0, 3),
        new Point(6, 0),
    ];

    const sortedPoints = [
        new Point(0, 2),
        new Point(0, 3),
        new Point(2, 3),
        new Point(2, 4),
        new Point(6, 0),
        new Point(6, 0),
        new Point(6, 6),
    ];

    expect(sortPoints(points)).toEqual(sortedPoints);
});

test('sortPoints: empty', () => {
    const points = [];

    const sortedPoints = [];

    expect(sortPoints(points)).toEqual(sortedPoints);
});

test('isAsc: true', () => {
    const array = [-Infinity, 0, 0, 1];

    expect(isAsc(array)).toBe(true);
});

test('isAsc: false', () => {
    const array = [0, 2, 1];

    expect(isAsc(array)).toBe(false);
});

test('isAsc: empty', () => {
    const array = [];

    expect(isAsc(array)).toBe(true);
});
