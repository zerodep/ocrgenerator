const MIN_LENGTH = 2;
const MAX_LENGTH = 25;
const ERR_OUT_OF_RANGE = 'ERR_OCR_OUT_OF_RANGE';
const ERR_INVALID_CHAR = 'ERR_OCR_INVALID_CHAR';

export {
  MIN_LENGTH,
  MAX_LENGTH,
  calculateChecksumReversed,
  fixed,
  generate,
  hard,
  soft,
  validate,
  validateFixedLength,
  validateVariableLength,
  validateSoft,
  validateSoft as validateHard,
};

function generate(from, {fixedLength, minLength = MIN_LENGTH, maxLength = MAX_LENGTH} = {}) {
  if (typeof from === 'number') from = from.toString();
  else if (typeof from !== 'string') throw new TypeError('input must be a string or number');

  if (minLength > maxLength) throw new TypeError('minLength aught to be above maxLength');
  let {sum, length, numbers} = calculateChecksumReversed(from, {fixedLength, maxLength});

  length += 2;

  if (fixedLength && fixedLength <= maxLength) {
    pad(fixedLength);
  } else if (length < minLength) {
    pad(minLength);
  }

  const lengthControl = length % 10;
  numbers += lengthControl;

  sum += sumDigits(0, lengthControl);

  const control = controlDigit(sum);
  numbers += control;

  return {numbers, lengthControl, control, length, sum};

  function pad(uptoLength) {
    if (length < uptoLength) {
      numbers = Array(uptoLength - length).fill('0').join('') + numbers;
      length = uptoLength;
    }
  }
}

function soft(from) {
  return generate(from).numbers;
}

function hard(from) {
  return generate(from).numbers;
}

function fixed(from, fixedLength) {
  return generate(from, {fixedLength}).numbers;
}

function validate(ocr, {minLength = MIN_LENGTH, maxLength = MAX_LENGTH} = {}) {
  if (typeof ocr === 'number') ocr = ocr.toString();
  else if (typeof ocr !== 'string') throw new TypeError('input must be a string or number');

  const len = ocr.length;
  const from = ocr.substring(0, len - 1);
  const {sum, error_code, message} = calculateChecksumReversed(from, {validation: true});
  if (error_code) return {error_code, message};

  if (len > maxLength) return {error_code: ERR_OUT_OF_RANGE, message: `OCR reference too long must be between ${minLength} and ${maxLength}`};
  if (len < minLength) return {error_code: ERR_OUT_OF_RANGE, message: `OCR reference too short must be between ${minLength} and ${maxLength}`};

  const control = controlDigit(sum);
  return {valid: control == ocr[len - 1], control, sum};
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

function calculateChecksumReversed(from, {fixedLength, maxLength = MAX_LENGTH, validation} = {}) {
  let sum = 0;
  let numbers = '';
  let length = 0;
  let pos = validation ? -1 : 0;

  for (let i = from.length - 1; i >= 0; --i) {
    const c = Number(from[i]);
    if (isNaN(c)) {
      if (validation) return {error_code: ERR_INVALID_CHAR, message: `char detected at ${i}`};
      continue;
    }
    if (fixedLength && length + 2 === fixedLength) break;
    if (length + 3 > maxLength) {
      if (validation) return {error_code: ERR_OUT_OF_RANGE, message: `OCR reference too long must be between ${MIN_LENGTH} and ${maxLength}`};
      break;
    }
    ++pos;
    ++length;
    numbers = c + numbers;

    sum += sumDigits(pos, c);
  }
  return {numbers, sum, length};
}

function sumDigits(position, d) {
  if (position % 2) return d;
  return d < 5 ? d * 2 : d * 2 - 9;
}

function controlDigit(sum) {
  const digit = sum % 10;
  return digit ? 10 - digit : 0;
}
