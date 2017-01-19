/* @flow */

import type {LintCallback} from './typedef';
import {CLIEngine} from 'eslint';
import {join} from 'path';
import forEach from 'lodash/forEach';

const configFile = join(__dirname, '..', '.eslintrc.yml');

/**
 * A JavaScript linter
 *
 * @class JSLint
 * @param {Object} [rules={}] - an object that lets you override default linting rules
 * @see {@link http://eslint.org/ ESLint}
 * @example
 * import {JSLint} from 'webcompiler';
 * // or - import {JSLint} from 'webcompiler/lib/JSLint';
 * // or - var JSLint = require('webcompiler').JSLint;
 * // or - var JSLint = require('webcompiler/lib/JSLint').JSLint;
 * import {join} from 'path';
 *
 * const linter = new JSLint();
 */
export class JSLint {

  /**
   * an internal linter instance
   *
   * @member {CLIEngine} linter
   * @memberof JSLint
   * @private
   * @instance
   */
  linter: CLIEngine;

  /* eslint-disable require-jsdoc */
  constructor(rules: Object = {}) {
    /* eslint-enable require-jsdoc */
    this.linter = new CLIEngine({configFile, rules});
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
  run(paths: Array<string>, callback: LintCallback) {
    const report = this.linter.executeOnFiles(paths),
      errors = [];

    forEach(report.results, ({messages, filePath: file}) => {
      forEach(messages, ({line, column, message, ruleId: rule}) => {
        errors.push({file, line, column, message, rule});
      });
    });
    callback(errors.length ? errors : null);
  }

}
