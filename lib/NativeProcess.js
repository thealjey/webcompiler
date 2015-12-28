'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NativeProcess = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* ignore */
var emptyFn = Function.prototype;

/**
 * Invoked on operation success or failure
 *
 * @callback NativeProcessCallback
 * @param {string} [stderr] - an error message
 * @param {string} stdout   - the process output
 */

/**
 * Encapsulates a ChildProcess instance of a "task"
 *
 * @class NativeProcess
 * @param {string} task - a process name
 * @example
 * import {NativeProcess} from 'webcompiler';
 *
 * const mkdir = new NativeProcess('mkdir');
 */

var NativeProcess = exports.NativeProcess = (function () {
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
   * mkdir.run(function (e) {
   *   if (e) {
   *     return console.error(e);
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

  (0, _createClass3.default)(NativeProcess, [{
    key: 'run',
    value: function run() {
      var callback = arguments.length <= 0 || arguments[0] === undefined ? emptyFn : arguments[0];

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

  }, {
    key: 'kill',
    value: function kill() {
      if (this.proc) {
        this.proc.kill();
        this.proc = null;
      }
    }
  }]);
  return NativeProcess;
})();