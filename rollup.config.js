import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './index.js',
  plugins: [
    commonjs({
      sourceMap: false,
    }),
  ],
  output: [
    {
      file: 'main.cjs',
      format: 'cjs',
    },
    {
      file: 'ocrgenerator.cjs',
      name: 'ocrgenerator',
      format: 'umd',
    },
  ],
};
