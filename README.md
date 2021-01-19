OCR generator
=============

[![Build Status](https://travis-ci.com/zerodep/ocrgenerator.svg?branch=master)](https://travis-ci.com/zerodep/ocrgenerator)[![Coverage Status](https://coveralls.io/repos/github/zerodep/ocrgenerator/badge.svg?branch=master)](https://coveralls.io/github/zerodep/ocrgenerator?branch=master)

Swedish invoice number generator based on modulus 10.

## Introduction

Swedish banks can take an invoice number that is validated against four algorithms, all based on modulus 10 or Luhn. The purpose of this project is to generate such invoice numbers from almost any given string.

- *soft algorithm*: invalid control digit is accepted
- *hard algorithm*: invalid control digit is unacceptable
- *variable length algorithm*: invalid control digit is unacceptable and second to last digit is the length control digit and must match total length % 10 of invoice number. The length control digit is also included in the modulus 10 calculation, that was painfully experienced.
- *fixed length algorithm*: up to two lengths are agreed with the bank and must be matched by the invoice number and an invalid control digit is unacceptable

## Api

Functions:
- [`generate(from[, options])`](#generatefrom-options): generate invoice number with length control and checksum digits
- `soft(from)`: same as generate without options
- `hard(from)`: same as generate without options
- `fixed(from, fixedLength)`: generate with fixed length, padded with preceeding zeros if too short and capped from left if too long
- `calculateChecksumReversed(ocr[, options])`: calculate checksum from right
- [`validate(ocr[, options])`](#validateocr-options): validate ocr according to modulus 10
- `validateSoft(ocr)`: validate checksum, actually validates with modulus 10 and returns false if invalid
- `validateHard(ocr)`: validate hard, actually the same as soft
- `validateVariableLength(ocr)`: controls checksum and length control
- `validateFixedLength(ocr, length1[, length2])`: validate fixed length, takes ocr and one length, and one optional length, either must match

Properties:
- `MIN_LENGTH`: 2
- `MAX_LENGTH`: 25

The above tresholds - `MIN_LENGTH` and `MAX_LENGTH` - is the expected invoice number length range for bankgirot, for plusgirot it is 5 and 15.

## generate(from[, options])

Generate invoice number with length control and checksum.

Arguments:
- `from`: any given string, e.g. customer number + date + amount
- `options`: optional options
  - `minLength`: defaults to `MIN_LENGTH`
  - `maxLength`: defaults to `MAX_LENGTH`

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
```js
import {generate} from 'ocrgenerator';

const invoiceNo = generate('Customer007:Date2019-12-24:Amount$200');
console.log(invoiceNo); // {numbers: '0072019122420063'}
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
total invoic number length: `n = 14 + 1 + 1 = 16`
length control: `l = n % 10 = 6`

Since the algoritm is in reversed, the length control is at first position - index 0, so times 2:

reference control digit: `c = 10 - sum % 10 = 10 - 37 % 10 = 10 - 7 = 3`

Invoice number: `'00720191224200' + l + c = '0072019122420063'`

## validate(ocr[, options])

Validate ocr according to modulus 10 and return object describing what went wrong if invalid.

Arguments:
- `ocr`: invoice number
- `options`: optional options
  - `minLength`: defaults to `MIN_LENGTH`
  - `maxLength`: defaults to `MAX_LENGTH`

Returns:
- `valid`: boolean indicating that the modulus 10 check was successfull
- `sum`: checksum
- `control`: expected control digit
- `error_code`: occasional error
  - `ERR_OCR_CHAR`: a character has sneeked into ocr
  - `ERR_OCR_OUT_OF_RANGE`: OCR reference was out of range, i.e. < 2 or > 25
- `message`: occasional error message

## References

Validate your invoice number at [bankgirot](https://www.bankgirot.se/tjanster/inbetalningar/bankgiro-inbetalningar/ocr-referenskontroll/)
