/* @flow */

import {SASSCompiler} from './SASSCompiler';
import {SASSLint} from './SASSLint';
import noop from 'lodash/noop';

/**
 * SASS compilation tools
 *
 * @class SASS
 * @param {boolean}       [compress=true]        - if true `Compiler#optimize` will gzip compress the data
 * @param {Array<string>} [includePaths=[]]      - an array of additional include paths
 * @param {Array<string>} [excludeLinter=[]]     - names of linters to exclude
 * @param {Object}        [importOnceOptions={}] - an object that lets you override default importOnce resolver
 *                                                 configuration
 * @example
 * import {SASS} from 'webcompiler';
 * // or - import {SASS} from 'webcompiler/lib/SASS';
 * // or - var SASS = require('webcompiler').SASS;
 * // or - var SASS = require('webcompiler/lib/SASS').SASS;
 *
 * const sass = new SASS();
 */
export class SASS {
  /**
   * SCSS compiler
   *
   * @member {SASSCompiler} compiler
   * @memberof SASS
   * @private
   * @instance
   */
  compiler: SASSCompiler;

  /**
   * SCSS linter
   *
   * @member {SASSLint} linter
   * @memberof SASS
   * @private
   * @instance
   */
  linter: SASSLint;

  /* eslint-disable require-jsdoc */
  constructor(compress: boolean = true, includePaths: Array<string> = [], excludeLinter: Array<string> = [],
              importOnceOptions: Object = {}) {
    /* eslint-enable require-jsdoc */
    this.compiler = new SASSCompiler(compress, includePaths, importOnceOptions);
    this.linter = new SASSLint(...excludeLinter);
  }

  /**
   * Performs linting
   *
   * @memberof SASS
   * @instance
   * @method lint
   * @param {Array<string>} paths    - an array of paths to lint
   * @param {Function}      callback - a callback function
   * @example
   * sass.lint(['/path/to/the/input/file.scss', '/lint/this/directory/too'], () => {
   *   // successfully linted
   * });
   */
  lint(paths: Array<string>, callback: () => void) {
    this.linter.run(paths, linterErr => {
      if (linterErr) {
        return console.error(linterErr);
      }
      callback();
    });
  }

  /**
   * Wraps {@link SASSCompiler#fe} to add linting
   *
   * @memberof SASS
   * @instance
   * @method fe
   * @param {string}        inPath                    - the input path
   * @param {string}        outPath                   - the output path
   * @param {Array<string>} [lintPaths=[]]            - an array of paths to files/directories to lint
   * @param {Function}      [callback=function () {}] - a callback function
   * @return {void}
   * @example
   * compiler.fe('/path/to/an/input/file.js', '/path/to/the/output/file.js', ['/lint/this/directory/too'], () => {
   *   // the code has passed all the checks and has been compiled successfully
   * });
   */
  fe(inPath: string, outPath: string, lintPaths: Array<string> = [], callback: () => void = noop) {
    this.lint(lintPaths.concat([inPath]), () => {
      this.compiler.fe(inPath, outPath, callback);
    });
  }

}
