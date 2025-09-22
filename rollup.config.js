import { createRequire } from 'node:module';
import commonjs from '@rollup/plugin-commonjs';

const require = createRequire(import.meta.url);

const pkg = require('./package.json');

export default {
  input: pkg.exports.import,
  plugins: [
    commonjs({
      sourceMap: false,
    }),
  ],
  output: [
    {
      file: pkg.exports.require,
      format: 'cjs',
    },
    {
      file: pkg.exports.browser,
      name: pkg.name,
      format: 'umd',
    },
  ],
};
