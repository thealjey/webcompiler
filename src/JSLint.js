/* @flow */

import type {LintCallback} from './typedef';
import {CLIEngine} from 'eslint';
import {join} from 'path';
import forEach from 'lodash/forEach';

/* eslint-disable lodash/prefer-map */

const defaultConfigFile = join(__dirname, '..', '.eslintrc.yaml');

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
  constructor(configFile: string = defaultConfigFile) {
    /* eslint-enable require-jsdoc */
    this.linter = new CLIEngine({configFile});
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
  run(paths: string[], callback: LintCallback) {
    const {results} = this.linter.executeOnFiles(paths),
      errors = [];

    forEach(results, ({messages, filePath: file}) => {
      forEach(messages, ({line, column, message, ruleId: rule}) => {
        errors.push({file, line, column, message, rule});
      });
    });
    callback(errors.length ? errors : null);
  }

}
