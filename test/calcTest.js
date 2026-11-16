import assert from 'assert';
import { calculateChecksumReversed } from 'ocrgenerator';

describe('calculate', () => {
  describe('calculateChecksumReversed(from[, fixedLength])', () => {
    it('returns result extracted numbers, sum, and length from string', () => {
      const result = calculateChecksumReversed('Customer007:Date2019-12-24:Amount$200');
      assert.deepEqual(result, {
        numbers: '00720191224200',
        sum: 34,
        length: 14,
      });
    });

    it('accepts number', () => {
      assert.deepEqual(calculateChecksumReversed(12345678), {
        numbers: '12345678',
        sum: 34,
        length: 8,
      });
    });

    it('ignores blank, tab, and newline', () => {
      for (const from of ['12 34 56 78', '1234\n5678', '1234\r\n5678', '\t12345678', '12345678 \n', '1234\u00a05678']) {
        assert.deepEqual(calculateChecksumReversed(from), { numbers: '12345678', sum: 34, length: 8 }, JSON.stringify(from));
      }
    });

    it('validation takes reference without control digit up to max length', () => {
      const result = calculateChecksumReversed('890123456789012345678905', { validation: true });
      assert.deepEqual(result, {
        numbers: '890123456789012345678905',
        sum: 104,
        length: 24,
      });
    });

    it('validation returns error out of range if reference with control digit exceeds max length', () => {
      const result = calculateChecksumReversed('8901234567890123456789056', { validation: true });
      assert.deepEqual(result, {
        error_code: 'ERR_OCR_OUT_OF_RANGE',
        message: 'OCR reference too long must be between 2 and 25',
      });
    });

    it('validation returns error invalid char if a character is encountered', () => {
      const result = calculateChecksumReversed('0072019-12242006', { validation: true });
      assert.deepEqual(result, {
        error_code: 'ERR_OCR_INVALID_CHAR',
        message: 'char detected at 7',
      });
    });

    it('validation returns error invalid char if blank, tab, or newline is encountered', () => {
      for (const [from, position] of [
        ['12 347', 2],
        ['123\n47', 3],
        ['\t12347', 0],
        ['12347\r', 5],
        ['1234\u00a07', 4],
      ]) {
        assert.deepEqual(
          calculateChecksumReversed(from, { validation: true }),
          { error_code: 'ERR_OCR_INVALID_CHAR', message: `char detected at ${position}` },
          JSON.stringify(from),
        );
      }
    });

    it('throws TypeError if input is neither string nor number', () => {
      assert.throws(() => calculateChecksumReversed(), { name: 'TypeError' });
      assert.throws(() => calculateChecksumReversed(null), { name: 'TypeError' });
      assert.throws(() => calculateChecksumReversed({}), { name: 'TypeError' });
      assert.throws(() => calculateChecksumReversed(null, { validation: true }), { name: 'TypeError' });
    });
  });
});
