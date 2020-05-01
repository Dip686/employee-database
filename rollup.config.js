import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const PRODUCTION_ENV='production',
  DEVELOPMENT_ENV='development',
  currentEnv = process.env.NODE_ENV;

let plugins=[
  resolve(), 
  babel({
    "presets": ["@babel/preset-react"]
  }),
  commonjs(),
  replace({
    'process.env.NODE_ENV': JSON.stringify( currentEnv )
  })
];
if(process.env.NODE_ENV === PRODUCTION_ENV) {
  plugins.push(terser());
}
export default {
  input: 'src/index.js',
  output: [{
    file: 'dist/app.js',
    format: 'iife',
    name: 'app'
  }],
  plugins
};