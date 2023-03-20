declare type from = string | number;

interface LengthOptions {
  minLength?: number;
  maxLength?: number;
}

interface FixedOptions extends LengthOptions {
  fixedLength?: number;
}

interface AllOptions extends FixedOptions {
  validation?: boolean | number;
}

type Result = {
  numbers: string,
  sum: number,
  length: number,
}

type GenerateResult = {
  lengthControl: number,
  control: number,
};

type ValidateResult = {
  control: number,
  sum: number,
  error_code?: string,
  message?: string,
};

export const MIN_LENGTH: 2;
export const MAX_LENGTH: 25;

export const ERR_OUT_OF_RANGE: 'ERR_OCR_OUT_OF_RANGE';
export const ERR_INVALID_CHAR: 'ERR_OCR_INVALID_CHAR';

export function generate(from: from, options?: FixedOptions): Result & GenerateResult;
export function soft(from: from): string;
export function hard(from: from): string;
export function fixed(from: from, fixedLength: number): string;
export function validate(ocr: from, options?: LengthOptions): { valid: boolean } & ValidateResult;
export function validateFixedLength(ocr: from, length1: number, length2: number): boolean;
export function validateVariableLength(ocr: from): boolean;
export function validateSoft(ocr: from): boolean;
export function calculateChecksumReversed(from: from, options?: AllOptions): ValidateResult;
export { validateSoft as validateHard };
