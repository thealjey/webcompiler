/* @flow */

import NativeProcess from './NativeProcess';

const babel = new NativeProcess('babel');

/**
 * Compiles entire directory contents for the NodeJS environment.
 *
 * @param {string}   inPath   - the absolute system path to the input directory
 * @param {string}   outPath  - the absolute system path to the output directory
 * @param {Function} callback - a callback function, accepts 2 arguments: an error string or null and the response
 *                              string from the babel compiler
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
export default function jsNodeCompileDir(inPath: string, outPath: string, callback: Function) {
  babel.run(callback, [inPath, '--out-dir', outPath]);
}
