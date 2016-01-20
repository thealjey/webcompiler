/* @flow */

import {Compiler} from './Compiler';
import type {ProgramData} from './Compiler';
import {render} from 'node-sass';
import importer from 'node-sass-import-once';
import CleanCSS from 'clean-css';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

const precision = 8,
    roundingPrecision = -1,
    sourceMappingURLPattern = /\n*\/\*# sourceMappingURL=\S+ \*\//,
    options = {
      file: null,
      outFile: null,
      importer,
      importOnce: {index: true, css: false, bower: false},
      includePaths: ['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules'],
      precision,
      sourceMap: true,
      sourceMapContents: true
    },

    /* @flowignore */
    emptyFn: () => void = Function.prototype;

/**
 * Invoked on operation success or failure
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
    this.includePaths = options.includePaths.concat(includePaths);
    this.importOnce = Object.assign({}, options.importOnce, importOnceOptions);
  }

  /**
   * Minifies the compiled code
   *
   * @memberOf SASSCompiler
   * @instance
   * @method minify
   * @param  {string}      path     - a path to the file (can be used for the sourceMappingURL comment)
   * @param  {ProgramData} data     - the actual program data to compress
   * @return {ProgramData} processed application code with source maps or null on error
   * @example
   * const minifiedData = compiler.minify('/path/to/the/output/file.css', data);
   */
  minify(path: string, data: ProgramData): ?ProgramData {
    const sourceMappingURL = data.code.match(sourceMappingURLPattern),
        minified = new CleanCSS({
          keepSpecialComments: 0,
          roundingPrecision,
          sourceMap: data.map,
          sourceMapInlineSources: true
        }).minify(data.code),
        errors = minified.errors.concat(minified.warnings);

    if (errors.length) {
      errors.forEach(error => {
        console.error(error);
      });
      return null;
    }
    return {code: `${minified.styles}${sourceMappingURL ? sourceMappingURL[0] : ''}`, map: minified.sourceMap};
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
        return warnings.forEach(warning => {
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
  fe(inPath: string, outPath: string, callback: () => void = emptyFn) {
    render(Object.assign({}, options, {
      file: inPath,
      outFile: outPath,
      importOnce: this.importOnce,
      includePaths: this.includePaths
    }), (error, result) => {
      if (error) {
        return console.log(
          '\x1b[41mSASS error\x1b[0m "\x1b[33m%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
          error.message, error.file, error.line, error.column);
      }
      this.autoprefix(outPath, {code: result.css, map: result.map.toString()}, data => {
        if (this.isProduction) {
          return this.optimize(inPath, outPath, data, callback);
        }
        this.fsWrite(outPath, data, () => {
          this.done(inPath, callback);
        });
      });
    });
  }

}
