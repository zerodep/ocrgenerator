# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this package is

`ocrgenerator` generates and validates Swedish OCR / invoice reference numbers (modulus 10, Luhn-variant). It implements the four bankgirot algorithms — soft, hard, variable-length, and fixed-length — and has zero runtime dependencies. Default bounds (`MIN_LENGTH=2`, `MAX_LENGTH=25`) are bankgirot's; plusgirot callers pass `{ minLength: 5, maxLength: 15 }`.

Node version is pinned to 18 via `.nvmrc`.

## Commands

- `npm test` — runs mocha **and** a `posttest` chain: `lint` → `dist` → `tsd` → `test:md`. A green `npm test` therefore implies the lint, rollup build, type-declaration build, TSD type assertions, and README example execution all passed. Treat it as the canonical pre-commit check.
- `npm run lint` — eslint + prettier, both with `--cache`. If lint behaves oddly, delete `.eslintcache`.
- `npm run dist` — `rollup -c` produces `main.cjs` + `ocrgenerator.cjs`, then `dts-buddy` regenerates `types/index.d.ts` from JSDoc.
- `npm run tsd` — runs `tsd` against `test-d/index.test-d.ts` (asserts on the public types).
- `npm run test:md` — `texample` executes the JS code blocks in `README.md`. Broken examples fail CI.
- `npm run cov:html` / `npm run test:lcov` — c8 coverage reports.
- Run a single test: `npx mocha test/generatorTest.js` or `npx mocha --grep "<pattern>"` (mocha is configured `recursive` with a 1s timeout via `.mocharc.json`).

## Architecture

- **Single source of truth: `index.js`**. All exports, all algorithm logic, and all JSDoc live here. `main.cjs` (CJS) and `ocrgenerator.cjs` (UMD/browser) are **generated** by `rollup.config.js` — do not edit them by hand. The rollup config reads `package.json#exports` to derive input/output paths, so changing `exports` keys (`import`/`require`/`browser`/`types`) usually requires updating the rollup config and the `files` allowlist together.
- **Types pipeline.** `types/interfaces.d.ts` is hand-written and holds option shapes (`LengthOptions`, `FixedOptions`, `CalculateOptions`); `types/index.d.ts` is **generated** from JSDoc on `index.js` by `dts-buddy`. To change a public type, edit the JSDoc on the exported function (and `interfaces.d.ts` if it's an option object), then `npm run dist`. `tsconfig.json` has `allowJs` + `checkJs` + `strict`, so the JSDoc is type-checked.
- **`calculateChecksumReversed` is the kernel.** Both `generate` and `validate` call it; the `validation` flag flips its behavior on non-digits (silently skip when generating, return `ERR_OCR_INVALID_CHAR` when validating) and on the length-control digit (excluded during validation, included during generation). The position counter alternates the weight: even position → `d * 2 - 9` if `d ≥ 5`, odd position → `d`. The length control digit is `length % 10` and is itself folded into the checksum at position 0 (weight ×2).
- **`test/bghelpers.js` is intentionally Bankgirot's own validator** (verbatim port — Swedish identifiers `mjukkontroll`, `hardkontroll`, `langdsiffra`, `fastlangd`). It exists so the test suite can cross-check this package against the bank's reference implementation. Do not "clean up" or rename it; keeping it byte-faithful to the upstream snippet is the point.
- **README examples are executable.** `texample` runs them during `posttest`, so changes to the public API must be reflected in `README.md` or CI breaks.
- **Publish flow.** `prepack` runs `dist`, so `npm publish` always rebuilds the CJS/UMD/types artifacts. Only `index.js`, `main.cjs`, `ocrgenerator.cjs`, and `types/index.d.ts(.map)` ship (per `package.json#files`); `types/interfaces.d.ts` is source-only.

## Conventions

- Pure ESM source (`"type": "module"`); the `.cjs` files in the repo root are build output and are eslint-ignored.
- `eqeqeq` is **off** in eslint config — `==` is used deliberately in places where string/number digit coercion is convenient (e.g., comparing `currentControl` against a computed digit). Don't reflexively rewrite to `===`.
