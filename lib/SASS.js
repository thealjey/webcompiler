'use strict';

exports.__esModule = true;
exports.SASS = undefined;

var _SASSCompiler = require('./SASSCompiler');

var _SASSLint = require('./SASSLint');

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _logger = require('./logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * SASS compilation tools.
 *
 * Wraps {@link SASSCompiler} to add linting. If you don't want that, use {@link SASSCompiler} directly.
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
 * @param {SASSCompilerConfig} [options={}]                                 - configuration object
 * @param {string}             [configFile="webcompiler/.stylelintrc.yaml"] - path to the stylelint configuration file
 * @example
 * import {SASS} from 'webcompiler';
 * // or - import {SASS} from 'webcompiler/lib/SASS';
 * // or - var SASS = require('webcompiler').SASS;
 * // or - var SASS = require('webcompiler/lib/SASS').SASS;
 * import {join} from 'path';
 *
 * const scssDir = join(__dirname, 'scss'),
 *   cssDir = join(__dirname, 'css');
 *
 * const sass = new SASS();
 *
 * // compile for the browser
 * sass.fe(join(scssDir, 'style.scss'), join(cssDir, 'style.css'));
 */
class SASS {

  // eslint-disable-next-line require-jsdoc


  /**
   * SCSS compiler
   *
   * @member {SASSCompiler} compiler
   * @memberof SASS
   * @private
   * @instance
   */
  constructor(options, configFile) {
    this.compiler = new _SASSCompiler.SASSCompiler(options);
    this.linter = new _SASSLint.SASSLint(configFile);
  }

  /**
   * Performs linting
   *
   * @memberof SASS
   * @instance
   * @method lint
   * @param {Array<string>} paths    - an array of file globs. Ultimately passed to
   *                                   [node-glob](https://github.com/isaacs/node-glob) to figure out what files you
   *                                   want to lint.
   * @param {Function}      callback - a callback function, invoked only when successfully linted
   */


  /**
   * SCSS linter
   *
   * @member {SASSLint} linter
   * @memberof SASS
   * @private
   * @instance
   */
  lint(paths, callback) {
    this.linter.run(paths, linterErr => {
      if (linterErr) {
        return (0, _logger.logLintingErrors)(linterErr, 'SASS');
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
   * @param {string}        inPath                    - the input file path
   * @param {string}        outPath                   - the output file path
   * @param {Array<string>} [lintPaths=[]]            - an array of file globs. Ultimately passed to
   *                                                    [node-glob](https://github.com/isaacs/node-glob) to figure out
   *                                                    what files you want to lint.
   * @param {Function}      [callback=function () {}] - a callback function
   */
  fe(inPath, outPath, lintPaths = [], callback = _noop2.default) {
    this.lint(lintPaths.concat([inPath]), () => {
      this.compiler.fe(inPath, outPath, callback);
    });
  }

}
exports.SASS = SASS;