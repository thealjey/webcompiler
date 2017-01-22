'use strict';

exports.__esModule = true;
exports.NativeProcess = undefined;

var _child_process = require('child_process');

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class NativeProcess {

  /* eslint-disable require-jsdoc */


  /**
   * a process name
   *
   * @member {string} task
   * @memberof NativeProcess
   * @private
   * @instance
   */
  constructor(task) {
    /* eslint-enable require-jsdoc */
    this.task = task;
  }

  /**
   * Execute the command
   *
   * @memberof NativeProcess
   * @instance
   * @method run
   * @param  {StringOrErrorCallback} [callback=function () {}] - a callback function
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


  /**
   * a ChildProcess instance
   *
   * @member {ChildProcess} proc
   * @memberof NativeProcess
   * @private
   * @instance
   */
  run(callback = _noop2.default, args = [], opts = {}) {
    if (this.proc) {
      return callback(new Error('Still working'), '');
    }
    this.proc = (0, _child_process.spawn)(this.task, args, opts);

    let stdout = '',
        stderr = '';

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
exports.NativeProcess = NativeProcess;