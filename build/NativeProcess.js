'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _child_process = require('child_process');

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

var NativeProcess = (function () {
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
   * Execute the command
   *
   * @memberof NativeProcess
   * @instance
   * @method run
   * @param {Function}      callback  - a callback function, accepts 2 arguments: an error string or null and the
   *                                    response string
   * @param {Array<string>} [args=[]] - an optional array of arguments to pass to the process
   * @param {Object}        [opts={}] - an optional object containing configuration options for the process
   * @example
   * mkdir.run(function (e) {
   *   if (e) {
   *     return console.error(e);
   *   }
   *   // created a directory named "example" in cwd
   * }, ['example']);
   */

  _createClass(NativeProcess, [{
    key: 'run',
    value: function run(callback) {
      var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
      var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var stdout = '',
          stderr = '';

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
      this.proc = (0, _child_process.spawn)(this.task, args, opts);
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
      this.proc.on('close', function (code) {
        callback(code ? stderr : null, stdout);
      });
    }
  }]);

  return NativeProcess;
})();

exports['default'] = NativeProcess;
module.exports = exports['default'];