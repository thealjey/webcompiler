'use strict';

exports.__esModule = true;
exports.SASSLint = undefined;

var _path = require('path');

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _replace = require('lodash/replace');

var _replace2 = _interopRequireDefault(_replace);

var _stylelint = require('stylelint');

var _logger = require('./logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable lodash/prefer-map */

const defaultConfigFile = (0, _path.join)(__dirname, '..', '.stylelintrc.yaml');

/**
 * A SASS linter
 *
 * @class SASSLint
 * @param {string} [configFile="webcompiler/.stylelintrc.yaml"] - path to the stylelint configuration file
 * @see {@link http://stylelint.io/ stylelint}
 * @example
 * import {SASSLint} from 'webcompiler';
 * // or - import {SASSLint} from 'webcompiler/lib/SASSLint';
 * // or - var SASSLint = require('webcompiler').SASSLint;
 * // or - var SASSLint = require('webcompiler/lib/SASSLint').SASSLint;
 *
 * const linter = new SASSLint();
 */
class SASSLint {

  // eslint-disable-next-line require-jsdoc
  constructor(configFile = defaultConfigFile) {
    this.configFile = configFile;
  }

  /**
   * Execute the linter
   *
   * @memberof SASSLint
   * @instance
   * @method run
   * @param {Array<string>} paths    - an array of file globs. Ultimately passed to
   *                                   [node-glob](https://github.com/isaacs/node-glob) to figure out what files you
   *                                   want to lint.
   * @param {LintCallback}  callback - a callback function
   * @example
   * import {join} from 'path';
   * import {logLintingErrors} from 'webcompiler';
   *
   * // lint "style.scss" as well as the entire contents of the "sass" directory
   * linter.run([join(__dirname, 'style.scss'), join(__dirname, 'sass', '**', '*.scss')], errors => {
   *   if (errors) {
   *     return logLintingErrors(errors);
   *   }
   *   // there were no linting errors
   * });
   */


  /**
   * path to the stylelint configuration file
   *
   * @member {string} configFile
   * @memberof SASSLint
   * @private
   * @instance
   */
  run(paths, callback) {
    (0, _stylelint.lint)({ configFile: this.configFile, files: paths }).then(({ results }) => {
      const errors = [];

      (0, _forEach2.default)(results, ({ source: file, warnings }) => {
        (0, _forEach2.default)(warnings, ({ line, column, text, rule }) => {
          errors.push({ file, line, column, message: (0, _replace2.default)(text, new RegExp(`\\s*\\(${rule}\\)$`), ''), rule });
        });
      });
      callback(errors.length ? errors : null);
    }).catch(_logger.logError);
  }

}
exports.SASSLint = SASSLint;