'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSCompiler = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var _babel = require('../config/babel');

var _babel2 = _interopRequireDefault(_babel);

var _Compiler2 = require('./Compiler');

var _path = require('path');

var _fs = require('fs');

var _babelCore = require('babel-core');

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _memoryFs = require('memory-fs');

var _memoryFs2 = _interopRequireDefault(_memoryFs);

var _uglifyJs = require('uglify-js');

var _uglifyJs2 = _interopRequireDefault(_uglifyJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-sync */

/* ignore */
var emptyFn = Function.prototype,
    cache = {},
    fakeFS = new _memoryFs2.default();

/**
 * A JavaScript compiler
 *
 * @class JSCompiler
 * @extends Compiler
 * @param {Object} [options={}] - allows to override the default Babel options
 * @example
 * import {JSCompiler} from 'webcompiler';
 *
 * const compiler = new JSCompiler();
 */

/* ignore */

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
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, JSCompiler);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(JSCompiler).call(this));

    _this.options = (0, _assign2.default)({}, _babel2.default.env[_this.isProduction ? 'production' : 'development'], options);
    _this.processing = 0;
    return _this;
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

  /**
   * The number of files being compiled at the moment
   *
   * @member {number} processing
   * @memberOf JSCompiler
   * @private
   * @instance
   */

  (0, _createClass3.default)(JSCompiler, [{
    key: 'beDir',
    value: function beDir(inPath, outPath, callback) {
      var _this2 = this;

      (0, _fs.readdir)(inPath, function (readdirErr, files) {
        if (readdirErr) {
          return console.error(readdirErr);
        }
        files.forEach(function (file) {
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
      var _this3 = this;

      ++this.processing;
      (0, _babelCore.transformFile)(inPath, this.options, function (transformFileErr, result) {
        if (transformFileErr) {
          return console.error(transformFileErr);
        }
        _this3.fsWrite(outPath, result, callback);
      });
    }

    /**
     * Compiles a JavaScript file for the back end or recursively traverses a directory, looking for the JavaScript files
     * to compile
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
      var _this4 = this;

      (0, _fs.stat)(inPath, function (statErr, stats) {
        if (statErr) {
          return console.error(statErr);
        }
        if (stats.isDirectory()) {
          _this4.beDir(inPath, outPath, callback);
        } else if ('.js' === (0, _path.extname)(inPath)) {
          _this4.beFile(inPath, outPath, callback);
        }
      });
    }

    /**
     * Minifies the compiled code
     *
     * @memberOf JSCompiler
     * @instance
     * @method minify
     * @param  {string}      path     - a path to the file (can be used for the sourceMappingURL comment)
     * @param  {ProgramData} data     - the actual program data to compress
     * @return {ProgramData} processed application code with source maps
     * @example
     * const minifiedData = compiler.minify('/path/to/the/output/file.js', data);
     */

  }, {
    key: 'minify',
    value: function minify(path, data) {
      return _uglifyJs2.default.minify(data.code, {
        fromString: true,
        mangle: false,
        output: { space_colon: false },
        inSourceMap: JSON.parse(data.map),
        outSourceMap: (0, _path.basename)(path) + '.map'
      });
    }

    /**
     * Compiles a JavaScript file or a directory for the back end
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
      var _this5 = this;

      var callback = arguments.length <= 2 || arguments[2] === undefined ? emptyFn : arguments[2];

      if (this.processing) {
        return console.error('Still working...');
      }
      this.beTraverse(inPath, outPath, function () {
        if (! --_this5.processing) {
          _this5.done(inPath, callback);
        }
      });
    }

    /**
     * Compiles, bundles (in production mode also minifies and g-zips) a JavaScript file for the front end
     *
     * @memberOf JSCompiler
     * @instance
     * @method fe
     * @param {string}   inPath                    - the input path
     * @param {string}   outPath                   - the output path
     * @param {Function} [callback=function () {}] - a callback function
     * @return {void}
     * @example
     * compiler.fe('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
     */

  }, {
    key: 'fe',
    value: function fe(inPath, outPath) {
      var _this6 = this;

      var callback = arguments.length <= 2 || arguments[2] === undefined ? emptyFn : arguments[2];

      var compiler = (0, _webpack2.default)({
        cache: cache,
        debug: true,
        devtool: (this.isProduction ? '' : 'eval-') + 'source-map',
        entry: inPath,
        output: { path: (0, _path.dirname)(outPath), filename: (0, _path.basename)(outPath) },
        module: {
          noParse: /browser/,
          loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: (0, _extends3.default)({ cacheDirectory: true }, this.options)
          }]
        }
      });

      if (this.isProduction) {
        compiler.outputFileSystem = fakeFS;
      }
      compiler.run(function (error, stats) {
        if (error) {
          return console.error(error);
        }
        var jsonStats = stats.toJson(),
            errors = jsonStats.errors.concat(jsonStats.warnings);

        if (errors.length) {
          return errors.forEach(function (err) {
            console.error(err);
          });
        }
        if (!_this6.isProduction) {
          return _this6.done(inPath, callback);
        }
        _this6.optimize(inPath, outPath, {
          code: fakeFS.readFileSync(outPath, 'utf8'),
          map: fakeFS.readFileSync(outPath + '.map', 'utf8')
        }, callback);
      });
    }
  }]);
  return JSCompiler;
}(_Compiler2.Compiler);