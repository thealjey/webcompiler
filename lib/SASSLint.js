/* @flow */

import NativeProcess from './NativeProcess';
import {join} from 'path';

const config = join(__dirname, '..', 'config', 'scsslint.yml');

/**
 * A SASS linter
 *
 * @class
 * @param {...string} excludeLinter - names of linters to exclude
 * @example
 * import {SASSLint} from 'webcompiler';
 * import {join} from 'path';
 *
 * let linter = new SASSLint();
 */
export default class SASSLint {

  excludeLinter: string;

  proc: NativeProcess;

  constructor(...excludeLinter: Array<string>) {

    /**
     * a comma-separated list of linter names to exclude from execution
     *
     * @memberof SASSLint
     * @private
     * @instance
     * @type {string}
     */
    this.excludeLinter = excludeLinter.join(',');

    /**
     * a NativeProcess instance for scss-lint
     *
     * @memberof SASSLint
     * @private
     * @instance
     * @type {NativeProcess}
     */
    this.proc = new NativeProcess('scss-lint');
  }

  /**
   * Execute the linter
   *
   * @memberof SASSLint
   * @instance
   * @method run
   * @param {Array<string>} paths    - an array of paths to files/directories to lint
   * @param {Function}      callback - a callback function, accepts 1 argument: an error message or null
   * @example
   * // lint "style.scss" as well as the entire contents of the "sass" directory
   * linter.run([join(__dirname, 'style.scss'), join(__dirname, 'sass')], function (e) {
   *   if (e) {
   *     return console.error(e);
   *   }
   *   // there were no linting errors
   * });
   */
  run(paths: Array<string>, callback: Function) {
    const args = paths.concat(['-c', config]);

    if (this.excludeLinter) {
      args.push('-x', this.excludeLinter);
    }
    this.proc.run(callback, args);
  }

}
