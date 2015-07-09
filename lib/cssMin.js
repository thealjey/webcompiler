/* @flow */

import CleanCSS from 'clean-css';

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
export default function cssMin(data: Object): Object {
  var sourceMappingURL = data.code.match(/\n.+$/)[0],
      result = new CleanCSS({
        keepSpecialComments: 0,
        roundingPrecision: -1,
        sourceMap: data.map,
        sourceMapInlineSources: true
      }).minify(data.code);

  return {code: result.styles + sourceMappingURL, map: result.sourceMap};
}
