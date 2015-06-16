/* @flow */

import {spawn} from 'child_process';

/**
 * Encapsulates a ChildProcess instance of a "task"
 *
 * @class
 * @param {string} task - a process name
 */
export default class NativeProcess {

  task: string;

  proc: any;

  /**
   * Initializes the object
   *
   * @param {string} task - a process name
   */
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
   * Run a callback if the process did not end with an error, optionally pass an array of arguments
   *
   * @memberof NativeProcess
   * @instance
   * @method run
   * @param {Function} callback - a callback function
   * @param {Array<string>} [args]   - an optional array of arguments to pass to the process
   */
  run(callback: Function, args: Array<string> = []) {
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
    /* @noflow */
    this.proc = spawn(this.task, args, {stdio: 'inherit'});
    this.proc.on('close', function processCloseHandler(code) {
      if (!code) {
        callback();
      }
    });
  }

}
