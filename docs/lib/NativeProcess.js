Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/* @flow */

var _child_process = require('child_process');

/**
 * Encapsulates a ChildProcess instance of a "task"
 *
 * @class
 * @param {string} task - a process name
 */

let NativeProcess = (function () {

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

  _createClass(NativeProcess, [{
    key: 'run',

    /**
     * Run a callback if the process did not end with an error, optionally pass an array of arguments
     *
     * @memberof NativeProcess
     * @instance
     * @method run
     * @param {Function} callback - a callback function
     * @param {Array<string>} [args]   - an optional array of arguments to pass to the process
     */
    value: function run(callback, args = []) {
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
      this.proc = (0, _child_process.spawn)(this.task, args, { stdio: 'inherit' });
      this.proc.on('close', function processCloseHandler(code) {
        if (!code) {
          callback();
        }
      });
    }
  }]);

  return NativeProcess;
})();

exports.default = NativeProcess;
module.exports = exports.default;