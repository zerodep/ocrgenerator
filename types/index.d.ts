declare module 'ocrgenerator' {
	/**
	 * Generate invoice number with length control and checksum.
	 * @param from Generate from input
	 * @param options Generate options
	 * @throws {TypeError} If input is neither string nor number, or if minLength is above maxLength
	 */
	export function generate(from: string | number, { fixedLength, minLength, maxLength }?: FixedOptions): GenerateResult;
	/**
	 * Same as generate without options
	 * @param from Generate from input
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
	 * Padded with preceding zeros if too short and capped from left if too long
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
	 * - Invalid control digit is accepted by the bank but still returns false
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
	 * - Length other than the agreed lengths is unacceptable
	 * @param ocr OCR reference number
	 * @param length1 Agreed length
	 * @param length2 Optional alternative agreed length
	 * @returns Control digit is valid and length matches an agreed length
	 */
	export function validateFixedLength(ocr: string | number, length1: number, length2?: number): boolean;
	/**
	 * Calculate checksum
	 * @param from Input
	 * @param options Calculate options
	 * @throws {TypeError} If input is neither string nor number
	 */
	export function calculateChecksumReversed(from: string | number, { fixedLength, minLength, maxLength, validation }?: CalculateOptions): Partial<ChecksumResult>;
	export const MIN_LENGTH: 2;
	export const MAX_LENGTH: 25;
	/**
	 * Validation error codes
	 */
	export type ErrorCodes = string;
	export namespace ErrorCodes {
		let OutOfRange: string;
		let InvalidChar: string;
	}
	export type ChecksumResult = {
		/**
		 * Digits of the input
		 */
		numbers: string;
		/**
		 * Reversed checksum
		 */
		sum: number;
		/**
		 * Number of digits
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
		 * Control digit
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
	 * - true expects the reference number without its control digit
	 *   and returns error on invalid characters or if too long
	 * - false ignores invalid characters and caps from left if too long
	 */
	validation?: boolean;
  }

	export {};
}

//# sourceMappingURL=index.d.ts.map