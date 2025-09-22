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
   * - true will disregard control digit when calculating checksum
   *   but return error if encountering invalid characters or length control
   * - false will ignore invalid characters and length control
   */
  validation?: boolean;
}
