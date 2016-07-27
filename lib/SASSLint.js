'use strict';

exports.__esModule = true;
exports.SASSLint = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _NativeProcess = require('./NativeProcess');

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = (0, _path.join)(__dirname, '..', 'config', 'scsslint.yml');

/**
 * A SASS linter
 *
 * @class SASSLint
 * @param {...string} excludeLinter - names of linters to exclude
 * @example
 * import {SASSLint} from 'webcompiler';
 * // or - import {SASSLint} from 'webcompiler/lib/SASSLint';
 * // or - var SASSLint = require('webcompiler').SASSLint;
 * // or - var SASSLint = require('webcompiler/lib/SASSLint').SASSLint;
 * import {join} from 'path';
 *
 * const linter = new SASSLint();
 */

var SASSLint = exports.SASSLint = function () {

  /** @constructs */

  /**
   * a comma-separated list of linter names to exclude from execution
   *
   * @member {string} excludeLinter
   * @memberof SASSLint
   * @private
   * @instance
   */
  function SASSLint() {
    (0, _classCallCheck3.default)(this, SASSLint);

    for (var _len = arguments.length, excludeLinter = Array(_len), _key = 0; _key < _len; _key++) {
      excludeLinter[_key] = arguments[_key];
    }

    this.excludeLinter = excludeLinter.join(',');
    this.proc = new _NativeProcess.NativeProcess('scss-lint');
  }

  /**
   * Execute the linter
   *
   * @memberof SASSLint
   * @instance
   * @method run
   * @param {Array<string>} paths    - an array of paths to files/directories to lint
   * @param {Function}      callback - a callback function, executed only on success
   * @example
   * // lint "style.scss" as well as the entire contents of the "sass" directory
   * linter.run([join(__dirname, 'style.scss'), join(__dirname, 'sass')], error => {
   *   if (error) {
   *     return console.error(error);
   *   }
   *   // there were no linting errors
   * });
   */


  /**
   * a NativeProcess instance for scss-lint
   *
   * @member {NativeProcess} proc
   * @memberof SASSLint
   * @private
   * @instance
   */


  SASSLint.prototype.run = function run(paths, callback) {
    var args = paths.concat(['-c', config]);

    if (this.excludeLinter) {
      args.push('-x', this.excludeLinter);
    }
    this.proc.run(function (stderr) {
      if (null === stderr) {
        callback();
      }
    }, args, { stdio: 'inherit' });
  };

  return SASSLint;
}();