/* @flow */

import {CLIEngine} from 'eslint';
import {join} from 'path';

/**
 * A JavaScript linter
 *
 * @class
 * @param {Object} [rules] - an object that lets you override default linting rules
 * @example
 * import {JSLint} from 'webcompiler';
 * import {join} from 'path';
 *
 * var linter = new JSLint();
 */
export default class JSLint {

  linter: CLIEngine;

  constructor(rules: Object = {}) {
    /**
     * an internal linter instance
     *
     * @memberof JSLint
     * @private
     * @instance
     * @type {CLIEngine}
     */
    this.linter = new CLIEngine({configFile: join(__dirname, '..', 'config', 'eslint.yml'), rules});
  }

  /**
   * Execute the linter
   *
   * @memberof JSLint
   * @instance
   * @method run
   * @param {Array<string>} paths    - an array of paths to files/directories to lint
   * @param {Function}      callback - a callback function, accepts 1 argument: an array of error objects or null
   * @example
   * // lint "index.js" as well as the entire contents of the "src" directory
   * linter.run([join(__dirname, 'index.js'), join(__dirname, 'src')], function (e) {
   *   if (e) {
   *     return e.forEach(function (err) {
   *       console.log('\x1b[41mESLint error\x1b[0m "\x1b[33m%s%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
   *         err.message, err.ruleId ? ` (${err.ruleId})` : '',
   *         err.filePath, err.line, err.column);
   *     });
   *   }
   *   // there were no linting errors
   * });
   */
  run(paths: Array<string>, callback: any) {
    var report = this.linter.executeOnFiles(paths), errors = [];

    report.results.forEach(function (f) {
      f.messages.forEach(function (e) {
        e.filePath = f.filePath;
        errors.push(e);
      });
    });
    callback(errors.length ? errors : null);
  }

}
