/* @flow */

import {render} from 'node-sass';
import importer from 'node-sass-import-once';

const precision = 8,
    options = {
      file: null,
      outFile: null,
      importer,
      importOnce: {index: true, css: false, bower: false},
      includePaths: ['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules'],
      precision,
      sourceMap: true,
      sourceMapContents: true
    };

/**
 * SCSS file compiler
 *
 * @class
 * @param {Object}        [importOnceOptions={}] - an object that lets you override default importOnce resolver
 *                                                 configuration
 * @param {Array<string>} [includePaths=[]]      - an array of additional include paths
 * @example
 * import {SASSCompile} from 'webcompiler';
 *
 * let compiler = new SASSCompile();
 */
export default class SASSCompile {

  importOnce: Object;

  includePaths: Array<string>;

  constructor(importOnceOptions: Object = {}, includePaths: Array<string> = []) {

    /**
     * importOnce resolver configuration
     *
     * @memberof SASSCompile
     * @private
     * @instance
     * @type {Object}
     */
    this.importOnce = Object.assign({}, options.importOnce, importOnceOptions);

    /**
     * an array of paths to search for an scss file in if it's not found in cwd
     *
     * @memberof SASSCompile
     * @private
     * @instance
     * @type {Array<string>}
     */
    this.includePaths = options.includePaths.concat(includePaths);
  }

  /**
   * Run the compiler
   *
   * @memberof SASSCompile
   * @instance
   * @method run
   * @param {string}   inPath   - a full system path to the input file
   * @param {string}   outPath  - a full system path to the output file (used when building a map file, nothing is ever
   *                              written to disk)
   * @param {Function} callback - a callback function which accepts 2 arguments: an error object or null and an object
   *                              containing the compiled "code" and a "map" string
   * @example
   * compiler.run('/path/to/the/input/file.scss', '/path/to/the/output/file.css', function (e) {
   *   if (e) {
   *     return console.log(
   *       '\x1b[41mSASS error\x1b[0m "\x1b[33m%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
   *       e.message, e.file, e.line, e.column);
   *   }
   *   // compiled successfully
   * });
   */
  run(inPath: string, outPath: string, callback: any) {
    render(Object.assign({}, options, {
      file: inPath,
      outFile: outPath,
      importOnce: this.importOnce,
      includePaths: this.includePaths
    }), function (e, result) {
      if (e) {
        return callback(e);
      }
      callback(null, {code: result.css, map: result.map.toString()});
    });
  }

}
