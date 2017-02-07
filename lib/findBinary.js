'use strict';

exports.__esModule = true;
exports.findBinary = findBinary;

var _NativeProcess = require('./NativeProcess');

var _fs = require('fs');

var _path = require('path');

const npm = new _NativeProcess.NativeProcess('npm'),
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
 * import {logError} from 'webcompiler';
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
function findBinary(name, callback) {
  if (cache[name]) {
    return callback(null, cache[name]);
  }
  npm.run((stderr, stdout) => {
    if (stderr) {
      return callback(stderr);
    }
    const path = (0, _path.join)(stdout.trimRight(), name);

    (0, _fs.stat)(path, statErr => {
      if (statErr) {
        return callback(statErr);
      }
      callback(null, cache[name] = new _NativeProcess.NativeProcess(path));
    });
  }, ['bin']);
}