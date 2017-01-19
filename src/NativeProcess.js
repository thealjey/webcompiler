/* @flow */

import type {NativeProcessCallback} from './typedef';
import {spawn} from 'child_process';
import noop from 'lodash/noop';

/**
 * Encapsulates a {@link https://nodejs.org/api/child_process.html#child_process_class_childprocess ChildProcess}
 * instance of a `task`
 *
 * @class NativeProcess
 * @param {string} task - a process name
 * @example
 * import {NativeProcess} from 'webcompiler';
 * // or - import {NativeProcess} from 'webcompiler/lib/NativeProcess';
 * // or - var NativeProcess = require('webcompiler').NativeProcess;
 * // or - var NativeProcess = require('webcompiler/lib/NativeProcess').NativeProcess;
 *
 * const mkdir = new NativeProcess('mkdir');
 */
export class NativeProcess {

  /**
   * a process name
   *
   * @member {string} task
   * @memberof NativeProcess
   * @private
   * @instance
   */
  task: string;

  /**
   * a ChildProcess instance
   *
   * @member {ChildProcess} proc
   * @memberof NativeProcess
   * @private
   * @instance
   */
  proc: any;

  /* eslint-disable require-jsdoc */
  constructor(task: string) {
    /* eslint-enable require-jsdoc */
    this.task = task;
  }

  /**
   * Execute the command
   *
   * @memberof NativeProcess
   * @instance
   * @method run
   * @param  {NativeProcessCallback} [callback=function () {}] - a callback function
   * @param  {Array<string>}         [args=[]]                 - an array of arguments to pass to the process
   * @param  {Object}                [opts={}]                 - a configuration object for the process
   * @return {void}
   * @example
   * import {logError} from 'webcompiler';
   *
   * mkdir.run(error => {
   *   if (error) {
   *     return logError(error);
   *   }
   *   // created a directory named "example" in cwd
   * }, ['example']);
   */
  run(callback: NativeProcessCallback = noop, args: Array<string> = [], opts: Object = {}) {
    if (this.proc) {
      return callback(new Error('Still working'), '');
    }
    this.proc = spawn(this.task, args, opts);

    let stdout = '', stderr = '';

    if (this.proc.stdout) {
      this.proc.stdout.on('data', data => {
        stdout += data;
      });
    }
    if (this.proc.stderr) {
      this.proc.stderr.on('data', data => {
        stderr += data;
      });
    }
    this.proc.on('error', error => {
      stderr += error.toString();
    });
    this.proc.on('close', code => {
      this.proc = null;
      callback(code ? new Error(stderr) : null, stdout);
    });
  }

  /**
   * Kills the process if any is running
   *
   * @memberof NativeProcess
   * @instance
   * @method kill
   * @example
   * someEpensiveProcess.kill();
   */
  kill() {
    if (this.proc) {
      this.proc.kill();
      this.proc = null;
    }
  }

}
