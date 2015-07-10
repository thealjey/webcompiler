'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _eslint = require('eslint');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

/*eslint-disable no-mixed-requires*/
var baseRules = require(_path2['default'].join(__dirname, '..', 'config', 'eslint.json')),
    baseConfig = { parser: 'babel-eslint', ecmaFeatures: { jsx: true }, plugins: ['babel', 'react'] };

/*eslint-enable no-mixed-requires*/

/**
 * A JavaScript linter
 *
 * @class
 * @param {Object} [rules] - an object that lets you override default linting rules
 * @example
 * import {JSLint} from 'webcompiler';
 *
 * var linter = new JSLint();
 */

var JSLint = (function () {
  function JSLint() {
    var rules = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, JSLint);

    /**
     * an internal linter instance
     *
     * @memberof JSLint
     * @private
     * @instance
     * @type {CLIEngine}
     */
    this.linter = new _eslint.CLIEngine({ envs: ['node', 'browser'], rules: Object.assign({}, baseRules, rules) });
    Object.assign(this.linter.options.baseConfig, baseConfig);
  }

  _createClass(JSLint, [{
    key: 'run',

    /**
     * Execute the linter
     *
     * @memberof JSLint
     * @instance
     * @method run
     * @param {Array<string>} paths    - an array of paths to files/directories to lint
     * @param {Function}      callback - a callback function, accepts 1 argument: an array of error objects or null
     * @example
     * // lint "index.js" as well as the entire contents of the "src" directory
     * linter.run(['index.js', 'src'], function (e) {
     *   if (e) {
     *     return e.forEach(function (err) {
     *       console.log(
     *         '\x1b[41mESLint error\x1b[0m "\x1b[33m%s%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
     *         err.message, err.ruleId ? (' (' + err.ruleId + ')') : '', err.filePath, err.line, err.column);
     *     });
     *   }
     *   // there were no linting errors
     * });
     */
    value: function run(paths, callback) {
      var report = this.linter.executeOnFiles(paths),
          errors = [];

      report.results.forEach(function (f) {
        f.messages.forEach(function (e) {
          errors.push({
            message: e.message,
            ruleId: e.ruleId,
            filePath: f.filePath,
            line: e.line,
            column: e.column
          });
        });
      });
      callback(errors.length ? errors : null);
    }
  }]);

  return JSLint;
})();

exports['default'] = JSLint;
module.exports = exports['default'];