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

interface Result {
  numbers: string;
  sum: number;
  length: number;
}

interface GenerateResult extends Result{
  lengthControl: number;
  control: number;
}

interface ErrorResult {
  error_code: string;
  message: string;
}

interface ValidateResult {
  valid: boolean;
  control: number;
  sum: number;
}

export const MIN_LENGTH: 2;
export const MAX_LENGTH: 25;
export function generate(from: from, options?: FixedOptions): GenerateResult;
export function soft(from: from): string;
export function hard(from: from): string;
export function fixed(from: from, fixedLength: number): string;
export function validate(ocr: from, options?: LengthOptions): ValidateResult | ErrorResult;
export function validateFixedLength(ocr: from, length1: number, length2: number): boolean;
export function validateVariableLength(ocr: from): boolean;
export function validateSoft(ocr: from): boolean;
export function calculateChecksumReversed(from: from, options?: AllOptions): Result | ErrorResult;
export { validateSoft as validateHard };
