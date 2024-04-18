import { expectType } from 'tsd';
import ocregenerator, { ChecksumResult } from '../';

expectType<ocregenerator.GenerateResult>(ocregenerator.generate('1234'));
expectType<ocregenerator.ValidateResult>(ocregenerator.validate('1234'));
expectType<string>(ocregenerator.hard(1234));
expectType<string>(ocregenerator.soft('1234'));
expectType<boolean>(ocregenerator.validateFixedLength('1234', 4));
expectType<boolean>(ocregenerator.validateVariableLength('1234'));
expectType<boolean>(ocregenerator.validateSoft('1234'));
expectType<boolean>(ocregenerator.validateHard('1234'));
expectType<ChecksumResult>(
  ocregenerator.calculateChecksumReversed('1234', {
    validation: true,
  }),
);
