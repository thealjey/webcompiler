/* @flow */

import postcss from 'postcss';
import autoprefixer from 'autoprefixer-core';

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
export default function cssAutoprefix(data: Object, styleFile: string, callback: Function) {
  postcss([autoprefixer]).process(data.code, {
    from: styleFile,
    to: styleFile,
    map: {prev: data.map}
  }).then(function (result) {
    var warnings = result.warnings();

    if (warnings.length) {
      return callback(warnings.map(item => item.toString()));
    }
    callback(null, {code: result.css, map: JSON.stringify(result.map)});
  });
}
