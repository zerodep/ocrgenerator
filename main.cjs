'use strict';

const MIN_LENGTH = 2;
const MAX_LENGTH = 25;

/**
 * @enum {string} ErrorCodes Validation error codes
 */
const ErrorCodes = {
  OutOfRange: 'ERR_OCR_OUT_OF_RANGE',
  InvalidChar: 'ERR_OCR_INVALID_CHAR',
};

/**
 * Generate invoice number with length control and checksum.
 * @param {string | number} from
 * @param {import('types').FixedOptions} [options]
 * @returns {GenerateResult}
 */
function generate(from, { fixedLength, minLength = MIN_LENGTH, maxLength = MAX_LENGTH } = {}) {
  if (typeof from === 'number') from = from.toString();
  else if (typeof from !== 'string') throw new TypeError('input must be a string or number');

  if (minLength > maxLength) throw new TypeError('minLength aught to be above maxLength');
  let { sum, length, numbers } = calculateChecksumReversed(from, { fixedLength, maxLength });

  length += 2;

  if (fixedLength && fixedLength <= maxLength) {
    numbers = pad(numbers, length, fixedLength);
    length = fixedLength;
  } else if (length < minLength) {
    numbers = pad(numbers, length, minLength);
    length = minLength;
  }

  const lengthControl = length % 10;
  numbers += lengthControl;

  sum += sumDigits(0, lengthControl);

  const control = controlDigit(sum);
  numbers += control;

  return { numbers, lengthControl, control, length, sum };
}

/**
 * Same as generate without options
 * @param {string | number} from
 * @returns Reference number
 */
function soft(from) {
  return generate(from).numbers;
}

/**
 * Same as generate without options
 * @param {string | number} from Generate from input
 * @returns Reference number
 */
function hard(from) {
  return generate(from).numbers;
}

/**
 * Generate with fixed length
 * Padded with preceeding zeros if too short and capped from left if too long
 * @param {string | number} from Generate from input
 * @param {number} fixedLength OCR reference number length
 * @returns Reference number
 */
function fixed(from, fixedLength) {
  return generate(from, { fixedLength }).numbers;
}

/**
 * Validate OCR reference number
 * @param {string | number} ocr - OCR reference number
 * @param {import('types').LengthOptions} [options] - Validate options
 * @returns {ValidateResult} - Validation result
 */
function validate(ocr, { minLength = MIN_LENGTH, maxLength = MAX_LENGTH } = {}) {
  if (typeof ocr === 'number') ocr = ocr.toString();
  else if (typeof ocr !== 'string') throw new TypeError('input must be a string or number');

  const len = ocr.length;
  const currentControl = Number(ocr[len - 1]);
  if (isNaN(currentControl)) return { valid: false, error_code: ErrorCodes.InvalidChar, message: `char detected at ${len - 1}` };

  const from = ocr.substring(0, len - 1);
  const { sum, error_code, message } = calculateChecksumReversed(from, { validation: true });

  if (error_code) return { valid: false, error_code, message };

  if (len > maxLength) {
    return {
      valid: false,
      error_code: ErrorCodes.OutOfRange,
      message: `OCR reference too long must be between ${minLength} and ${maxLength}`,
    };
  }
  if (len < minLength) {
    return {
      valid: false,
      error_code: ErrorCodes.OutOfRange,
      message: `OCR reference too short must be between ${minLength} and ${maxLength}`,
    };
  }

  // @ts-ignore
  const control = controlDigit(sum);
  return { valid: control == currentControl, control, sum };
}

/**
 * Validate against soft algorithm
 * - Invalid control digit is accepted
 * @param {string | number} ocr OCR reference number
 * @returns Control digit is valid
 */
function validateSoft(ocr) {
  return !!validate(ocr).valid;
}

/**
 * Validate against hard algorithm
 * - Invalid control digit is unacceptable
 * @param {string | number} ocr OCR reference number
 * @returns Control digit is valid
 */
function validateHard(ocr) {
  return !!validate(ocr).valid;
}

/**
 * Validate against variable length algorithm
 * - Invalid control digit is unacceptable
 * - Invalid length control digit is unacceptable
 * @param {string | number} ocr OCR reference number
 * @returns Control digit and length control are valid
 */
