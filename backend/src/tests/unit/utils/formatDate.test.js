const formatDate = require('../../../utils/formatDate');

test('formats date correctly for YYYY-MM-DD', () => {
	expect(formatDate(new Date('2023-10-01'), 'YYYY-MM-DD')).toBe('2023-10-01');
});

test('formats date correctly for MM/DD/YYYY', () => {
	expect(formatDate(new Date('2023-10-01'), 'MM/DD/YYYY')).toBe('10/01/2023');
});

test('formats date correctly for DD-MM-YYYY', () => {
	expect(formatDate(new Date('2023-10-01'), 'DD-MM-YYYY')).toBe('01-10-2023');
});