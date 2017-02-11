/* @flow */

/* eslint-disable no-process-env */

/**
 * Generic utilities and configuration objects.
 *
 * @module util
 */

/**
 * `true` on Node.js
 *
 * @memberof module:util
 * @constant {boolean} isNode
 * @example
 * import {isNode} from 'webcompiler';
 * // or - import {isNode} from 'webcompiler/lib/util';
 * // or - var isNode = require('webcompiler').isNode;
 * // or - var isNode = require('webcompiler/lib/util').isNode;
 */
export const isNode = 'undefined' !== typeof process && 'node' === process.release.name;

/**
 * `true` if the `NODE_ENV` environment variable is set to `"production"`
 *
 * @memberof module:util
 * @constant {boolean} isProduction
 * @example
 * import {isProduction} from 'webcompiler';
 * // or - import {isProduction} from 'webcompiler/lib/util';
 * // or - var isProduction = require('webcompiler').isProduction;
 * // or - var isProduction = require('webcompiler/lib/util').isProduction;
 */
export const isProduction = 'production' === process.env.NODE_ENV;

/**
 * Babel configuration for the Node.js.
 *
 * @memberof module:util
 * @member {Object} babelBEOptions
 * @example
 * import {babelBEOptions} from 'webcompiler';
 * // or - import {babelBEOptions} from 'webcompiler/lib/util';
 * // or - var babelBEOptions = require('webcompiler').babelBEOptions;
 * // or - var babelBEOptions = require('webcompiler/lib/util').babelBEOptions;
 */
export const babelBEOptions = {
  babelrc: false,
  presets: ['es2016', 'es2017', 'stage-2', 'react'],
  plugins: [
    ['transform-es2015-modules-commonjs', {loose: true}]
  ]
};

/**
 * Babel configuration for the browser.
 *
 * @memberof module:util
 * @member {Object} babelFEOptions
 * @example
 * import {babelFEOptions} from 'webcompiler';
 * // or - import {babelFEOptions} from 'webcompiler/lib/util';
 * // or - var babelFEOptions = require('webcompiler').babelFEOptions;
 * // or - var babelFEOptions = require('webcompiler/lib/util').babelFEOptions;
 */
export const babelFEOptions = {
  cacheDirectory: true,
  babelrc: false,
  presets: [
    ['es2015', {
      // temporarily disabled until `webpack` 2.3 and `webpack-hot-loader` 3.0 are available
      // modules: false,
      loose: true
    }],
    'es2016', 'es2017', 'stage-2', 'react'
  ],
  plugins: ['transform-runtime']
};
