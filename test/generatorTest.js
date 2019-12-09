import assert from 'assert';
import {soft, hard, fixed} from '../index';
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

const fromString = [
  ['2019121', '201912193', '0000201912136', '201951'],
  ['2019-12-07200', '2019120720030', '0002019120720063'],
  ['2019-12-072002376', '20191207200237673', '020191207200237681'],
  ['Customer007:Date2019-12-24:Amount$200', '0072019122420063', '000000072019122420014'],
];

describe('generate', () => {
  describe('mjuk kontrollnivå', () => {
    // Företaget ska producera OCR-referensnummer med checksiffra.
    // Sista siffran ska vara checksiffra enligt 10-modul.
    // Det ska framgå av faktura eller motsvarande att OCR-referensnummer ska användas vid betalning till aktuellt bankgironummer.
    // Alla internetbanker kommer att uppmana betalaren att registrera ett korrekt OCR-referensnummer, men accepterar ett annat referensbegrepp efter en varning, eftersom avtalet har mjuk kontrollnivå.
    valids.forEach((valid) => {
      it(`valid ${valid} adds length control digit and reference control digit`, () => {
        assert.equal(mjukkontroll(valid), true, 'soft control');

        const input = valid.substring(0, valid.length - 2);
        const result = soft(input);

        assert.equal(mjukkontroll(result), true, result);
        assert.equal(result, valid);
      });
    });

    fromString.forEach(([input, valid]) => {
      it(`from ${input} to ${valid} adds length control digit and reference control digit`, () => {
        const result = soft(input);
        assert.equal(result, valid);
        assert.equal(mjukkontroll(result), true, valid);
      });
    });
  });

  describe('hård kontrollnivå', () => {
    // Företaget ska producera OCR-referensnummer med checksiffra.
    // Sista siffran ska vara checksiffra enligt 10-modul.
    // Det ska framgå av faktura eller motsvarande att enbart OCR-referensnummer ska användas vid betalning till aktuellt bankgironummer.
    // Internetbanker kommer att uppmana betalaren att registrera ett korrekt OCR-referensnummer och accepterar bara referensnummer med korrekt checksiffra.
    // Betalningar med korrekt OCR-referensnummer redovisas enligt överenskommelse, normalt på fil.

    valids.forEach((valid) => {
      const input = valid.substring(0, valid.length - 2);

      it(`${input} -> ${valid} adds length control digit and reference control digit`, () => {
        const result = hard(input);
        assert.equal(result, valid);
        assert.equal(hardkontroll(result), true);
      });
    });

    fromString.forEach(([input, valid]) => {
      it(`from ${input} to ${valid} adds length control digit and reference control digit`, () => {
        const result = hard(input);
        assert.equal(hardkontroll(result), true, valid);
        assert.equal(result, valid);
      });
    });
  });

  describe('variabel kontroll av längdsiffra i OCR-referensnumret', () => {
    // Företaget ska producera OCR-referensnummer med både checksiffra och längdsiffra.
    // Sista siffran ska vara checksiffra enligt 10-modul.
    // Näst sista siffran är längdsiffran, d v s en entalssiffra som anger referensnumrets längd inklusive checksiffra.
    // Om referensnumret t ex är 24, 14 eller 4 tecken långt är den korrekta längdsiffran 4.
    // Det ska framgå av faktura eller motsvarande att enbart OCR-referensnummer ska användas vid betalning till aktuellt bankgironummer.
    // Internetbanker kommer att uppmana betalaren att registrera ett korrekt OCR-referensnummer och accepterar bara referensnummer med korrekt checksiffra och korrekt längdsiffra.
    // Betalningar med korrekt OCR-referensnummer redovisas enligt överenskommelse, normalt på fil.

    valids.forEach((result) => {
      it(`${result} adds length control digit and reference control digit`, () => {
        const input = result.substring(0, result.length - 2);
        assert.equal(hard(input), result, input);
        assert.equal(langdsiffra(result), true);
      });
    });

    fromString.forEach(([input, valid]) => {
      it(`from ${input} to ${valid} adds length control digit and reference control digit`, () => {
        const result = hard(input);
        assert.equal(langdsiffra(result), true, valid);
        assert.equal(result, valid);
      });
    });
  });

  describe('fast längdkontroll i OCR-referensnumret', () => {
    // Företaget ska producera OCR-referensnummer, med checksiffra, som består av det antal siffror som regleras i avtalet.
    // Sista siffran ska vara checksiffra enligt 10-modul.
    // OCR-referensnumrets antal tecken (längd) ska stämma med någon av de i avtalet valda längderna (max 2 olika antal tecken kan väljas).
    // De valda längderna noteras i avtalet med företagets bank och information om de valda längderna distribueras till alla internetbanker från Bankgirot.
    // Det ska framgå av faktura eller motsvarande att enbart OCR-referensnummer ska användas vid betalning till aktuellt bankgironummer.
    // Internetbanker kommer att uppmana betalaren att registrera ett korrekt OCR-referensnummer och accepterar bara referensnummer med korrekt checksiffra och en längd som stämmer med någon av de valda längderna i avtalet.
    // Betalningar med korrekt OCR-referensnummer redovisas enligt överenskommelse, normalt på fil.
    // Är du osäker på vilket avtal som gäller, kontakta din bank.
    valids.forEach((valid) => {
      it(`${valid} adds length control digit and reference control digit`, () => {
        const input = valid.substring(0, valid.length - 2);
        const result = fixed(input, valid.length);
        assert.equal(result, valid);
        assert.equal(result.length, valid.length, 'expected length');
        assert.equal(fastlangd(result, result.length, result.length), true);
      });
    });

    fromString.forEach(([input,, valid]) => {
      const length = valid.length;
      it(`from ${input} with fixed length ${length} pads with leading zeros to ${valid}`, () => {
        const result = fixed(input, length);
        assert.equal(result, valid);
        assert.equal(result.length, length, 'expected length');
        assert.equal(fastlangd(result, length, length), true, valid);
      });
    });

    it('input longer than fixed length is capped backwards', () => {
      const result = fixed('Customer007:Date2019-12-24:Amount$200', 13);
      const valid = '2019122420035';
      assert.equal(result, valid);
      assert.equal(result.length, 13, 'expected length');
      assert.equal(fastlangd(result, 13, 13), true, valid);
    });
  });
});
