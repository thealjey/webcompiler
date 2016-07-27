/* @flow */

import {NativeProcess} from './NativeProcess';
import {join} from 'path';

const config = join(__dirname, '..', 'config', 'scsslint.yml');

/**
 * A SASS linter
 *
 * @class SASSLint
 * @param {...string} excludeLinter - names of linters to exclude
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
   * a comma-separated list of linter names to exclude from execution
   *
   * @member {string} excludeLinter
   * @memberof SASSLint
   * @private
   * @instance
   */
  excludeLinter: string;

  /**
   * a NativeProcess instance for scss-lint
   *
   * @member {NativeProcess} proc
   * @memberof SASSLint
   * @private
   * @instance
   */
  proc: NativeProcess;

  /** @constructs */
  constructor(...excludeLinter: Array<string>) {
    this.excludeLinter = excludeLinter.join(',');
    this.proc = new NativeProcess('scss-lint');
  }

  /**
   * Execute the linter
   *
   * @memberof SASSLint
   * @instance
   * @method run
   * @param {Array<string>} paths    - an array of paths to files/directories to lint
   * @param {Function}      callback - a callback function, executed only on success
   * @example
   * // lint "style.scss" as well as the entire contents of the "sass" directory
   * linter.run([join(__dirname, 'style.scss'), join(__dirname, 'sass')], error => {
   *   if (error) {
   *     return console.error(error);
   *   }
   *   // there were no linting errors
   * });
   */
  run(paths: Array<string>, callback: () => void) {
    const args = paths.concat(['-c', config]);

    if (this.excludeLinter) {
      args.push('-x', this.excludeLinter);
    }
    this.proc.run(stderr => {
      if (null === stderr) {
        callback();
      }
    }, args, {stdio: 'inherit'});
  }

}
