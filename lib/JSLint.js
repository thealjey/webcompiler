'use strict';

exports.__esModule = true;
exports.JSLint = undefined;

var _eslint = require('eslint');

var _path = require('path');

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable lodash/prefer-map */

const defaultConfigFile = (0, _path.join)(__dirname, '..', '.eslintrc.yaml');

/**
 * A JavaScript linter
 *
 * @class JSLint
 * @param {string} [configFile="webcompiler/.eslintrc.yaml"] - path to the ESLint configuration file
 * @see {@link http://eslint.org/ ESLint}
 * @example
 * import {JSLint} from 'webcompiler';
 * // or - import {JSLint} from 'webcompiler/lib/JSLint';
 * // or - var JSLint = require('webcompiler').JSLint;
 * // or - var JSLint = require('webcompiler/lib/JSLint').JSLint;
 *
 * const linter = new JSLint();
 */
class JSLint {

  /* eslint-disable require-jsdoc */
  constructor(configFile = defaultConfigFile) {
    /* eslint-enable require-jsdoc */
    this.linter = new _eslint.CLIEngine({ configFile });
  }

  /**
   * Execute the linter
   *
   * @memberof JSLint
   * @instance
   * @method run
   * @param {Array<string>} paths    - an array of paths to files/directories to lint
   * @param {LintCallback}  callback - a callback function
   * @example
   * import {join} from 'path';
   * import {logLintingErrors} from 'webcompiler';
   *
   * // lint "index.js" as well as the entire contents of the "src" directory
   * linter.run([join(__dirname, 'index.js'), join(__dirname, 'src')], errors => {
   *   if (errors) {
   *     return logLintingErrors(errors);
   *   }
   *   // there were no linting errors
   * });
   */


  /**
   * an internal linter instance
   *
   * @member {CLIEngine} linter
   * @memberof JSLint
   * @private
   * @instance
   */
  run(paths, callback) {
    const { results } = this.linter.executeOnFiles(paths),
          errors = [];

    (0, _forEach2.default)(results, ({ messages, filePath: file }) => {
      (0, _forEach2.default)(messages, ({ line, column, message, ruleId: rule }) => {
        errors.push({ file, line, column, message, rule });
      });
    });
    callback(errors.length ? errors : null);
  }

}
exports.JSLint = JSLint;