import {
    sortPoints,
    isSubsegment,
    getUniquePoints,
    isCoincident,
    isLineOnPoint,
    getRepeatedPoints,
} from './geometry';
import Point from './Point';

test('isLineOnPoint', () => {
    expect(isLineOnPoint(
        new Point(2, 3.5),
        new Point(1, 5),
        new Point(3, 2),
    )).toBe(true);

    expect(isLineOnPoint(
        new Point(2, 4),
        new Point(1, 5),
        new Point(3, 2),
    )).toBe(false);

    expect(isLineOnPoint(
        new Point(3.00004, 2),
        new Point(1, 5),
        new Point(3, 2),
    )).toBe(true);
});

test('isCoincident', () => {
    expect(isCoincident(
        new Point(2, 4),
        new Point(3, 3),
        new Point(4, 2),
        new Point(5, 1),
    )).toBe(true);

    expect(isCoincident(
        new Point(2, 4),
        new Point(3, 3),
        new Point(5, 1),
        new Point(1, 5),
    )).toBe(true);

    expect(isCoincident(
        new Point(2, 3),
        new Point(3, 5),
        new Point(4, 5),
        new Point(1, 1),
    )).toBe(false);
});

// test('overlapLines', () => {
//     expect(overlapLines(
//         new Point(0, 4),
//         new Point(3, 4),
//         new Point(4, 4),
//         new Point(1, 3),
//     ).applies).toBe(false);
//
//     expect(overlapLines(
//         new Point(0, 4),
//         new Point(3, 4),
//         new Point(4, 4),
//         new Point(1, 4),
//     ).applies).toBe(true);
//
//     expect(overlapLines(
//         new Point(5, 4),
//         new Point(2, 4),
//         new Point(1, 4),
//         new Point(4, 4),
//     ).applies).toBe(true);
//
//     expect(overlapLines(
//         new Point(3, 4),
//         new Point(3, 1),
//         new Point(3, 3),
//         new Point(3, 5),
//     ).applies).toBe(true);
//
//     expect(overlapLines(
//         new Point(3, 3),
//         new Point(3, 5),
//         new Point(3, 4),
//         new Point(3, 1),
//     ).applies).toBe(true);
//
//     expect(overlapLines(
//         new Point(1, 3),
//         new Point(3, 5),
//         new Point(2, 4),
//         new Point(4, 6),
//     ).applies).toBe(true);
//
//     expect(overlapLines(
//         new Point(3, 5),
//         new Point(1, 3),
//         new Point(2, 4),
//         new Point(4, 6),
//     ).applies).toBe(true);
//
//     expect(overlapLines(
//         new Point(2, 4),
//         new Point(4, 6),
//         new Point(3, 5),
//         new Point(1, 3),
//     ).applies).toBe(true);
//
//     expect(overlapLines(
//         new Point(2, 4),
//         new Point(4, 6),
//         new Point(1, 3),
//         new Point(3, 5),
//     ).applies).toBe(true);
//
//     expect(overlapLines(
//         new Point(4, 2),
//         new Point(1, 2),
//         new Point(5, 2),
//         new Point(3, 2),
//     ).applies).toBe(true);
//
//     expect(overlapLines(
//         new Point(0, 2),
//         new Point(2, 2),
//         new Point(3, 2),
//         new Point(5, 2),
//     ).applies).toBe(false);
//
//     expect(overlapLines(
//         new Point(2, 4),
//         new Point(4, 2),
//         new Point(3, 3),
//         new Point(5, 1),
//     ).applies).toBe(true);
//
//     expect(overlapLines(
//         new Point(5, 1),
//         new Point(3, 3),
//         new Point(4, 2),
//         new Point(2, 4),
//     ).applies).toBe(true);
// });

// test('isConnected', () => {
//     expect(isConnected(
//         new Point(0, 0),
//         new Point(2, 2),
//         new Point(2, 2),
//         new Point(3, 3),
//     )).toBe(true);
//
//     expect(isConnected(
//         new Point(0, 0),
//         new Point(2, 2),
//         new Point(3, 3),
//         new Point(4, 4),
//     )).toBe(false);
//
//     expect(isConnected(
//         new Point(0, 0),
//         new Point(2, 2),
//         new Point(2, 2),
//         new Point(1, 1),
//     )).toBe(false);
//
//     expect(isConnected(
//         new Point(2, 6),
//         new Point(3, 2),
//         new Point(3, 2),
//         new Point(3.5, 0),
//     )).toBe(true);
//
//     expect(isConnected(
//         new Point(0, 0),
//         new Point(2, 2),
//         new Point(2, 2),
//         new Point(3, 3),
//     )).toBe(true);
//
//     expect(isConnected(
//         new Point(0, 0),
//         new Point(2, 2),
//         new Point(3, 3),
//         new Point(4, 4),
//     )).toBe(false);
//
//     expect(isConnected(
//         new Point(0, 0),
//         new Point(2, 2),
//         new Point(2, 2),
//         new Point(1, 1),
//     )).toBe(false);
// });

