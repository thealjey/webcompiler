'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSCompiler = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Compiler2 = require('./Compiler');

var _path = require('path');

var _fs = require('fs');

var _babelCore = require('babel-core');

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _memoryFs = require('memory-fs');

var _memoryFs2 = _interopRequireDefault(_memoryFs);

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _assignWith = require('lodash/assignWith');

var _assignWith2 = _interopRequireDefault(_assignWith);

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _uniq = require('lodash/uniq');

var _uniq2 = _interopRequireDefault(_uniq);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-sync */

var config = JSON.parse((0, _fs.readFileSync)((0, _path.join)(__dirname, '..', '.babelrc'), 'utf8'));
var cache = {};
var fakeFS = new _memoryFs2.default();
var _webpack$optimize = _webpack2.default.optimize;
var DedupePlugin = _webpack$optimize.DedupePlugin;
var UglifyJsPlugin = _webpack$optimize.UglifyJsPlugin;
var productionPlugins = [new DedupePlugin(), new UglifyJsPlugin()];

/**
 * A JavaScript compiler
 *
 * @class JSCompiler
 * @extends Compiler
 * @param {boolean} [compress=true] - if true `Compiler#optimize` will gzip compress the data
 * @param {Object}  [options={}]    - allows to override the default Babel options
 * @example
 * import {JSCompiler} from 'webcompiler';
 *
 * const compiler = new JSCompiler();
 */

