'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = cssMin;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cleanCss = require('clean-css');

var _cleanCss2 = _interopRequireDefault(_cleanCss);

/**
 * Minifies CSS
 *
 * @param  {{code: string, map: string}} data - an object containing a "code" and a "map" strings
 * @return {{code: string, map: string}} an object containing the minified "code" and a "map" string
 * @example
 * import {cssMin} from 'webcompiler';
 *
 * var minified = cssMin({code: 'some css rules', map: 'source map contents'});
 * // minified -> {code: string, map: string}
 */

function cssMin(data) {
  var sourceMappingURL = data.code.match(/\n.+$/)[0],
      result = new _cleanCss2['default']({
    keepSpecialComments: 0,
    roundingPrecision: -1,
    sourceMap: data.map,
    sourceMapInlineSources: true
  }).minify(data.code);

  return { code: result.styles + sourceMappingURL, map: result.sourceMap };
}

module.exports = exports['default'];