function validateVariableLength(ocr) {
  if (typeof ocr === 'number') ocr = ocr.toString();
  if (!validate(ocr).valid) return false;
  const len = ocr.length;
  // @ts-ignore
  return len % 10 == ocr[len - 2];
}

/**
 * Validate against fixed length algorithm
 * - Invalid control digit is unacceptable
 * - Invalid length control digit is unacceptable
 * @param {string | number} ocr OCR reference number
 * @param {number} length1 Check length
 * @param {number} [length2] Optional alternative length
 * @returns Control digit and length control are valid
 */
function validateFixedLength(ocr, length1, length2) {
  if (typeof ocr === 'number') ocr = ocr.toString();
  if (length1 < MIN_LENGTH || length1 > MAX_LENGTH) return false;
  length2 = length2 || length1;
  if (length2 < MIN_LENGTH || length2 > MAX_LENGTH) return false;
  if (!length1 && !length2) return false;

  if (!validate(ocr).valid) return false;

  const len = ocr.length;
  return len === length1 || len === length2;
}

/**
 * Calculate checksum
 * @param {string} from Input
 * @param {import('types').CalculateOptions} [options]
 * @returns {Partial<ChecksumResult>}
 */
function calculateChecksumReversed(from, { fixedLength, maxLength = MAX_LENGTH, validation } = {}) {
  let sum = 0;
  let numbers = '';
  let length = 0;
  let position = validation ? -1 : 0;

  for (let i = from.length - 1; i >= 0; --i) {
    const c = Number(from[i]);
    if (isNaN(c)) {
      if (validation) {
        return { error_code: ErrorCodes.InvalidChar, message: `char detected at ${i}` };
      }
      continue;
    }
    if (fixedLength && length + 2 === fixedLength) break;
    if (length + 3 > maxLength) {
      if (validation) {
        return {
          error_code: ErrorCodes.OutOfRange,
          message: `OCR reference too long must be between ${MIN_LENGTH} and ${maxLength}`,
        };
      }
      break;
    }
    position++;
    length++;
    numbers = c + numbers;

    sum += sumDigits(position, c);
  }
  return { numbers, sum, length };
}

/**
 * @param {number} position
 * @param {number} d
 */
function sumDigits(position, d) {
  if (position % 2) return d;
  return d < 5 ? d * 2 : d * 2 - 9;
}

/**
 * @param {number} sum
 */
function controlDigit(sum) {
  const digit = sum % 10;
  return digit ? 10 - digit : 0;
}

/**
 * @param {string} str
 * @param {number} fromLength
 * @param {number} uptoLength
 */
function pad(str, fromLength, uptoLength) {
  if (fromLength < uptoLength) {
    str =
      Array(uptoLength - fromLength)
        .fill('0')
        .join('') + str;
  }
  return str;
}

/**
 * @typedef {object} ChecksumResult
 * @property {string} numbers Reference number
 * @property {number} sum Reversed checksum
 * @property {number} length Reference number length, including control digit
 * @property {ErrorCodes} [error_code] Occasional error code
 * @property {string} [message] Error message associated with error code
 */

/**
 * @typedef {object} GenerateResult
 * @property {string} numbers Reference number
 * @property {number} sum Reversed checksum
 * @property {number} lengthControl Length control digit
 * @property {number} control Reversed checksum
 * @property {number} length Reference number length, including control digit
 */

/**
 * @typedef ValidateResult
 * @property {boolean} valid Is valid reference number
 * @property {number} [control] Control digit
 * @property {number} [sum] Reversed checksum
 * @property {ErrorCodes} [error_code] Occasional error code
 * @property {string} [message] Error message associated with error code
 */

exports.ErrorCodes = ErrorCodes;
exports.MAX_LENGTH = MAX_LENGTH;
exports.MIN_LENGTH = MIN_LENGTH;
exports.calculateChecksumReversed = calculateChecksumReversed;
exports.fixed = fixed;
exports.generate = generate;
exports.hard = hard;
exports.soft = soft;
exports.validate = validate;
exports.validateFixedLength = validateFixedLength;
exports.validateHard = validateHard;
exports.validateSoft = validateSoft;
exports.validateVariableLength = validateVariableLength;