var JSCompiler = exports.JSCompiler = function (_Compiler) {
  (0, _inherits3.default)(JSCompiler, _Compiler);

  /**
   * Babel options
   *
   * @member {Object} options
   * @memberOf JSCompiler
   * @private
   * @instance
   */

  function JSCompiler() {
    var compress = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    (0, _classCallCheck3.default)(this, JSCompiler);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(JSCompiler).call(this, compress));

    _this.configure(options);
    _this.processing = 0;
    return _this;
  }

  /**
   * Merges Babel configuration options
   *
   * @memberOf JSCompiler
   * @instance
   * @private
   * @method configure
   * @param {Object} options - allows to override the default Babel options
   * @example
   * compiler.configure(options);
   */


  /**
   * The number of files being compiled at the moment
   *
   * @member {number} processing
   * @memberOf JSCompiler
   * @private
   * @instance
   */


  (0, _createClass3.default)(JSCompiler, [{
    key: 'configure',
    value: function configure(options) {
      this.options = (0, _assignWith2.default)({}, config, (0, _get2.default)(config, ['env', process.env.NODE_ENV || 'development']), options, function (objValue, srcValue) {
        if (!(0, _isArray2.default)(srcValue)) {
          return srcValue;
        }
        if (!(0, _isArray2.default)(objValue)) {
          return (0, _uniq2.default)(srcValue);
        }
        return (0, _uniq2.default)(srcValue.concat(objValue));
      });
      delete this.options.env;
    }

    /**
     * Compiles a directory of files for the back end
     *
     * @memberOf JSCompiler
     * @instance
     * @private
     * @method beDir
     * @param {string}   inPath   - the input path
     * @param {string}   outPath  - the output path
     * @param {Function} callback - a callback function
     * @example
     * compiler.beDir('/path/to/an/input/directory', '/path/to/the/output/directory', callback);
     */

  }, {
    key: 'beDir',
    value: function beDir(inPath, outPath, callback) {
      var _this2 = this;

      (0, _fs.readdir)(inPath, function (readdirErr, files) {
        if (readdirErr) {
          return console.error(readdirErr);
        }
        (0, _forEach2.default)(files, function (file) {
          _this2.beTraverse((0, _path.join)(inPath, file), (0, _path.join)(outPath, file), callback);
        });
      });
    }

    /**
     * Compiles a JavaScript file for the back end
     *
     * @memberOf JSCompiler
     * @instance
     * @private
     * @method beFile
     * @param {string}   inPath   - the input path
     * @param {string}   outPath  - the output path
     * @param {Function} callback - a callback function
     * @example
     * compiler.beFile('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
     */

  }, {
    key: 'beFile',
    value: function beFile(inPath, outPath, callback) {
      ++this.processing;
      (0, _babelCore.transformFile)(inPath, this.options, function (transformFileErr, result) {
        if (transformFileErr) {
          return console.error(transformFileErr);
        }
        _Compiler2.Compiler.fsWrite(outPath, result, callback);
      });
    }

    /**
     * Copies a file
     *
     * @memberOf JSCompiler
     * @instance
     * @private
     * @method copyFile
     * @param {string}   inPath   - the input path
     * @param {string}   outPath  - the output path
     * @param {Function} callback - a callback function
     * @example
     * compiler.copyFile('/path/to/an/input/file', '/path/to/the/output/file', callback);
     */

  }, {
    key: 'copyFile',
    value: function copyFile(inPath, outPath, callback) {
      ++this.processing;
      _Compiler2.Compiler.mkdir(outPath, function () {
        (0, _fs.createReadStream)(inPath).pipe((0, _fs.createWriteStream)(outPath));
        callback();
      });
    }

    /**
     * Compiles a JavaScript file for the back end or recursively traverses a directory, looking for the JavaScript files
     * to compile. Non-JavaScript files are simply copied over.
     *
     * @memberOf JSCompiler
     * @instance
     * @private
     * @method beTraverse
     * @param {string}   inPath   - the input path
     * @param {string}   outPath  - the output path
     * @param {Function} callback - a callback function
     * @example
     * compiler.beTraverse('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
     */

  }, {
    key: 'beTraverse',
    value: function beTraverse(inPath, outPath, callback) {
      var _this3 = this;

      (0, _fs.stat)(inPath, function (statErr, stats) {
        if (statErr) {
          return console.error(statErr);
        }
        if (stats.isDirectory()) {
          _this3.beDir(inPath, outPath, callback);
        } else if ('.js' === (0, _path.extname)(inPath)) {
          _this3.beFile(inPath, outPath, callback);
        } else {
          _this3.copyFile(inPath, outPath, callback);
        }
      });
    }

    /**
     * Compiles a JavaScript file or a directory for the back end. Non-JavaScript files are simply copied over.
     *
     * @memberOf JSCompiler
     * @instance
     * @method be
     * @param {string}   inPath                    - the input path
     * @param {string}   outPath                   - the output path
     * @param {Function} [callback=function () {}] - a callback function
     * @return {void}
     * @example
     * compiler.be('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
     */

  }, {
    key: 'be',
    value: function be(inPath, outPath) {
      var _this4 = this;

      var callback = arguments.length <= 2 || arguments[2] === undefined ? _noop2.default : arguments[2];

      if (this.processing) {
        return console.error('Still working...');
      }
      this.beTraverse(inPath, outPath, function () {
        if (! --_this4.processing) {
          _Compiler2.Compiler.done(inPath, callback);
        }
      });
    }

    /**
     * Compiles, bundles (in production mode also minifies and g-zips) a JavaScript file for the front end.
     *
     * @memberOf JSCompiler
     * @instance
     * @method fe
     * @param {string}   inPath                    - the input path
     * @param {string}   outPath                   - the output path
     * @param {Function} [callback=function () {}] - a callback function
     * @example
     * compiler.fe('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
     */

  }, {
    key: 'fe',
    value: function fe(inPath, outPath) {
      var _this5 = this;

      var callback = arguments.length <= 2 || arguments[2] === undefined ? _noop2.default : arguments[2];

      var compiler = (0, _webpack2.default)({
        cache: cache,
        debug: true,
        devtool: 'source-map',
        entry: inPath,
        output: { path: (0, _path.dirname)(outPath), filename: (0, _path.basename)(outPath) },
        plugins: this.isProduction ? productionPlugins : [],
        module: {
          loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: (0, _extends3.default)({ cacheDirectory: true }, this.options)
          }, {
            test: /\.json$/,
            loader: 'json'
          }]
        }
      });

      compiler.outputFileSystem = fakeFS;

      compiler.run(function (err, stats) {
        if (err) {
          return console.error(err);
        }

        var _stats$toJson = stats.toJson();

        var warnings = _stats$toJson.warnings;
        var errors = _stats$toJson.errors;


        (0, _forEach2.default)(warnings, function (warning) {
          console.log('\x1b[33m%s\x1b[0m', warning);
        });
        if (errors.length) {
          return (0, _forEach2.default)(errors, function (error) {
            console.error(error);
          });
        }
        _this5.optimize(inPath, outPath, {
          code: fakeFS.readFileSync(outPath, 'utf8'),
          map: fakeFS.readFileSync(outPath + '.map', 'utf8')
        }, callback);
      });
    }
  }]);
  return JSCompiler;
}(_Compiler2.Compiler);