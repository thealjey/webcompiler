'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = jsNodeCompileFile;

var _babel = require('babel');

var options = { loose: 'all', optional: ['runtime'] },
    pragmaPattern = /\/\*\s*@flow\s*\*\/\s*/;

/**
 * Compiles a JavaScript file for the NodeJS environment, attempting to remove the Facebook Flow pragma if one exists
 * while retaining all of the other comments.
 *
 * @param {string}   scriptFile - a full system path to a JavaScript file
 * @param {Function} callback   - a callback function which accepts 2 arguments: an error object or null and the
 *                                resulting program string
 * @example
 * import {jsNodeCompileFile} from 'webcompiler';
 *
 * jsNodeCompileFile('/path/to/a/script/file.js', function (e, code) {
 *   if (e) {
 *     return console.error(e);
 *   }
 *   // use the compiled "code" here
 * });
 */

function jsNodeCompileFile(scriptFile, callback) {
  (0, _babel.transformFile)(scriptFile, options, function (e, result) {
    if (e) {
      return callback(e);
    }
    callback(null, result.code.replace(pragmaPattern, ''));
  });
}

module.exports = exports['default'];