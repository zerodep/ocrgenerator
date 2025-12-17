# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

## v2.0.1 - 2025-11-13

- proof of provenance release

## v2.0.0 - 2025-08-17

- generate type definitions with dts-buddy
- exports declaration in package.json breaks default export, use `import * as ocr from 'ocrgenerator'`

## v1.0.8 - 2024-05-19

- if control digit is not a number validation will return false, expected, but shouldn't it actually return an error about sneaky alpha character? Now it does
- run through README examples with [texample](https://www.npmjs.com/package/texample). Immediately detected the unexpected behaviour of alpha control digit

## v1.0.7 - 2024-04-18

- bump eslint and abide to prettier

## v1.0.6 - 2023-09-05

- allow number to be passed in all validate fns
