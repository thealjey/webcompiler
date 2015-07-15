/* @flow */

import UglifyJS from 'uglify-js';
import {basename} from 'path';

/*eslint-disable camelcase*/
var config = {mangle: false, output: {space_colon: false}, inSourceMap: '', outSourceMap: ''};

/*eslint-enable camelcase*/

/**
 * Minifies JavaScript
 *
 * @param  {string}                      scriptFile - an absolute system path to a script file
 * @param  {string}                      [mapFile]  - an absolute system path to a map file, defaults to
 *                                                    scriptFile + ".map"
 * @return {{code: string, map: string}} an object containing the minified "code" and a "map" string
 * @example
 * import {jsMin} from 'webcompiler';
 *
 * var minified = jsMin('/path/to/a/script/file.js');
 * // minified -> {code: string, map: string}
 */
export default function jsMin(scriptFile: string, mapFile: ?string) {
  if (!mapFile) {
    mapFile = `${scriptFile}.map`;
  }
  config.outSourceMap = basename(config.inSourceMap = mapFile);
  return UglifyJS.minify(scriptFile, config);
}
