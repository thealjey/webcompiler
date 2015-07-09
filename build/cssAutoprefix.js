/* @flow */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = cssAutoprefix;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _autoprefixerCore = require('autoprefixer-core');

var _autoprefixerCore2 = _interopRequireDefault(_autoprefixerCore);

/**
 * Adds vendor prefixes to css automatically
 *
 * @param {{code: string, map: string}} data      - an object containing "code" and "map" strings
 * @param {string}                      styleFile - a full system path to a css file (source and destination files are
 *                                                  considered the same, since it's is usually a result of some prior
 *                                                  compilation anyway, nothing is ever written to disk)
 * @param {Function}                    callback  - a callback function, accepts 2 arguments: an array of error messages
 *                                                  or null and an object containing "code" and "map" strings
 * @example
 * import {cssAutoprefix} from 'webcompiler';
 *
 * cssAutoprefix({code: 'some css rules', map: 'source map contents'}, '/path/to/a/file.css', function (e, result) {
 *   if (e) {
 *     return e.forEach(function (err) {
 *       console.error(err);
 *     });
 *   }
 *   // result -> {code: string, map: string}
 * });
 */

function cssAutoprefix(data, styleFile, callback) {
  (0, _postcss2['default'])([_autoprefixerCore2['default']]).process(data.code, {
    from: styleFile,
    to: styleFile,
    map: { prev: data.map }
  }).then(function (result) {
    var warnings = result.warnings();

    if (warnings.length) {
      return callback(warnings.map(function (item) {
        return item.toString();
      }));
    }
    callback(null, { code: result.css, map: JSON.stringify(result.map) });
  });
}

module.exports = exports['default'];