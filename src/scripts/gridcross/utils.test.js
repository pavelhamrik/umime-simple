import {
    isAsc,
    weightedRandom,
    weightedRandomFromArr
} from './utils';

test('isAsc', () => {
    expect(isAsc([-Infinity, 0, 0, 1])).toBe(true);
    expect(isAsc([0, 2, 1])).toBe(false);
    expect(isAsc([0, 3, 2, 5])).toBe(false);
    expect(isAsc([])).toBe(true);
});

test('weightedRandom', () => {
    expect(weightedRandom([0.2, 0.8], 0.94277229096926)).toBe(1);
    expect(weightedRandom([0.0, 0.8], 0.94277229096926)).toBe(1);
    expect(weightedRandom([0.0, 1.0], 0.94277229096926)).toBe(1);
    expect(weightedRandom([0.1, 0.9], 0.04277229096926)).toBe(0);
    expect(weightedRandom([0.1, 0.2, 0.7], 0.34277229096926)).toBe(2);
});

test('weightedRandomFromArr', () => {
    expect(
        weightedRandomFromArr([
            {weight: 0.2, label: '0'},
            {weight: 0.8, label: '1'},
        ], 'weight', 0.94277229096926)
    ).toEqual(
        {weight: 0.8, label: '1'}
    );

    expect(
        weightedRandomFromArr([
            {weight: 0.0, label: '0'},
        ], 'weight', 0.94277229096926)
    ).toEqual(
        {}
    );

    expect(
        weightedRandomFromArr([
            {weight: 0.2, label: '0'},
            {weight: 0.5, label: '1'},
            {weight: 0.2, label: '2'},
        ], 'weight', 0.6854946171190417)
    ).toEqual(
        {weight: 0.5, label: '1'}
    );
});
