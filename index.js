export {
  soft,
  hard,
  fixed,
  generate,
};

function soft(from) {
  return generate(from);
}

function hard(from) {
  return generate(from);
}

function fixed(from, fixedLength) {
  return calculateChecksumWithLength(from.toString(), fixedLength).numbers;
}

function generate(from) {
  return calculateChecksumWithLength(from.toString()).numbers;
}

function calculateChecksumWithLength(from, fixedLength) {
  let {sum, length, numbers} = calculateChecksumReversed(from, fixedLength);

  if (fixedLength) {
    if (length < fixedLength - 1) {
      numbers = Array(fixedLength - length - 2).fill('0').join('') + numbers;
    }
    length = fixedLength;
  } else {
    length += 2;
  }

  const lengthCheck = length % 10;
  numbers += lengthCheck;

  sum += digitSum(0, lengthCheck);

  const res = sum % 10;

  const checksum = res === 0 ? 0 : 10 - res;
  numbers += checksum;

  return {checksum, numbers, length};
}

function calculateChecksumReversed(from, fixedLength) {
  let sum = 0;
  let numbers = '';
  let len = 0;
  let pos = len;

  for (let i = from.length - 1; i >= 0; --i) {
    const c = Number(from[i]);
    if (isNaN(c)) continue;
    ++pos;
    ++len;
    if (fixedLength && len === fixedLength - 1) break;
    numbers = c + numbers;

    sum += digitSum(pos, c);
  }

  return {numbers, sum, length: len};
}

function digitSum(position, d) {
  if (position % 2) return d;
  return d < 5 ? d * 2 : d * 2 - 9;
}
