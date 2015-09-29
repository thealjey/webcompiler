'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _NativeProcess = require('./NativeProcess');

var _NativeProcess2 = _interopRequireDefault(_NativeProcess);

var _path = require('path');

var config = (0, _path.join)(__dirname, '..', 'config', 'scsslint.yml');

/**
 * A SASS linter
 *
 * @class
 * @param {...string} excludeLinter - names of linters to exclude
 * @example
 * import {SASSLint} from 'webcompiler';
 * import {join} from 'path';
 *
 * let linter = new SASSLint();
 */

var SASSLint = (function () {
  function SASSLint() {
    _classCallCheck(this, SASSLint);

    for (var _len = arguments.length, excludeLinter = Array(_len), _key = 0; _key < _len; _key++) {
      excludeLinter[_key] = arguments[_key];
    }

    /**
     * a comma-separated list of linter names to exclude from execution
     *
     * @memberof SASSLint
     * @private
     * @instance
     * @type {string}
     */
    this.excludeLinter = excludeLinter.join(',');

    /**
     * a NativeProcess instance for scss-lint
     *
     * @memberof SASSLint
     * @private
     * @instance
     * @type {NativeProcess}
     */
    this.proc = new _NativeProcess2['default']('scss-lint');
  }

  /**
   * Execute the linter
   *
   * @memberof SASSLint
   * @instance
   * @method run
   * @param {Array<string>} paths    - an array of paths to files/directories to lint
   * @param {Function}      callback - a callback function, accepts 1 argument: an error message or null
   * @example
   * // lint "style.scss" as well as the entire contents of the "sass" directory
   * linter.run([join(__dirname, 'style.scss'), join(__dirname, 'sass')], function (e) {
   *   if (e) {
   *     return console.error(e);
   *   }
   *   // there were no linting errors
   * });
   */

  _createClass(SASSLint, [{
    key: 'run',
    value: function run(paths, callback) {
      var args = paths.concat(['-c', config]);

      if (this.excludeLinter) {
        args.push('-x', this.excludeLinter);
      }
      this.proc.run(callback, args);
    }
  }]);

  return SASSLint;
})();

exports['default'] = SASSLint;
module.exports = exports['default'];