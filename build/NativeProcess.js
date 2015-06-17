

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

exports.__esModule = true;

var _child_process = require('child_process');

/**
 * Encapsulates a ChildProcess instance of a "task"
 *
 * @class
 * @param {string} task - a process name
 */

var NativeProcess = (function () {

  /**
   * Initializes the object
   *
   * @param {string} task - a process name
   */

  function NativeProcess(task) {
    _classCallCheck(this, NativeProcess);

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
   * @param {Function}      callback - a callback function
   * @param {Array<string>} [args]   - an optional array of arguments to pass to the process
   * @param {Object}        [opts]   - an optional object containing configuration options for the process
   */

  NativeProcess.prototype.run = function run(callback) {
    var args = arguments[1] === undefined ? [] : arguments[1];
    var opts = arguments[2] === undefined ? {} : arguments[2];

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
    this.proc = (0, _child_process.spawn)(this.task, args, _Object$assign({ stdio: 'inherit' }, opts));
    this.proc.on('close', function processCloseHandler(code) {
      if (!code) {
        callback();
      }
    });
  };

  return NativeProcess;
})();

exports['default'] = NativeProcess;
module.exports = exports['default'];