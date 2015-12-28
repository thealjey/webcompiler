'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Documentation = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _NativeProcess = require('./NativeProcess');

var _fs = require('fs');

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var npm = new _NativeProcess.NativeProcess('npm'),
    defaultConfig = (0, _path.join)(__dirname, '..', 'config', 'jsdoc.json'),
    cwd = process.cwd(),

/* ignore */
emptyFn = Function.prototype;

/**
 * Processed application code with source maps
 *
 * @typedef {Object} DocumentationConfig
 * @property {string} [inputDir="src"]     - the input application code directory
 * @property {string} [outputDir="docs"]   - the output directory for the generated documentation
 * @property {string} [readMe="README.md"] - the documentation "homepage" (README.md file)
 * @property {string} [template="node_modules/ink-docstrap/template"]  - a full system path to a valid JSDoc3 template
 *                                                                       directory
 * @property {string} [jsdocConfig="<package root>/config/jsdoc.json"] - a full system path to a JSDoc3 configuration
 *                                                                       file
 */

/**
 * Invoked on operation success or failure
 *
 * @callback FindExecutableCallback
 * @param {string} file - a full system path to a file
 */

/**
 * Invoked on operation success or failure
 *
 * @callback CheckBinCallback
 * @param {string} [file] - a full system path to a file
 */

/**
 * Generates API documentation
 *
 * @class Documentation
 * @param {DocumentationConfig} [config={}] - a configuration object
 * @example
 * import {Documentation} from 'webcompiler';
 *
 * const docs = new Documentation();
 */

var Documentation = exports.Documentation = (function () {

  /**
   * a full system path to a valid JSDoc3 template directory
   *
   * @member {string} template
   * @memberof Documentation
   * @private
   * @instance
   */

  /**
   * the output directory for the generated documentation
   *
   * @member {string} outputDir
   * @memberof Documentation
   * @private
   * @instance
   */

  /**
   * JSDoc3
   *
   * @member {NativeProcess} jsdoc
   * @memberof Documentation
   * @private
   * @instance
   */

  function Documentation() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var inputDir = _ref.inputDir;
    var outputDir = _ref.outputDir;
    var readMe = _ref.readMe;
    var template = _ref.template;
    var jsdocConfig = _ref.jsdocConfig;
    (0, _classCallCheck3.default)(this, Documentation);

    this.inputDir = inputDir || (0, _path.join)(cwd, 'src');
    this.outputDir = outputDir || (0, _path.join)(cwd, 'docs');
    this.readMe = readMe || (0, _path.join)(cwd, 'README.md');
    this.template = template || (0, _path.join)(cwd, 'node_modules', 'ink-docstrap', 'template');
    this.jsdocConfig = jsdocConfig || defaultConfig;
  }

  /**
   * Generate the documentation
   *
   * @memberof Documentation
   * @instance
   * @method run
   * @param {Function} [callback=function () {}] - a callback function
   * @return {void}
   * @example
   * docs.run(function () {
   *   // generated the API documentation
   * });
   */

  /**
   * a full system path to a JSDoc3 configuration file
   *
   * @member {string} jsdocConfig
   * @memberof Documentation
   * @private
   * @instance
   */

  /**
   * the documentation "homepage" (README.md file)
   *
   * @member {string} readMe
   * @memberof Documentation
   * @private
   * @instance
   */

  /**
   * the input application code directory
   *
   * @member {string} inputDir
   * @memberof Documentation
   * @private
   * @instance
   */

  (0, _createClass3.default)(Documentation, [{
    key: 'run',
    value: function run() {
      var _this = this;

      var callback = arguments.length <= 0 || arguments[0] === undefined ? emptyFn : arguments[0];

      if (this.jsdoc) {
        return this.doRun(this.jsdoc, callback);
      }
      this.findExecutable(function (file) {
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
     * docs.doRun(jsdoc, function () {
     *   // generated the API documentation
     * });
     */

  }, {
    key: 'doRun',
    value: function doRun(jsdoc, callback) {
      jsdoc.run(function (stderr) {
        if (stderr) {
          return console.error(stderr);
        }
        callback();
      }, [this.inputDir, '-d', this.outputDir, '-R', this.readMe, '-c', this.jsdocConfig, '-t', this.template]);
    }

    /**
     * Finds a path to the JSDoc3 executable
     *
     * @memberof Documentation
     * @instance
     * @private
     * @method findExecutable
     * @param {FindExecutableCallback} callback - a callback function
     * @example
     * docs.findExecutable((file: string) => {
     *   // the jsdoc file is found
     * });
     */

  }, {
    key: 'findExecutable',
    value: function findExecutable(callback) {
      var _this2 = this;

      this.checkBin(function (localFile) {
        if (localFile) {
          return callback(localFile);
        }
        _this2.checkBin(function (globalFile) {
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
     * @instance
     * @private
     * @method checkBin
     * @param {CheckBinCallback} callback        - a callback function
     * @param {globalPackage}    [boolean=false] - if true checks the global NPM bin directory (contains the npm
     *                                             executable itself)
     * @example
     * docs.checkBin((file: ?string) => {
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
})();