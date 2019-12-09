'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const MIN_LENGTH = 2;
const MAX_LENGTH = 25;
const ERR_OUT_OF_RANGE = 'ERR_OCR_OUT_OF_RANGE';
const ERR_INVALID_CHAR = 'ERR_OCR_INVALID_CHAR';

function generate(from, {fixedLength} = {}) {
  if (typeof from === 'number') from = from.toString();
  else if (typeof from !== 'string') throw new TypeError('input must be a string or number');
  const result = calculateChecksumWithLength(from, {fixedLength});
  return result && result.numbers;
}

function soft(from) {
  return generate(from);
}

function hard(from) {
  return generate(from);
}

function fixed(from, fixedLength) {
  return generate(from, {fixedLength});
}

function validate(ocr) {
  if (typeof ocr === 'number') ocr = ocr.toString();
  else if (typeof ocr !== 'string') throw new TypeError('input must be a string or number');

  const len = ocr.length;
  const from = ocr.substring(0, len - 1);
  const {sum, error_code, message} = calculateChecksumReversed(from, {validation: true});
  if (error_code) return {error_code, message};

  if (len > MAX_LENGTH) return {error_code: ERR_OUT_OF_RANGE, message: `OCR reference too long must be between ${MIN_LENGTH} and ${MAX_LENGTH}`};
  if (len < MIN_LENGTH) return {error_code: ERR_OUT_OF_RANGE, message: `OCR reference too short must be between ${MIN_LENGTH} and ${MAX_LENGTH}`};

  const control = controlDigit(sum);
  return {valid: control == ocr[len - 1]};
}

function validateSoft(ocr) {
  return !!validate(ocr).valid;
}

function validateVariableLength(ocr) {
  if (!validate(ocr).valid) return false;
  return (ocr.length % 10) == ocr[ocr.length - 2];
}

function validateFixedLength(ocr, length1, length2) {
  if (length1 < MIN_LENGTH || length1 > MAX_LENGTH) return false;
  length2 = length2 || length1;
  if (length2 < MIN_LENGTH || length2 > MAX_LENGTH) return false;
  if (!length1 && !length2) return false;

  if (!validate(ocr).valid) return false;

  const len = ocr.length;
  return (len === length1 || len === length2);
}

function calculateChecksumWithLength(from, {fixedLength} = {}) {
  let {sum, length, numbers} = calculateChecksumReversed(from, {fixedLength});
  if (!length) return;

  if (fixedLength) {
    if (length < fixedLength - 1) {
      numbers = Array(fixedLength - length - 2).fill('0').join('') + numbers;
    }
    length = fixedLength;
  } else {
    length += 2;
  }

  const lengthControl = length % 10;
  numbers += lengthControl;

  sum += sumDigits(0, lengthControl);

  const res = sum % 10;

  const control = res === 0 ? 0 : 10 - res;
  numbers += control;

  return {numbers, lengthControl, control, length, sum};
}

function calculateChecksumReversed(from, {fixedLength, validation} = {}) {
  let sum = 0;
  let numbers = '';
  let len = 0;
  let pos = validation ? -1 : 0;

  for (let i = from.length - 1; i >= 0; --i) {
    const c = Number(from[i]);
    if (isNaN(c)) {
      if (validation) return {error_code: ERR_INVALID_CHAR, message: `char detected at ${i}`};
      continue;
    }
    if (len > MAX_LENGTH - 3) {
      if (validation) return {error_code: ERR_OUT_OF_RANGE, message: `OCR reference too long must be between ${MIN_LENGTH} and ${MAX_LENGTH}`};
      break;
    }
    ++pos;
    ++len;
    if (fixedLength && len === fixedLength - 1) break;
    numbers = c + numbers;

    sum += sumDigits(pos, c);
  }
  return {numbers, sum, length: len};
}

function sumDigits(position, d) {
  if (position % 2) return d;
  return d < 5 ? d * 2 : d * 2 - 9;
}

function controlDigit(sum) {
  const digit = sum % 10;
  return digit === 0 ? 0 : 10 - digit;
}

exports.MAX_LENGTH = MAX_LENGTH;
exports.MIN_LENGTH = MIN_LENGTH;
exports.calculateChecksumReversed = calculateChecksumReversed;
exports.calculateChecksumWithLength = calculateChecksumWithLength;
exports.fixed = fixed;
exports.generate = generate;
exports.hard = hard;
exports.soft = soft;
exports.validate = validate;
exports.validateFixedLength = validateFixedLength;
exports.validateHard = validateSoft;
exports.validateSoft = validateSoft;
exports.validateVariableLength = validateVariableLength;
