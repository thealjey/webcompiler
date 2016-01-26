/* @flow */

import {Compiler} from './Compiler';
import type {ProgramData} from './Compiler';
import {render} from 'node-sass';
import importer from 'node-sass-import-once';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import forEach from 'lodash/forEach';
import noop from 'lodash/noop';

const precision = 8,
    importOnceDefaults = {index: true, css: false, bower: false},
    defaultIncludePaths = ['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules'];

/**
 * Invoked when the data was successfully autoprefixed
 *
 * @callback AutoprefixCallback
 * @param {ProgramData} data - the parsed object
 */
type AutoprefixCallback = (data: ProgramData) => void;

/**
 * A SASS compiler
 *
 * @class SASSCompiler
 * @extends Compiler
 * @param {boolean}       [compress=true]        - if true `Compiler#optimize` will gzip compress the data
 * @param {Array<string>} [includePaths=[]]      - an array of additional include paths
 * @param {Object}        [importOnceOptions={}] - an object that lets you override default importOnce resolver
 *                                                 configuration
 * @example
 * import {SASSCompiler} from 'webcompiler';
 *
 * const compiler = new SASSCompiler();
 */
export class SASSCompiler extends Compiler {
  /**
   * an array of paths to search for an scss file in if it's not found in cwd
   *
   * @member {Array<string>} includePaths
   * @memberof SASSCompiler
   * @private
   * @instance
   */
  includePaths: Array<string>;

  /**
   * importOnce resolver configuration
   *
   * @member {Object} importOnce
   * @memberof SASSCompiler
   * @private
   * @instance
   */
  importOnce: Object;

  constructor(compress: boolean = true, includePaths: Array<string> = [], importOnceOptions: Object = {}) {
    super(compress);
    this.includePaths = defaultIncludePaths.concat(includePaths);
    this.importOnce = {...importOnceDefaults, ...importOnceOptions};
  }

  /**
   * Auto-prefixes the compiled code
   *
   * @memberOf SASSCompiler
   * @instance
   * @method autoprefix
   * @param {string}             path     - a path to the file
   * @param {ProgramData}        data     - the actual program data to auto-prefix
   * @param {AutoprefixCallback} callback - a callback function
   * @example
   * compiler.autoprefix('/path/to/the/output/file.css', data, result => {
   *   // successfully added the vendor prefixes
   * });
   */
  autoprefix(path: string, data: ProgramData, callback: AutoprefixCallback) {
    postcss([autoprefixer]).process(data.code, {
      from: path,
      to: path,
      map: {prev: data.map}
    }).then(result => {
      const warnings = result.warnings();

      if (warnings.length) {
        return forEach(warnings, warning => {
          console.error(warning.toString());
        });
      }
      callback({code: result.css, map: JSON.stringify(result.map)});
    });
  }

  /**
   * Compiles, auto-prefixes and optionally minifies and g-zips in the production mode
   *
   * @memberof SASSCompiler
   * @instance
   * @method fe
   * @param {string}   inPath                    - a full system path to the input file
   * @param {string}   outPath                   - a full system path to the output file
   * @param {Function} [callback=function () {}] - a callback function
   * @example
   * compiler.fe('/path/to/the/input/file.scss', '/path/to/the/output/file.css', () => {
   *   // compiled successfully
   * });
   */
  fe(inPath: string, outPath: string, callback: () => void = noop) {
    render({
      file: inPath,
      outFile: outPath,
      importer,
      precision,
      importOnce: this.importOnce,
      includePaths: this.includePaths,
      sourceMap: true,
      sourceMapContents: true,
      outputStyle: this.isProduction ? 'compressed' : 'nested'
    }, (error, result) => {
      if (error) {
        return console.log(
          '\x1b[41mSASS error\x1b[0m "\x1b[33m%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
          error.message, error.file, error.line, error.column);
      }
      this.autoprefix(outPath, {code: result.css, map: result.map.toString()}, data => {
        this.optimize(inPath, outPath, data, callback);
      });
    });
  }

}
