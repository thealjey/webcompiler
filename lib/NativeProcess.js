'use strict';

exports.__esModule = true;
exports.NativeProcess = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

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

var NativeProcess = exports.NativeProcess = function () {

  /* eslint-disable require-jsdoc */

  /**
   * a process name
   *
   * @member {string} task
   * @memberof NativeProcess
   * @private
   * @instance
   */

  function NativeProcess(task) {
    (0, _classCallCheck3.default)(this, NativeProcess);

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
   * mkdir.run(error => {
   *   if (error) {
   *     return console.error(error);
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


  NativeProcess.prototype.run = function run() {
    var callback = arguments.length <= 0 || arguments[0] === undefined ? _noop2.default : arguments[0];

    var _this = this;

    var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (this.proc) {
      return callback('Still working...', '');
    }
    this.proc = (0, _child_process.spawn)(this.task, args, opts);

    var stdout = '',
        stderr = '';

    if (this.proc.stdout) {
      this.proc.stdout.on('data', function (data) {
        stdout += data;
      });
    }
    if (this.proc.stderr) {
      this.proc.stderr.on('data', function (data) {
        stderr += data;
      });
    }
    this.proc.on('error', function (error) {
      stderr += error.toString();
    });
    this.proc.on('close', function (code) {
      _this.proc = null;
      callback(code ? stderr : null, stdout);
    });
  };

  /**
   * Kills the process if any is running
   *
   * @memberof NativeProcess
   * @instance
   * @method kill
   * @example
   * someEpensiveProcess.kill();
   */


  NativeProcess.prototype.kill = function kill() {
    if (this.proc) {
      this.proc.kill();
      this.proc = null;
    }
  };

  return NativeProcess;
}();