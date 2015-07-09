/* @flow */

import {spawn} from 'child_process';

/**
 * Encapsulates a ChildProcess instance of a "task"
 *
 * @class
 * @param {string} task - a process name
 * @example
 * import {NativeProcess} from 'webcompiler';
 *
 * var mkdir = new NativeProcess('mkdir');
 */
export default class NativeProcess {

  task: string;

  proc: any;

  constructor(task: string) {

    /**
     * a process name
     *
     * @memberof NativeProcess
     * @private
     * @instance
     * @type {string}
     */
    this.task = task;
  }

  /**
   * Execute the command
   *
   * @memberof NativeProcess
   * @instance
   * @method run
   * @param {Function}      callback - a callback function, accepts 2 arguments: an error string or null and the
   *                                   response string
   * @param {Array<string>} [args]   - an optional array of arguments to pass to the process
   * @param {Object}        [opts]   - an optional object containing configuration options for the process
   * @example
   * mkdir.run(function (e) {
   *   if (e) {
   *     return console.error(e);
   *   }
   *   // created a directory named "example" in cwd
   * }, ['example']);
   */
  run(callback: any, args: Array<string> = [], opts: Object = {}) {
    var stdout = '', stderr = '';

    if (this.proc) {
      this.proc.kill();
    }

    /**
     * a ChildProcess instance
     *
     * @memberof NativeProcess
     * @private
     * @instance
     * @type {ChildProcess}
     */
    this.proc = spawn(this.task, args, opts);
    this.proc.stdout.on('data', function (data) {
      stdout += data;
    });
    this.proc.stderr.on('data', function (data) {
      stderr += data;
    });
    this.proc.on('close', function (code) {
      callback(code ? stderr : null, stdout);
    });
  }

}
