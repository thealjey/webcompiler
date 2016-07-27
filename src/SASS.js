/* @flow */

import {SASSCompiler} from './SASSCompiler';
import {SASSLint} from './SASSLint';
import noop from 'lodash/noop';

/**
 * SASS compilation tools
 *
 * Configures the default include paths for the following popular CSS modules:
 *
 *  1. Bootstrap (e.g. you can write `@import "bootstrap";` in your ".scss" files)
 *  2. Font Awesome (`@import "font-awesome";`)
 *  3. Bootswatch (`@import "cosmo/variables"; @import "bootstrap"; @import "cosmo/bootswatch";`)
 *
 * Additionally, if an NPM module contains an `_index.scss` (or `_index.sass`, or `index.scss`, or `index.sass`) file in
 * its root directory, importing its stylesheets is as easy as: `@import "<module name>";` (same as you would `import`
 * the module in JavaScript).
 *
 * @class SASS
 * @param {boolean}       [compress=true]        - if true `Compiler#save` will gzip compress the data
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
    this.linter.run(lintPaths.concat([inPath]), () => {
      this.compiler.fe(inPath, outPath, callback);
    });
  }

}
