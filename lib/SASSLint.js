'use strict';

exports.__esModule = true;
exports.SASSLint = undefined;

var _path = require('path');

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _stylelint = require('stylelint');

var _logger = require('./logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable lodash/prefer-map */

const configFile = (0, _path.join)(__dirname, '..', '.stylelintrc.yaml');

/**
 * A SASS linter
 *
 * @class SASSLint
 * @param {Object} [configOverrides={}] - an object that lets you override the default linting configuration
 * @see {@link http://stylelint.io/ stylelint}
 * @example
 * import {SASSLint} from 'webcompiler';
 * // or - import {SASSLint} from 'webcompiler/lib/SASSLint';
 * // or - var SASSLint = require('webcompiler').SASSLint;
 * // or - var SASSLint = require('webcompiler/lib/SASSLint').SASSLint;
 * import {join} from 'path';
 *
 * const linter = new SASSLint();
 */


class SASSLint {

  /* eslint-disable require-jsdoc */
  constructor(configOverrides = {}) {
    /* eslint-enable require-jsdoc */
    this.configOverrides = configOverrides;
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
   * stylelint configOverrides
   *
   * @member {Object} configOverrides
   * @memberof SASSLint
   * @private
   * @instance
   */
  run(paths, callback) {
    (0, _stylelint.lint)({ configFile, configOverrides: this.configOverrides, files: paths }).then(({ results }) => {
      const errors = [];

      (0, _forEach2.default)(results, ({ source: file, warnings }) => {
        (0, _forEach2.default)(warnings, ({ line, column, text, rule }) => {
          errors.push({ file, line, column, message: text.replace(new RegExp(`\\s*\\(${rule}\\)$`), ''), rule });
        });
      });
      callback(errors.length ? errors : null);
    }).catch(_logger.logError);
  }

}
exports.SASSLint = SASSLint;