import assert from 'assert';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';

const umdSource = readFileSync(new URL('../ocrgenerator.cjs', import.meta.url), 'utf8');

const expectedExports = [
  'ErrorCodes',
  'MAX_LENGTH',
  'MIN_LENGTH',
  'calculateChecksumReversed',
  'fixed',
  'generate',
  'hard',
  'soft',
  'validate',
  'validateFixedLength',
  'validateHard',
  'validateSoft',
  'validateVariableLength',
];

describe('isomorphic UMD bundle in happy-dom', () => {
  let window;
  let ocrgenerator;

  before(() => {
    window = new Window({
      url: 'https://example.test/',
      settings: {
        enableJavaScriptEvaluation: true,
        suppressInsecureJavaScriptEnvironmentWarning: true,
      },
    });
    const script = window.document.createElement('script');
    script.textContent = umdSource;
    window.document.head.appendChild(script);
    ocrgenerator = window.ocrgenerator;
  });

  after(async () => {
    await window.happyDOM.close();
  });

  describe('environment', () => {
    it('runs in a browser-like scope without Node globals', () => {
      assert.equal(typeof window.document, 'object');
      assert.equal(typeof window.navigator, 'object');
      assert.equal(typeof window.module, 'undefined');
      assert.equal(typeof window.exports, 'undefined');
      assert.equal(typeof window.process, 'undefined');
    });

    it('UMD wrapper attaches the namespace to window', () => {
      assert.ok(ocrgenerator, 'window.ocrgenerator should be defined');
      assert.equal(typeof ocrgenerator, 'object');
    });

    it('exposes the full public API', () => {
      assert.deepEqual(Object.keys(ocrgenerator).sort(), expectedExports);
    });

    it('exposes constants and error codes', () => {
      assert.equal(ocrgenerator.MIN_LENGTH, 2);
      assert.equal(ocrgenerator.MAX_LENGTH, 25);
      assert.equal(ocrgenerator.ErrorCodes.OutOfRange, 'ERR_OCR_OUT_OF_RANGE');
      assert.equal(ocrgenerator.ErrorCodes.InvalidChar, 'ERR_OCR_INVALID_CHAR');
    });
  });

  describe('generate', () => {
    it('produces the README example', () => {
      const { numbers } = ocrgenerator.generate('Customer007:Date2019-12-24:Amount$200');
      assert.equal(numbers, '0072019122420063');
    });

    it('soft and hard return strings', () => {
      assert.equal(typeof ocrgenerator.soft('1234'), 'string');
      assert.equal(typeof ocrgenerator.hard('1234'), 'string');
    });

    it('fixed pads with leading zeros', () => {
      assert.equal(ocrgenerator.fixed('42', 8), '00004283');
    });
  });

  describe('validate', () => {
    it('accepts a valid OCR', () => {
      assert.equal(ocrgenerator.validate('1636976').valid, true);
    });

    it('rejects an OCR with a bad control digit', () => {
      assert.equal(ocrgenerator.validate('1636977').valid, false);
    });

    it('reports invalid characters with ERR_OCR_INVALID_CHAR', () => {
      const result = ocrgenerator.validate('1636A76');
      assert.equal(result.valid, false);
      assert.equal(result.error_code, 'ERR_OCR_INVALID_CHAR');
    });

    it('honors plusgirot bounds passed via options', () => {
      assert.equal(ocrgenerator.validate('00059', { minLength: 5, maxLength: 15 }).valid, true);
      assert.equal(ocrgenerator.validate('18108401345678778', { minLength: 5, maxLength: 15 }).error_code, 'ERR_OCR_OUT_OF_RANGE');
    });
  });

  describe('algorithm-specific validators', () => {
    it('validateSoft accepts a valid OCR', () => {
      assert.equal(ocrgenerator.validateSoft('1636976'), true);
    });

    it('validateHard accepts a valid OCR', () => {
      assert.equal(ocrgenerator.validateHard('1636976'), true);
    });

    it('validateVariableLength accepts a valid OCR with correct length digit', () => {
      assert.equal(ocrgenerator.validateVariableLength('1202951008'), true);
    });

    it('validateFixedLength accepts a valid OCR of expected length', () => {
      assert.equal(ocrgenerator.validateFixedLength('1636976', 7), true);
    });
  });

  describe('round-trip in browser scope', () => {
    it('generates an OCR that subsequently validates', () => {
      const ocr = ocrgenerator.generate('Customer007:Date2019-12-24:Amount$200').numbers;
      assert.equal(ocrgenerator.validateHard(ocr), true);
    });
  });
});
