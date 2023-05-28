declare type from = string | number;

interface LengthOptions {
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
}

interface FixedOptions extends LengthOptions {
  /** Fixed length */
  fixedLength?: number;
}

interface CalculateOptions extends FixedOptions {
  /**
   * Validation in progress
   * - true will disregard control digit when calculating checksum
   *   but throw if encountering invalid characters or length control
   * - false will ignore invalid characters and length control
   */
  validation?: boolean;
}

/**
 * @enum {string}
 * Validation error codes
 */
export const enum ErrorCode {
  /**
   * OCR reference length is out of range
   */
  OutOfRange = 'ERR_OCR_OUT_OF_RANGE',
  /**
   * A character has sneeked into ocr
   */
  InvalidChar = 'ERR_OCR_INVALID_CHAR',
}

interface ErrorResult {
  /** Occasional error code */
  error_code?: ErrorCode;
  /** Error message associated with error code */
  message?: string;
}

export interface ChecksumResult extends ErrorResult {
  /** Reference number */
  numbers: string,
  /** Reversed checksum */
  sum: number;
  /** Reference number length, including control digit */
  length: number,
}

export interface GenerateResult {
  /** Reference number */
  numbers: string,
  /** Length control digit */
  lengthControl: number;
  /** Control digit */
  control: number;
  /** Reference number length, including control digit */
  length: number,
  /** Reversed checksum */
  sum: number;
}

export interface ValidateResult extends ErrorResult {
  /** Is valid reference number */
  valid: boolean,
  /** Control digit */
  control: number;
  /** Reversed checksum */
  sum: number;
}

export const MIN_LENGTH = 2;
export const MAX_LENGTH = 25;

/**
 * Generate invoice number with length control and checksum.
 * @param {string | number} from Generate from input
 * @param {object} [options] Generate options
 */
export function generate(from: from, options?: FixedOptions): GenerateResult;

/**
 * Same as generate without options
 * @param from
 *
 * @returns {string} Reference number
 */
export function soft(from: from): string;

/**
 * Same as generate without options
 * @param from Generate from input
 *
 * @returns {string} Reference number
 */
export function hard(from: from): string;

/**
 * Generate with fixed length
 * Padded with preceeding zeros if too short and capped from left if too long
 * @param from Generate from input
 * @param fixedLength OCR reference number length
 * @returns {string} Reference number
 */
export function fixed(from: from, fixedLength: number): string;

/**
 * Validate OCR reference number
 * @param {string | number} ocr OCR reference number
 * @param {object} [options] Validate options
 * @returns {object} Validation result
 */
export function validate(ocr: from, options?: LengthOptions): ValidateResult;

/**
 * Validate against fixed length algorithm
 * - Invalid control digit is unacceptable
 * - Invalid length control digit is unacceptable
 * @param ocr OCR reference number
 * @param {number} length1 Check length
 * @param {number} [length2] Optional alternative length
 * @returns {boolean} Control digit and length control are valid
 */
export function validateFixedLength(ocr: from, length1: number, length2?: number): boolean;

/**
 * Validate against variable length algorithm
 * - Invalid control digit is unacceptable
 * - Invalid length control digit is unacceptable
 * @param ocr OCR reference number
 * @returns {boolean} Control digit and length control are valid
 */
export function validateVariableLength(ocr: from): boolean;

/**
 * Validate against hard algorithm
 * - Invalid control digit is unacceptable
 * @param ocr OCR reference number
 * @returns {boolean} Control digit is valid
*/
export function validateHard(ocr: from): boolean;

/**
 * Validate against soft algorithm
 * - Invalid control digit is accepted
 * @param ocr OCR reference number
 * @returns {boolean} Control digit is valid
*/
export function validateSoft(ocr: from): boolean;

/**
 * Calculate checksum
 * @param from Input
 * @param {object} [options] Optional calculate options
 */
export function calculateChecksumReversed(from: string, options?: CalculateOptions): ChecksumResult;
