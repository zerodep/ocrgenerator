import assert from 'assert';
import {calculateChecksumReversed} from '../index.js';

describe('calculate', () => {
  describe('calculateChecksumReversed(from[, fixedLength])', () => {
    it('returns result extracted numbers, sum, and length from string', () => {
      const result = calculateChecksumReversed('Customer007:Date2019-12-24:Amount$200');
      assert.deepEqual(result, {
        numbers: '00720191224200',
        sum: 34,
        length: 14
      });
    });
  });
});
