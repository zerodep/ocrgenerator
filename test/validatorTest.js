import assert from 'assert';
import {validateSoft, validateHard, validateVariableLength, validateFixedLength} from '../index';
import {mjukkontroll, hardkontroll, fastlangd, langdsiffra} from './bghelpers';

const valids = [
  '18108401345678778',
  '18196701475307475',
  '1018966492531',
  '1019080881039',
  '03368912618',
  '1202951008',
  '1636976',
];

const validChecksumOnly = '1636919';
const tooLong = Array(24).fill(1) + '61';

describe('validate', () => {
  describe('mjuk kontrollnivå', () => {
    valids.forEach((valid) => {
      it(`valid ${valid} returns true`, () => {
        assert.equal(validateSoft(valid), mjukkontroll(valid));
      });
    });

    it('returns true even if length control digit is off', () => {
      const result = validateSoft(validChecksumOnly);
      assert.equal(result, mjukkontroll(validChecksumOnly));
      assert.equal(result, true);
    });

    it('returns true if just 2 zeros', () => {
      const result = validateSoft('00');
      assert.equal(result, mjukkontroll('00'));
      assert.equal(result, true);
    });

    it('returns false if only characters', () => {
      const result = validateSoft('ABC');
      assert.equal(result, mjukkontroll('ABC'));
      assert.equal(result, false);
    });

    it('returns false if length is above 25', () => {
      const result = validateSoft(tooLong);
      assert.equal(result, mjukkontroll(tooLong));
      assert.equal(result, false);
    });
  });

  describe('hård kontrollnivå', () => {
    valids.forEach((valid) => {
      it(`valid ${valid} returns true`, () => {
        assert.equal(validateHard(valid), hardkontroll(valid));
      });
    });

    it('returns true even if length control digit is off', () => {
      const result = validateHard(validChecksumOnly);
      assert.equal(result, hardkontroll(validChecksumOnly));
      assert.equal(result, true);
    });

    it('returns true if just 2 zeros', () => {
      const result = validateHard('00');
      assert.equal(result, hardkontroll('00'));
      assert.equal(result, true);
    });

    it('returns false if only characters', () => {
      const result = validateHard('ABC');
      assert.equal(result, hardkontroll('ABC'));
      assert.equal(result, false);
    });

    it('returns false if length is above 25', () => {
      const result = validateHard(tooLong);
      assert.equal(result, hardkontroll(tooLong));
      assert.equal(result, false);
    });
  });

  describe('variabel kontroll av längdsiffra i OCR-referensnumret', () => {
    valids.forEach((valid) => {
      it(`valid ${valid} returns true`, () => {
        assert.equal(validateVariableLength(valid), langdsiffra(valid));
      });
    });

    it('returns false if invalid length control', () => {
      const result = validateVariableLength(validChecksumOnly);
      assert.equal(result, langdsiffra(validChecksumOnly));
      assert.equal(result, false);
    });

    it('returns false if just 2 zeros', () => {
      const result = validateVariableLength('00');
      assert.equal(result, langdsiffra('00'));
      assert.equal(result, false);
    });

    it('returns false if only characters', () => {
      const result = validateVariableLength('ABC');
      assert.equal(result, langdsiffra('ABC'));
      assert.equal(result, false);
    });

    it('returns false if length is above 25', () => {
      const result = validateVariableLength(tooLong);
      assert.equal(result, langdsiffra(tooLong));
      assert.equal(result, false);
    });
  });

  describe('fast längdkontroll i OCR-referensnumret', () => {
    valids.forEach((valid) => {
      it(`valid ${valid} returns true`, () => {
        assert.equal(validateFixedLength(valid, valid.length, valid.length + 1), fastlangd(valid, valid.length, valid.length + 1));
      });
    });

    it('returns true if valid total length matches one of length argument', () => {
      const result = validateFixedLength(validChecksumOnly, 7, 8);
      assert.equal(result, fastlangd(validChecksumOnly, 7, 8));
      assert.equal(result, true);
    });

    it('returns true if valid total length only one matching length is passed', () => {
      const result = validateFixedLength(validChecksumOnly, 7);
      assert.equal(result, fastlangd(validChecksumOnly, 7));
      assert.equal(result, true);
    });

    it('returns false if length is not among length arguments', () => {
      const result = validateFixedLength(validChecksumOnly, 11, 1);
      assert.equal(result, fastlangd(validChecksumOnly, 11, 1));
      assert.equal(result, false);
    });

    it('returns false if no length argument', () => {
      assert.equal(validateFixedLength(validChecksumOnly), false);
    });

    it('returns true if just 2 zeros', () => {
      const result = validateFixedLength('00', 2, 3);
      assert.equal(result, fastlangd('00', 2, 3));
      assert.equal(result, true);
    });

    it('returns false if one length is below 2', () => {
      let result = validateFixedLength('00', 1, 2);
      assert.equal(result, fastlangd('00', 1, 2), 'first length');
      assert.equal(result, false, 'first length');

      result = validateFixedLength('00', 2, 1);
      assert.equal(result, fastlangd('00', 2, 1), 'second length');
      assert.equal(result, false, 'second length');
    });

    it('returns false if one length is above 25', () => {
      let result = validateFixedLength('00', 26, 2);
      assert.equal(result, fastlangd('00', 26, 2), 'first length');
      assert.equal(result, false, 'first length');

      result = validateFixedLength('00', 2, 26);
      assert.equal(result, fastlangd('00', 2, 26), 'second length');
      assert.equal(result, false, 'second length');
    });

    it('returns false if only characters', () => {
      const result = validateFixedLength('ABC', 2, 3);
      assert.equal(result, fastlangd('ABC', 2, 3));
      assert.equal(result, false);
    });

    it('returns false if length is above 25', () => {
      const result = validateFixedLength(tooLong, 2, 3);
      assert.equal(result, fastlangd(tooLong, 2, 3));
      assert.equal(result, false);
    });
  });
});

