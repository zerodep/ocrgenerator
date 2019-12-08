'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function soft(from) {
  return generate(from);
}

function hard(from) {
  return generate(from);
}

function generate(from) {
  return calculateChecksumWithLength(from.toString()).numbers;
}

function calculateChecksumWithLength(from) {
  let {sum, length, numbers} = calculateChecksumReversed(from);

  length += 2;
  const lengthCheck = length % 10;
  numbers += lengthCheck;

  sum += digitSum(0, lengthCheck);

  const res = sum % 10;

  const checksum = res === 0 ? 0 : 10 - res;
  numbers += checksum;

  return {checksum, numbers, length};
}

function calculateChecksumReversed(from) {
  let sum = 0;
  let numbers = '';
  let len = 0;
  let pos = len;

  for (let i = from.length - 1; i >= 0; --i) {
    const c = Number(from[i]);
    if (isNaN(c)) continue;
    ++pos;
    ++len;
    numbers = c + numbers;

    sum += digitSum(pos, c);
  }

  return {numbers, sum, length: len};
}

function digitSum(position, d) {
  if (position % 2) return d;
  return d < 5 ? d * 2 : d * 2 - 9;
}

exports.generate = generate;
exports.hard = hard;
exports.soft = soft;
