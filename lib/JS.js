'use strict';

exports.__esModule = true;
exports.JS = undefined;

var _JSCompiler = require('./JSCompiler');

var _JSLint = require('./JSLint');

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _logger = require('./logger');

var _findBinary = require('./findBinary');

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultConfigFile = (0, _path.join)(__dirname, '..', '.eslintrc.yaml');

/**
 * JavaScript compilation tools.
 *
 * Wraps {@link JSCompiler} to add static analysis and linting. If you don't want that, use {@link JSCompiler} directly.
 *
 * @class JS
 * @param {boolean} [compress=true]                           - if true `Compiler#save` will gzip compress the data in
 *                                                              production mode
 * @param {string}  [configFile="webcompiler/.eslintrc.yaml"] - path to the ESLint configuration file
 * @example
 * import {JS} from 'webcompiler';
 * // or - import {JS} from 'webcompiler/lib/JS';
 * // or - var JS = require('webcompiler').JS;
 * // or - var JS = require('webcompiler/lib/JS').JS;
 * import {join} from 'path';
 *
 * const srcDir = join(__dirname, 'src'),
 *   libDir = join(__dirname, 'lib');
 *
 * const js = new JS();
 *
 * // compile for the browser
 * js.fe(join(srcDir, 'script.js'), join(libDir, 'script.js'));
 *
 * // compile for Node.js
 * js.be(join(srcDir, 'script.js'), join(libDir, 'script.js'));
 *
 * // compile entire directories for Node.js (non-JavaScript files are simply copied over)
 * js.be(srcDir, libDir);
 */
class JS {

  /* eslint-disable require-jsdoc */


  /**
   * JavaScript compiler
   *
   * @member {JSCompiler} compiler
   * @memberof JS
   * @private
   * @instance
   */
  constructor(compress = true, configFile = defaultConfigFile) {
    /* eslint-enable require-jsdoc */
    this.compiler = new _JSCompiler.JSCompiler(compress);
    this.linter = new _JSLint.JSLint(configFile);
  }

  /**
   * Performs static analysis
   *
   * @memberof JS
   * @static
   * @method typecheck
   * @param {Function} callback - a callback function, invoked only when successfully typechecked
   */


  /**
   * JavaScript linter
   *
   * @member {JSLint} linter
   * @memberof JS
   * @private
   * @instance
   */
  static typecheck(callback) {
    (0, _findBinary.findBinary)('flow', (error, flow) => {
      if (error) {
        return (0, _logger.logError)(error);
      }
      flow.run((flowErr, stdout) => {
        if (flowErr) {
          return (0, _logger.logError)(flowErr);
        }
        if (!JSON.parse(stdout).passed) {
          return flow.run(_noop2.default, [], { stdio: 'inherit' });
        }
        callback();
      }, ['--json']);
    });
  }

  /**
   * Performs linting
   *
   * @memberof JS
   * @instance
   * @method lint
   * @param {Array<string>} paths    - an array of paths to files/directories to lint
   * @param {Function}      callback - a callback function, invoked only when successfully linted
   */
  lint(paths, callback) {
    this.linter.run(paths, linterErr => {
      if (linterErr) {
        return (0, _logger.logLintingErrors)(linterErr, 'JavaScript');
      }
      callback();
    });
  }

  /**
   * Performs static analysis and linting
   *
   * @memberof JS
   * @instance
   * @private
   * @method validate
   * @param {string}        inPath    - the input file (will also be linted)
   * @param {Array<string>} lintPaths - an array of paths to files/directories to lint
   * @param {Function}      callback  - a callback function, invoked only when successfully validated
   */
  validate(inPath, lintPaths, callback) {
    JS.typecheck(() => {
      this.lint(lintPaths.concat([inPath]), callback);
    });
  }

  /**
   * Wraps {@link JSCompiler#be} to add static analysis and linting.
   *
   * If `inPath` is a directory, `outPath` has to be also.
   *
   * @memberOf JS
   * @instance
   * @method be
   * @param {string}        inPath                    - the input file/directory path
   * @param {string}        outPath                   - the output file/directory path
   * @param {Array<string>} [lintPaths=[]]            - an array of paths to files/directories to lint
   * @param {Function}      [callback=function () {}] - a callback function
   */
  be(inPath, outPath, lintPaths = [], callback = _noop2.default) {
    this.validate(inPath, lintPaths, () => {
      this.compiler.be(inPath, outPath, callback);
    });
  }

  /**
   * Wraps {@link JSCompiler#fe} to add static analysis and linting
   *
   * @memberOf JS
   * @instance
   * @method fe
   * @param {string}        inPath                    - the input file path
   * @param {string}        outPath                   - the output file path
   * @param {Array<string>} [lintPaths=[]]            - an array of paths to files/directories to lint
   * @param {Function}      [callback=function () {}] - a callback function
   */
  fe(inPath, outPath, lintPaths = [], callback = _noop2.default) {
    this.validate(inPath, lintPaths, () => {
      this.compiler.fe(inPath, outPath, callback);
    });
  }

}
exports.JS = JS;