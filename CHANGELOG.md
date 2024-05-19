# Changelog

All notable changes to this project will be documented in this file.

# [Unreleased]

# [1.0.8] - 2024-05-19

- if control digit is not a number validation will return false, expected, but shouldn't it actually return an error about sneaky alpha character? Now it does
- run through README examples with [texample](https://www.npmjs.com/package/texample). Immediately detected the unexpected behaviour of alpha control digit

# [1.0.7] - 2024-04-18

- bump eslint and abide to prettier

# [1.0.6] - 2023-09-05

- allow number to be passed in all validate fns
