'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JS = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _JSCompiler = require('./JSCompiler');

var _NativeProcess = require('./NativeProcess');

var _JSLint = require('./JSLint');

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * JavaScript compilation tools
 *
 * @class JS
 * @param {boolean} [compress=true]   - if true `Compiler#optimize` will gzip compress the data
 * @param {Object}  [babelOptions={}] - allows to override the default Babel options
 * @param {Object}  [lintRules={}]    - allows to override the default linting rules
 * @example
 * import {JS} from 'webcompiler';
 *
 * const js = new JS();
 */

var JS = exports.JS = function () {

  /**
   * flow static analyzer
   *
   * @member {NativeProcess} flow
   * @memberof JS
   * @private
   * @instance
   */

  function JS() {
    var compress = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
    var babelOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var lintRules = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    (0, _classCallCheck3.default)(this, JS);

    this.compiler = new _JSCompiler.JSCompiler(compress, babelOptions);
    this.flow = new _NativeProcess.NativeProcess('flow');
    this.linter = new _JSLint.JSLint(lintRules);
  }

  /**
   * Performs static analysis
   *
   * @memberof JS
   * @instance
   * @method typecheck
   * @param {Function} callback - a callback function, invoked only when successfully typechecked
   * @example
   * js.typecheck(() => {
   *   // successfully typechecked
   * });
   */


  /**
   * JavaScript linter
   *
   * @member {JSLint} linter
   * @memberof JS
   * @private
   * @instance
   */

  /**
   * JavaScript compiler
   *
   * @member {JSCompiler} compiler
   * @memberof JS
   * @private
   * @instance
   */


  (0, _createClass3.default)(JS, [{
    key: 'typecheck',
    value: function typecheck(callback) {
      var _this = this;

      this.flow.run(function (flowErr, stdout) {
        if (flowErr) {
          return console.error(flowErr);
        }
        if (!JSON.parse(stdout).passed) {
          return _this.flow.run(_noop2.default, [], { stdio: 'inherit' });
        }
        callback();
      }, ['--json']);
    }

    /**
     * Performs linting
     *
     * @memberof JS
     * @instance
     * @method lint
     * @param {Array<string>} paths    - an array of paths to files/directories to lint
     * @param {Function}      callback - a callback function, invoked only when successfully linted
     * @example
     * js.lint(['/path/to/the/input/file.js', '/lint/this/directory/too'], () => {
     *   // successfully linted
     * });
     */

  }, {
    key: 'lint',
    value: function lint(paths, callback) {
      this.linter.run(paths, function (linterErr) {
        if (!linterErr) {
          return callback();
        }
        (0, _forEach2.default)(linterErr, function (e) {
          console.log('\x1b[41mESLint error\x1b[0m "\x1b[33m%s%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m', e.message, e.ruleId ? ' (' + e.ruleId + ')' : '', e.filePath, e.line, e.column);
        });
        console.log('JavaScript linting errors: %s', linterErr.length);
      });
    }

    /**
     * Performs static analysis and linting
     *
     * @memberof JS
     * @instance
     * @private
     * @method validate
     * @param {string}        inPath    - the input file (will also be linted)
     * @param {Array<string>} lintPaths - an array of paths to files/directories to lint
     * @param {Function}      callback  - a callback function, invoked only when successfully validated
     * @example
     * js.validate('/path/to/the/input/file.js', ['/lint/this/directory/too'], () => {
     *   // successfully validated
     * });
     */

  }, {
    key: 'validate',
    value: function validate(inPath, lintPaths, callback) {
      var _this2 = this;

      this.typecheck(function () {
        _this2.lint(lintPaths.concat([inPath]), callback);
      });
    }

    /**
     * Wraps {@link JSCompiler#be} to add static analysis and linting
     *
     * @memberOf JS
     * @instance
     * @method be
     * @param {string}        inPath                    - the input path
     * @param {string}        outPath                   - the output path
     * @param {Array<string>} [lintPaths=[]]            - an array of paths to files/directories to lint
     * @param {Function}      [callback=function () {}] - a callback function
     * @return {void}
     * @example
     * compiler.be('/path/to/an/input/file.js', '/path/to/the/output/file.js', ['/lint/this/directory/too'], () => {
     *   // the code has passed all the checks and has been compiled successfully
     * });
     */

  }, {
    key: 'be',
    value: function be(inPath, outPath) {
      var _this3 = this;

      var lintPaths = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
      var callback = arguments.length <= 3 || arguments[3] === undefined ? _noop2.default : arguments[3];

      this.validate(inPath, lintPaths, function () {
        _this3.compiler.be(inPath, outPath, callback);
      });
    }

    /**
     * Wraps {@link JSCompiler#fe} to add static analysis and linting
     *
     * @memberOf JS
     * @instance
     * @method fe
     * @param {string}        inPath                    - the input path
     * @param {string}        outPath                   - the output path
     * @param {Array<string>} [lintPaths=[]]            - an array of paths to files/directories to lint
     * @param {Function}      [callback=function () {}] - a callback function
     * @return {void}
     * @example
     * compiler.fe('/path/to/an/input/file.js', '/path/to/the/output/file.js', ['/lint/this/directory/too'], () => {
     *   // the code has passed all the checks and has been compiled successfully
     * });
     */

  }, {
    key: 'fe',
    value: function fe(inPath, outPath) {
      var _this4 = this;

      var lintPaths = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
      var callback = arguments.length <= 3 || arguments[3] === undefined ? _noop2.default : arguments[3];

      this.validate(inPath, lintPaths, function () {
        _this4.compiler.fe(inPath, outPath, callback);
      });
    }
  }]);
  return JS;
}();