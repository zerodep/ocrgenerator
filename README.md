# OCR generator

[![Build](https://github.com/zerodep/ocrgenerator/actions/workflows/build.yaml/badge.svg)](https://github.com/zerodep/ocrgenerator/actions/workflows/build.yaml)[![Coverage Status](https://coveralls.io/repos/github/zerodep/ocrgenerator/badge.svg?branch=master)](https://coveralls.io/github/zerodep/ocrgenerator?branch=master)

Swedish invoice number validator and generator based on modulus 10.

<!-- toc -->

- [Introduction](#introduction)
- [Api](#api)
  - [`generate(from[, options])`](#generatefrom-options)
  - [`fixed(from, fixedLength)`](#fixedfrom-fixedlength)
  - [`validate(ocr[, options])`](#validateocr-options)
  - [`validateHard(ocr)`](#validatehardocr)
  - [`validateSoft(ocr)`](#validatesoftocr)
  - [`validateVariableLength(ocr)`](#validatevariablelengthocr)
  - [`validateFixedLength(ocr, length1[, length2])`](#validatefixedlengthocr-length1-length2)
- [References](#references)

<!-- /toc -->

## Introduction

Swedish banks can take an invoice number that is validated against four algorithms, all based on modulus 10 or Luhn. The purpose of this project is to generate such invoice numbers from almost any given string.

- _soft algorithm_: invalid control digit is accepted
- _hard algorithm_: invalid control digit is unacceptable
- _variable length algorithm_: invalid control digit is unacceptable and second to last digit is the length control digit and must match total length % 10 of invoice number. The length control digit is also included in the modulus 10 calculation
- _fixed length algorithm_: up to two lengths are agreed with the bank and must be matched by the invoice number and an invalid control digit is unacceptable

## Api

Functions:

- [`generate(from[, options])`](#generatefrom-options): generate invoice number with length control and checksum digits
- `soft(from)`: same as generate without options
- `hard(from)`: same as generate without options
- [`fixed(from, fixedLength)`](#fixedfrom-fixedlength): generate with fixed length, padded with preceding zeros if too short and capped from left if too long
- `calculateChecksumReversed(ocr[, options])`: calculate checksum from right
- [`validate(ocr[, options])`](#validateocr-options): validate ocr according to modulus 10
- [`validateHard(ocr)`](#validatehardocr): validate against hard algorithm, invalid control digit is unacceptable
- [`validateSoft(ocr)`](#validatesoftocr): same as validateHard, the soft algorithm only differs in what the bank accepts, an invalid control digit still yields `false`
- [`validateVariableLength(ocr)`](#validatevariablelengthocr): controls checksum and length control
- [`validateFixedLength(ocr, length1[, length2])`](#validatefixedlengthocr-length1-length2): validate fixed length, takes ocr and one length, and one optional length, either must match

Properties:

- `MIN_LENGTH`: 2
- `MAX_LENGTH`: 25
- `ErrorCodes`: object with error codes returned as `error_code` by [`validate`](#validateocr-options) and [`generate`](#generatefrom-options)
  - `OutOfRange`: `ERR_OCR_OUT_OF_RANGE`
  - `InvalidChar`: `ERR_OCR_INVALID_CHAR`

The above thresholds - `MIN_LENGTH` and `MAX_LENGTH` - are the expected invoice number length range for bankgirot, for plusgirot it is 5 and 15.

### `generate(from[, options])`

Generate invoice number with length control and checksum.

Arguments:

- `from`: any given string, e.g. customer number + date + amount
- `options`: optional options
  - `minLength`: defaults to `MIN_LENGTH`
  - `maxLength`: defaults to `MAX_LENGTH`
  - `fixedLength`: optional total length of the invoice number, padded with preceding zeros if too short and capped from left if too long, see [`fixed`](#fixedfrom-fixedlength)

Returns:

- `numbers`: the actual generated invoice number
- `lengthControl`: length control digit
- `control`: control digit
- `length`: length
- `sum`: checksum
- `error_code`: occasional error
  - `ERR_OCR_OUT_OF_RANGE`: OCR reference length was out of range, i.e. < `minLength` or > `maxLength`
- `message`: occasional error message

Example:

```javascript
import { generate } from 'ocrgenerator';

const invoiceNo = generate('Customer007:Date2019-12-24:Amount$200');
console.log(invoiceNo); // { numbers: '0072019122420063', lengthControl: 6, control: 3, length: 16, sum: 37 }
```

Modulus 10 reversed:

```
Customer007:Date2019-12-24:Amount$200
        007     2019 12 24        200 l = 16 % 10 = 6
*       212     1212 12 12        121 2
----------------------------------------------
        001     2011 14 28        200 1
+       004     0008 00 00        000 2
----------------------------------------------
sum     005     2009 14 28        200 3 = 37
```

The length is the expected total number of digits in the invoice number, i.e. add one for length control and one for control digit.
total invoice number length: `n = 14 + 1 + 1 = 16`
length control: `l = n % 10 = 6`

Since the algorithm is reversed, the length control is at first position - index 0, so times 2:

reference control digit: `c = 10 - sum % 10 = 10 - 37 % 10 = 10 - 7 = 3`

Invoice number: `'00720191224200' + l + c = '0072019122420063'`

### `fixed(from, fixedLength)`

Generate invoice number with a fixed total length. Digits are padded with preceding zeros if too short and capped from the left if too long.

```javascript
import { fixed } from 'ocrgenerator';

console.log(fixed('Customer007:Date2019-12-24:Amount$200', 20)); // 00000072019122420006

console.log(fixed('Customer007:Date2019-12-24:Amount$200', 10)); // 9122420004
```

### `validate(ocr[, options])`

Validate ocr according to modulus 10 and return object describing what went wrong if invalid.

Arguments:

- `ocr`: invoice number
- `options`: optional options
  - `minLength`: defaults to `MIN_LENGTH`
  - `maxLength`: defaults to `MAX_LENGTH`

Returns:

- `valid`: boolean indicating that the modulus 10 check was successful
- `sum`: checksum
- `control`: expected control digit
- `error_code`: occasional error
  - `ERR_OCR_INVALID_CHAR`: a character has sneaked into ocr
  - `ERR_OCR_OUT_OF_RANGE`: OCR reference was out of range, i.e. < `minLength` or > `maxLength`
- `message`: occasional error message

Example:

```javascript
import { validate } from 'ocrgenerator';

console.log(validate('0072019122420063')); // { valid: true, control: 3, sum: 37 }

console.log(validate('0072019122420063' + '7')); // { valid: false, control: 0, sum: 50 }

console.log(validate('0072019122420063' + 'A')); // { valid: false, error_code: 'ERR_OCR_INVALID_CHAR', message: 'char detected at 16' }

console.log(validate('0072019122420063', { maxLength: 15 })); // { valid: false, error_code: 'ERR_OCR_OUT_OF_RANGE', message: 'OCR reference too long must be between 2 and 15' }
```

### `validateHard(ocr)`

```javascript
import { validateHard } from 'ocrgenerator';

console.log(validateHard('0072019122420063')); // true

console.log(validateHard('0072019122420063' + '7')); // false

console.log(validateHard('0072019122420063' + 'A')); // false, sneaky character
```

### `validateSoft(ocr)`

```javascript
import { validateSoft } from 'ocrgenerator';

console.log(validateSoft('0072019122420063')); // true

console.log(validateSoft('0072019122420063' + '7')); // false

console.log(validateSoft('0072019122420063' + 'A')); // false, sneaky character
```

### `validateVariableLength(ocr)`

Validate control digit and that the second to last digit matches total length % 10.

```javascript
import { validateVariableLength } from 'ocrgenerator';

console.log(validateVariableLength('0072019122420063')); // true, length 16 % 10 = 6

console.log(validateVariableLength('00072019122420063')); // false, length 17 % 10 = 7
```

### `validateFixedLength(ocr, length1[, length2])`

Validate control digit and that the invoice number length matches one of up to two agreed lengths.

```javascript
import { validateFixedLength } from 'ocrgenerator';

console.log(validateFixedLength('0072019122420063', 16)); // true

console.log(validateFixedLength('0072019122420063', 10, 16)); // true

console.log(validateFixedLength('0072019122420063', 10, 12)); // false
```

## References

Validate your invoice number at [bankgirot](https://www.bankgirot.se/tjanster/inbetalningar/bankgiro-inbetalningar/ocr-referenskontroll/)
