import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './index.js',
  plugins: [
    commonjs({
      sourceMap: false
    }),
  ],
  output: [
    {
      file: 'main.js',
      format: 'cjs',
    }
  ]
};
