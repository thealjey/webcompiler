'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSLint = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _eslint = require('eslint');

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The JavaScript linting error object
 *
 * @typedef {Object} JSLintError
 * @property {string} message  - the error message
 * @property {string} [ruleId] - the relative linting rule
 * @property {string} filePath - the path to a file
 * @property {number} line     - the offending line number
 * @property {number} column   - the offending column number
 */

/**
 * Invoked on operation success or failure
 *
 * @callback JSLintCallback
 * @param {Array<JSLintError>} [errors] - a collection of error objects
 */

var configFile = (0, _path.join)(__dirname, '..', 'config', 'eslint.yml');

/**
 * A JavaScript linter
 *
 * @class JSLint
 * @param {Object} [rules={}] - an object that lets you override default linting rules
 * @example
 * import {JSLint} from 'webcompiler';
 * import {join} from 'path';
 *
 * const linter = new JSLint();
 */

var JSLint = exports.JSLint = function () {
  function JSLint() {
    var rules = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, JSLint);

    this.linter = new _eslint.CLIEngine({ configFile: configFile, rules: rules });
  }

  /**
   * Execute the linter
   *
   * @memberof JSLint
   * @instance
   * @method run
   * @param {Array<string>}  paths    - an array of paths to files/directories to lint
   * @param {JSLintCallback} callback - a callback function, accepts 1 argument: an array of error objects or null
   * @example
   * // lint "index.js" as well as the entire contents of the "src" directory
   * linter.run([join(__dirname, 'index.js'), join(__dirname, 'src')], function (err) {
   *   if (err) {
   *     return e.forEach(function (e) {
   *       console.log('\x1b[41mESLint error\x1b[0m "\x1b[33m%s%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
   *         e.message, e.ruleId ? ` (${e.ruleId})` : '', e.filePath, e.line, e.column);
   *     });
   *   }
   *   // there were no linting errors
   * });
   */

  /**
   * an internal linter instance
   *
   * @member {CLIEngine} linter
   * @memberof JSLint
   * @private
   * @instance
   */

  (0, _createClass3.default)(JSLint, [{
    key: 'run',
    value: function run(paths, callback) {
      var report = this.linter.executeOnFiles(paths),
          errors = [];

      report.results.forEach(function (f) {
        f.messages.forEach(function (e) {
          e.filePath = f.filePath;
          errors.push(e);
        });
      });
      callback(errors.length ? errors : null);
    }
  }]);
  return JSLint;
}();