test('isSubsegment', () => {
    expect(isSubsegment(
        new Point(0, 0),
        new Point(6, 0),
        new Point(2, 0),
        new Point(6, 0),
    )).toBe(true);

    expect(isSubsegment(
        new Point(2, 0),
        new Point(6, 0),
        new Point(0, 0),
        new Point(6, 0),
    )).toBe(true);

    expect(isSubsegment(
        new Point(0, 0),
        new Point(0, 6),
        new Point(0, 6),
        new Point(0, 2),
    )).toBe(true);

    expect(isSubsegment(
        new Point(0.5, 4),
        new Point(0.5, 2),
        new Point(0.5, 5),
        new Point(0.5, 3),
    )).toBe(false);

    expect(isSubsegment(
        new Point(0, 0),
        new Point(0, 2),
        new Point(0, 6),
        new Point(0, 1),
    )).toBe(false);

    expect(isSubsegment(
        new Point(3, 3),
        new Point(5, 1),
        new Point(4, 2),
        new Point(3, 3),
    )).toBe(true);

    expect(isSubsegment(
        new Point(4, 2),
        new Point(3, 3),
        new Point(3, 3),
        new Point(5, 1),
        false
    )).toBe(false);

    expect(isSubsegment(
        new Point(3, 1),
        new Point(2, 2),
        new Point(1, 3),
        new Point(4, 0),
    )).toBe(true);

    expect(isSubsegment(
        new Point(2, 4),
        new Point(1, 3),
        new Point(3, 5),
        new Point(1, 3),
    )).toBe(true);

    expect(isSubsegment(
        new Point(4, 6),
        new Point(5, 4),
        new Point(5, 4),
        new Point(4, 6),
    )).toBe(true);

    expect(isSubsegment(
        new Point(4, 3),
        new Point(2, 1),
        new Point(4, 4),
        new Point(3, 5),
    )).toBe(false);

    expect(isSubsegment(
        new Point(3, 3),
        new Point(2, 6),
        new Point(2.666667, 4),
        new Point(2.333334, 5),
    )).toBe(true);
});

test('getUniquePoints', () => {
    expect(getUniquePoints([])).toEqual([]);

    expect(getUniquePoints([
        new Point(2, 0),
        new Point(3, 1),
        new Point(0, 2),
        new Point(2, 0),
        new Point(2, 0),
        new Point(2, 1),
    ])).toEqual([
        new Point(2, 0),
        new Point(3, 1),
        new Point(0, 2),
        new Point(2, 1),
    ]);
});

test('getRepeatedPoints', () => {
    expect(getRepeatedPoints([])).toEqual([]);

    expect(getRepeatedPoints([
        new Point(3, 1),
        new Point(2, 0),
        new Point(3, 1),
    ])).toEqual([
        new Point(3, 1),
    ]);

    expect(getRepeatedPoints([
        new Point(2, 0),
        new Point(3, 1),
    ])).toEqual([]);

    expect(getRepeatedPoints([
        new Point(2, 0),
        new Point(3, 1),
        new Point(0, 2),
        new Point(2, 0),
        new Point(2, 0),
        new Point(2, 1),
    ])).toEqual([
        new Point(2, 0),
    ]);
});

test('sortPoints', () => {
    expect(sortPoints([
        new Point(6, 0),
        new Point(0, 2),
        new Point(2, 4),
        new Point(2, 3),
        new Point(6, 6),
        new Point(0, 3),
        new Point(6, 0),
    ])).toEqual([
        new Point(0, 2),
        new Point(0, 3),
        new Point(2, 3),
        new Point(2, 4),
        new Point(6, 0),
        new Point(6, 0),
        new Point(6, 6),
    ]);

    expect(sortPoints([])).toEqual([]);
});
