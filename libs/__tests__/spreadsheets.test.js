const { toColumnName, parseColumnToIndex } = require('../spreadsheets');

describe('libs/spreadsheets', () => {
  describe(toColumnName, () => {
    it('0 => A', () => {
      const subject = 0;
      const expected = 'A';
      expect(toColumnName(subject)).toBe(expected);
    });

    it('25 => Z', () => {
      const subject = 25;
      const expected = 'Z';
      expect(toColumnName(subject)).toBe(expected);
    });

    it('26 => AA', () => {
      const subject = 26;
      const expected = 'AA';
      expect(toColumnName(subject)).toBe(expected);
    });

    it('29 => AD', () => {
      const subject = 29;
      const expected = 'AD';
      expect(toColumnName(subject)).toBe(expected);
    });
  });

  describe(parseColumnToIndex, () => {
    it('A => 0', () => {
      const subject = 'A';
      const expected = 0;
      expect(parseColumnToIndex(subject)).toBe(expected);
    });

    it('Z => 25', () => {
      const subject = 'Z';
      const expected = 25;
      expect(parseColumnToIndex(subject)).toBe(expected);
    });

    it('AA => 26', () => {
      const subject = 'AA';
      const expected = 26;
      expect(parseColumnToIndex(subject)).toBe(expected);
    });

    it('AD => 29', () => {
      const subject = 'AD';
      const expected = 29;
      expect(parseColumnToIndex(subject)).toBe(expected);
    });
  });
});
