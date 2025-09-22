declare module 'ocrgenerator' {
	/**
	 * Generate invoice number with length control and checksum.
	 * */
	export function generate(from: string | number, { fixedLength, minLength, maxLength }?: FixedOptions): GenerateResult;
	/**
	 * Same as generate without options
	 * @returns Reference number
	 */
	export function soft(from: string | number): string;
	/**
	 * Same as generate without options
	 * @param from Generate from input
	 * @returns Reference number
	 */
	export function hard(from: string | number): string;
	/**
	 * Generate with fixed length
	 * Padded with preceeding zeros if too short and capped from left if too long
	 * @param from Generate from input
	 * @param fixedLength OCR reference number length
	 * @returns Reference number
	 */
	export function fixed(from: string | number, fixedLength: number): string;
	/**
	 * Validate OCR reference number
	 * @param ocr - OCR reference number
	 * @param options - Validate options
	 * @returns - Validation result
	 */
	export function validate(ocr: string | number, { minLength, maxLength }?: LengthOptions): ValidateResult;
	/**
	 * Validate against soft algorithm
	 * - Invalid control digit is accepted
	 * @param ocr OCR reference number
	 * @returns Control digit is valid
	 */
	export function validateSoft(ocr: string | number): boolean;
	/**
	 * Validate against hard algorithm
	 * - Invalid control digit is unacceptable
	 * @param ocr OCR reference number
	 * @returns Control digit is valid
	 */
	export function validateHard(ocr: string | number): boolean;
	/**
	 * Validate against variable length algorithm
	 * - Invalid control digit is unacceptable
	 * - Invalid length control digit is unacceptable
	 * @param ocr OCR reference number
	 * @returns Control digit and length control are valid
	 */
	export function validateVariableLength(ocr: string | number): boolean;
	/**
	 * Validate against fixed length algorithm
	 * - Invalid control digit is unacceptable
	 * - Invalid length control digit is unacceptable
	 * @param ocr OCR reference number
	 * @param length1 Check length
	 * @param length2 Optional alternative length
	 * @returns Control digit and length control are valid
	 */
	export function validateFixedLength(ocr: string | number, length1: number, length2?: number): boolean;
	/**
	 * Calculate checksum
	 * @param from Input
	 * */
	export function calculateChecksumReversed(from: string, { fixedLength, maxLength, validation }?: CalculateOptions): Partial<ChecksumResult>;
	export const MIN_LENGTH: 2;
	export const MAX_LENGTH: 25;
	/**
	 * ErrorCodes Validation error codes
	 */
	export type ErrorCodes = string;
	export namespace ErrorCodes {
		let OutOfRange: string;
		let InvalidChar: string;
	}
	export type ChecksumResult = {
		/**
		 * Reference number
		 */
		numbers: string;
		/**
		 * Reversed checksum
		 */
		sum: number;
		/**
		 * Reference number length, including control digit
		 */
		length: number;
		/**
		 * Occasional error code
		 */
		error_code?: ErrorCodes;
		/**
		 * Error message associated with error code
		 */
		message?: string;
	};
	export type GenerateResult = {
		/**
		 * Reference number
		 */
		numbers: string;
		/**
		 * Reversed checksum
		 */
		sum: number;
		/**
		 * Length control digit
		 */
		lengthControl: number;
		/**
		 * Reversed checksum
		 */
		control: number;
		/**
		 * Reference number length, including control digit
		 */
		length: number;
	};
	export type ValidateResult = {
		/**
		 * Is valid reference number
		 */
		valid: boolean;
		/**
		 * Control digit
		 */
		control?: number;
		/**
		 * Reversed checksum
		 */
		sum?: number;
		/**
		 * Occasional error code
		 */
		error_code?: ErrorCodes;
		/**
		 * Error message associated with error code
		 */
		message?: string;
	};
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
	 *   but return error if encountering invalid characters or length control
	 * - false will ignore invalid characters and length control
	 */
	validation?: boolean;
  }

	export {};
}

//# sourceMappingURL=index.d.ts.map