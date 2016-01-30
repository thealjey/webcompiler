'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Documentation = undefined;

var _NativeProcess = require('./NativeProcess');

var _fs = require('fs');

var _path = require('path');

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var npm = new _NativeProcess.NativeProcess('npm'),
    cwd = process.cwd(),
    defaultOptions = {
  inputDir: (0, _path.join)(cwd, 'src'),
  outputDir: (0, _path.join)(cwd, 'docs'),
  readMe: (0, _path.join)(cwd, 'README.md'),
  template: (0, _path.join)(cwd, 'node_modules', 'ink-docstrap', 'template'),
  jsdocConfig: (0, _path.join)(__dirname, '..', 'config', 'jsdoc.json')
};

/**
 * Generates API documentation
 *
 * The default JSDoc plugin specified in `jsdocConfig` strips out all of the code from a file while retaining newlines
 * (unlike the built in `commentsOnly` plugin that ships with JSDoc3).
 *
 * That way:
 * 1. line numbers are preserved in the source view
 * 2. you don't need to use a pre-compiler, you will always see the same code as you wrote in the docs source view
 * 3. since JSDoc only sees comments you can use any code syntax you like - ES2015, ES7, JSX, it doesn't even have to be
 * JavaScript.
 *
 * The markdown plugin is also included by default.
 *
 * @class Documentation
 * @param {DocumentationConfig} [config={}] - a configuration object
 * @example
 * import {Documentation} from 'webcompiler';
 *
 * const docs = new Documentation();
 */

var Documentation = exports.Documentation = function () {
  /**
   * JSDoc3
   *
   * @member {NativeProcess} jsdoc
   * @memberof Documentation
   * @private
   * @instance
   */

  function Documentation() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, Documentation);

    this.options = (0, _extends3.default)({}, defaultOptions, options);
  }

  /**
   * Finds a path to the JSDoc3 executable
   *
   * @memberof Documentation
   * @static
   * @private
   * @method findExecutable
   * @param {FileCallback} callback - a callback function
   * @example
   * Documentation.findExecutable(file => {
   *   // the jsdoc file is found
   * });
   */

  /**
   * documentation generator configuration object
   *
   * @member {DocumentationConfig} options
   * @memberof Documentation
   * @private
   * @instance
   */

  (0, _createClass3.default)(Documentation, [{
    key: 'run',

    /**
     * Generate the documentation
     *
     * @memberof Documentation
     * @instance
     * @method run
     * @param {Function} [callback=function () {}] - a callback function
     * @return {void}
     * @example
     * docs.run(() => {
     *   // generated the API documentation
     * });
     */
    value: function run() {
      var _this = this;

      var callback = arguments.length <= 0 || arguments[0] === undefined ? _noop2.default : arguments[0];

      if (this.jsdoc) {
        return this.doRun(this.jsdoc, callback);
      }
      Documentation.findExecutable(function (file) {
        _this.jsdoc = new _NativeProcess.NativeProcess(file);
        _this.doRun(_this.jsdoc, callback);
      });
    }

    /**
     * Given a JSDoc3 executable, generate the documentation
     *
     * @memberof Documentation
     * @instance
     * @private
     * @method doRun
     * @param {NativeProcess} jsdoc    - JSDoc3
     * @param {Function}      callback - a callback function
     * @example
     * docs.doRun(jsdoc, () => {
     *   // generated the API documentation
     * });
     */

  }, {
    key: 'doRun',
    value: function doRun(jsdoc, callback) {
      var _options = this.options;
      var inputDir = _options.inputDir;
      var outputDir = _options.outputDir;
      var readMe = _options.readMe;
      var template = _options.template;
      var jsdocConfig = _options.jsdocConfig;

      jsdoc.run(function (stderr) {
        if (stderr) {
          return console.error(stderr);
        }
        callback();
      }, [inputDir, '-d', outputDir, '-R', readMe, '-c', jsdocConfig, '-t', template]);
    }
  }], [{
    key: 'findExecutable',
    value: function findExecutable(callback) {
      Documentation.checkBin(function (localFile) {
        if (localFile) {
          return callback(localFile);
        }
        Documentation.checkBin(function (globalFile) {
          if (globalFile) {
            return callback(globalFile);
          }
          console.error('Failed to locate the jsdoc executable');
        }, true);
      });
    }

    /**
     * Checks the NPM bin directories to see if they contain a file named jsdoc
     *
     * @memberof Documentation
     * @static
     * @private
     * @method checkBin
     * @param {NullableFileCallback} callback        - a callback function
     * @param {globalPackage}        [boolean=false] - if true checks the global NPM bin directory (contains the npm
     *                                                 executable itself)
     * @example
     * Documentation.checkBin(file => {
     *   if (file) {
     *     // the jsdoc file is found
     *   }
     * });
     */

  }, {
    key: 'checkBin',
    value: function checkBin(callback) {
      var globalPackage = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var args = ['bin'];

      if (globalPackage) {
        args.push('-g');
      }
      npm.run(function (stderr, stdout) {
        if (stderr) {
          console.error(stderr);
          return callback(null);
        }
        var path = (0, _path.join)(stdout.replace(/\n$/, ''), 'jsdoc');

        (0, _fs.stat)(path, function (err) {
          callback(err ? null : path);
        });
      }, args);
    }
  }]);
  return Documentation;
}();