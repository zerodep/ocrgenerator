import assert from 'assert';
import {calculateChecksumReversed, calculateChecksumWithLength} from '../index';

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

  describe('calculateChecksumWithLength(from[, fixedLength])', () => {
    it('returns result extracted numbers, sum, total length, and control digits from string', () => {
      const result = calculateChecksumWithLength('Customer007:Date2019-12-24:Amount$200');
      assert.deepEqual(result, {
        numbers: '0072019122420063',
        sum: 37,
        length: 16,
        lengthControl: 6,
        control: 3
      });
    });

    it('fixed short length caps from right', () => {
      const result = calculateChecksumWithLength('Customer007:Date2019-12-24:Amount$200', {fixedLength: 10});
      assert.deepEqual(result, {
        numbers: '9122420004',
        sum: 26,
        length: 10,
        lengthControl: 0,
        control: 4
      });
    });

    it('fixed long length adds zeros to the left', () => {
      const result = calculateChecksumWithLength('Customer007:Date2019-12-24:Amount$200', {fixedLength: 25});
      assert.deepEqual(result, {
        numbers: '0000000000072019122420055',
        sum: 35,
        length: 25,
        lengthControl: 5,
        control: 5
      });
    });
  });
});
