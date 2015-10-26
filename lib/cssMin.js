/* @flow */

import CleanCSS from 'clean-css';

const roundingPrecision = -1;

/**
 * Minifies CSS
 *
 * @param  {{code: string, map: string}} data - an object containing a "code" and a "map" strings
 * @return {{code: string, map: string}} an object containing the minified "code" and a "map" string
 * @example
 * import {cssMin} from 'webcompiler';
 *
 * let minified = cssMin({code: 'some css rules', map: 'source map contents'});
 * // minified -> {code: string, map: string}
 */
export default function cssMin(data: Object): Object {
  const sourceMappingURL = data.code.match(/\n.+$/)[0],
      result = new CleanCSS({
        keepSpecialComments: 0,
        roundingPrecision,
        sourceMap: data.map,
        sourceMapInlineSources: true
      }).minify(data.code);

  return {code: result.styles + sourceMappingURL, map: result.sourceMap};
}
