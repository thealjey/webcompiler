'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = jsMin;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _uglifyJs = require('uglify-js');

var _uglifyJs2 = _interopRequireDefault(_uglifyJs);

var _path = require('path');

/* eslint-disable camelcase */
var config = { mangle: false, output: { space_colon: false }, inSourceMap: '', outSourceMap: '' };

/* eslint-enable camelcase */

/**
 * Minifies JavaScript
 *
 * @param {string} scriptFile - an absolute system path to a script file
 * @param {string} [mapFile]  - an absolute system path to a map file, defaults to scriptFile + ".map"
 * @return {{code: string, map: string}} an object containing the minified "code" and a "map" string
 * @example
 * import {jsMin} from 'webcompiler';
 *
 * var minified = jsMin('/path/to/a/script/file.js');
 * // minified -> {code: string, map: string}
 */

function jsMin(scriptFile, mapFile) {
  if (!mapFile) {
    mapFile = scriptFile + '.map';
  }
  config.outSourceMap = (0, _path.basename)(config.inSourceMap = mapFile);
  return _uglifyJs2['default'].minify(scriptFile, config);
}

module.exports = exports['default'];