/* @flow */

import {CLIEngine} from 'eslint';
import {join} from 'path';

/**
 * The JavaScript linting error object
 *
 * @typedef {Object} JSLintError
 * @property {string} message  - the error message
 * @property {string} [ruleId] - the relative linting rule
 * @property {string} filePath - the path to a file
 * @property {number} line     - the offending line number
 * @property {number} column   - the offending column number
 */
type JSLintError = {message: string, ruleId?: string, filePath: string, line: number, column: number};

/**
 * Invoked on operation success or failure
 *
 * @callback JSLintCallback
 * @param {Array<JSLintError>} [errors] - a collection of error objects
 */
export type JSLintCallback = (errors: ?Array<JSLintError>) => void;

const configFile = join(__dirname, '..', 'config', 'eslint.yml');

/**
 * A JavaScript linter
 *
 * @class JSLint
 * @param {Object} [rules={}] - an object that lets you override default linting rules
 * @example
 * import {JSLint} from 'webcompiler';
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

  constructor(rules: Object = {}) {
    this.linter = new CLIEngine({configFile, rules});
  }

  /**
   * Execute the linter
   *
   * @memberof JSLint
   * @instance
   * @method run
   * @param {Array<string>}  paths    - an array of paths to files/directories to lint
   * @param {JSLintCallback} callback - a callback function, accepts 1 argument: an array of error objects or null
   * @example
   * // lint "index.js" as well as the entire contents of the "src" directory
   * linter.run([join(__dirname, 'index.js'), join(__dirname, 'src')], function (err) {
   *   if (err) {
   *     return e.forEach(function (e) {
   *       console.log('\x1b[41mESLint error\x1b[0m "\x1b[33m%s%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
   *         e.message, e.ruleId ? ` (${e.ruleId})` : '', e.filePath, e.line, e.column);
   *     });
   *   }
   *   // there were no linting errors
   * });
   */
  run(paths: Array<string>, callback: JSLintCallback) {
    const report = this.linter.executeOnFiles(paths),
        errors = [];

    report.results.forEach(f => {
      f.messages.forEach(e => {
        e.filePath = f.filePath;
        errors.push(e);
      });
    });
    callback(errors.length ? errors : null);
  }

}
