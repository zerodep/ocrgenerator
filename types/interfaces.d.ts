export interface LengthOptions {
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
}

export interface FixedOptions extends LengthOptions {
  /** Fixed length */
  fixedLength?: number;
}

export interface CalculateOptions extends FixedOptions {
  /**
   * Validation in progress
   * - true expects the reference number without its control digit
   *   and returns error on invalid characters or if too long
   * - false ignores invalid characters and caps from left if too long
   */
  validation?: boolean;
}
