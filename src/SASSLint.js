/* @flow */

import type {LintCallback} from './typedef';
import {join} from 'path';
import forEach from 'lodash/forEach';
import {lint} from 'stylelint';
import {logError} from './logger';

/* eslint-disable lodash/prefer-map */

const defaultConfigFile = join(__dirname, '..', '.stylelintrc.yaml');

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
 * import {join} from 'path';
 *
 * const linter = new SASSLint();
 */
export class SASSLint {

  /**
   * path to the stylelint configuration file
   *
   * @member {string} configFile
   * @memberof SASSLint
   * @private
   * @instance
   */
  configFile: string;

  /* eslint-disable require-jsdoc */
  constructor(configFile: string = defaultConfigFile) {
    /* eslint-enable require-jsdoc */
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
  run(paths: Array<string>, callback: LintCallback) {
    lint({configFile: this.configFile, files: paths}).then(({results}) => {
      const errors = [];

      forEach(results, ({source: file, warnings}) => {
        forEach(warnings, ({line, column, text, rule}) => {
          errors.push({file, line, column, message: text.replace(new RegExp(`\\s*\\(${rule}\\)$`), ''), rule});
        });
      });
      callback(errors.length ? errors : null);
    }).catch(logError);
  }

}
