/* @flow */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = jsNodeCompileDir;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _NativeProcess = require('./NativeProcess');

var _NativeProcess2 = _interopRequireDefault(_NativeProcess);

var babel = new _NativeProcess2['default']('babel');

/**
 * Compiles entire directory contents for the NodeJS environment.
 *
 * @param {string}   inPath   - the absolute system path to the input directory
 * @param {string}   outPath  - the absolute system path to the output directory
 * @param {Function} callback - a callback function, accepts 2 arguments: an error string or null and the
 *                              response string from the babel compiler
 * @example
 * import {jsNodeCompileDir} from 'webcompiler';
 *
 * jsNodeCompileDir('/path/to/the/input/directory', '/path/to/the/output/directory', function (e) {
 *   if (e) {
 *     return console.error(e);
 *   }
 *   // compiled successfully
 * });
 */

function jsNodeCompileDir(inPath, outPath, callback) {
  babel.run(callback, [inPath, '--out-dir', outPath]);
}

module.exports = exports['default'];