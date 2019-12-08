OCR generator
=============

Swedish invoice number generator based on modulus 10.

## Introduction

```js
import {generate} from 'ocrgenerator';

const invoiceNo = generate('Customer007:Date2019-12-24:Amount$200');
console.log(invoiceNo); // 0072019122420063
```

Modulus 10 reversed, meaning that the last digit is considered at an uneven position, ergo multiply by 1:
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

## Api

- `generate`: generate invoice number with length and checksum
- `soft`: same as generate
- `hard`: same as generate

## References

Validate your invoice number at [bankgirot](https://www.bankgirot.se/tjanster/inbetalningar/bankgiro-inbetalningar/ocr-referenskontroll/)
