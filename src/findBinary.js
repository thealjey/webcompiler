/* @flow */

import type {ResultOrErrorCallback} from './typedef';
import {NativeProcess} from './NativeProcess';
import {stat} from 'fs';
import {join} from 'path';

const npm = new NativeProcess('npm'),
  cache = {};

/**
 * Finds the path to a project level binary, creates a {@link NativeProcess} for that binary, caches it for all
 * subsequent invocations, and provides it to the callback.
 *
 * @function findBinary
 * @param {string}                name     - the binary name
 * @param {ResultOrErrorCallback} callback - a callback function
 * @return {void}
 * @example
 * import {findBinary, logError} from 'webcompiler';
 * // or - import {findBinary} from 'webcompiler/lib/findBinary';
 * // or - var findBinary = require('webcompiler').findBinary;
 * // or - var findBinary = require('webcompiler/lib/findBinary').findBinary;
 * // import logError somehow
 *
 * findBinary('something', (error, binary) => {
 *   if (error) {
 *     return logError(error);
 *   }
 *   binary.run(() => {
 *     // called the `something` binary from the local project level "node_modules/.bin" directory
 *   });
 * });
 */
export function findBinary(name: string, callback: ResultOrErrorCallback) {
  if (cache[name]) {
    return callback(null, cache[name]);
  }
  npm.run((stderr, stdout) => {
    if (stderr) {
      return callback(stderr);
    }
    const path = join(stdout.trimRight(), name);

    stat(path, statErr => {
      if (statErr) {
        return callback(statErr);
      }
      callback(null, cache[name] = new NativeProcess(path));
    });
  }, ['bin']);
}
