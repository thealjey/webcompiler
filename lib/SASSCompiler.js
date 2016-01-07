'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SASSCompiler = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _Compiler2 = require('./Compiler');

var _nodeSass = require('node-sass');

var _nodeSassImportOnce = require('node-sass-import-once');

var _nodeSassImportOnce2 = _interopRequireDefault(_nodeSassImportOnce);

var _cleanCss = require('clean-css');

var _cleanCss2 = _interopRequireDefault(_cleanCss);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var precision = 8,
    roundingPrecision = -1,
    sourceMappingURLPattern = /\n*\/\*# sourceMappingURL=\S+ \*\//,
    options = {
  file: null,
  outFile: null,
  importer: _nodeSassImportOnce2.default,
  importOnce: { index: true, css: false, bower: false },
  includePaths: ['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules'],
  precision: precision,
  sourceMap: true,
  sourceMapContents: true
},

/* ignore */
emptyFn = Function.prototype;

/**
 * Invoked on operation success or failure
 *
 * @callback AutoprefixCallback
 * @param {ProgramData} data - the parsed object
 */

/**
 * A SASS compiler
 *
 * @class SASSCompiler
 * @extends Compiler
 * @param {Array<string>} [includePaths=[]]      - an array of additional include paths
 * @param {Object}        [importOnceOptions={}] - an object that lets you override default importOnce resolver
 *                                                 configuration
 * @example
 * import {SASSCompiler} from 'webcompiler';
 *
 * const compiler = new SASSCompiler();
 */

var SASSCompiler = exports.SASSCompiler = function (_Compiler) {
  (0, _inherits3.default)(SASSCompiler, _Compiler);

  /**
   * an array of paths to search for an scss file in if it's not found in cwd
   *
   * @member {Array<string>} includePaths
   * @memberof SASSCompiler
   * @private
   * @instance
   */

  function SASSCompiler() {
    var includePaths = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var importOnceOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    (0, _classCallCheck3.default)(this, SASSCompiler);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SASSCompiler).call(this));

    _this.includePaths = options.includePaths.concat(includePaths);
    _this.importOnce = (0, _assign2.default)({}, options.importOnce, importOnceOptions);
    return _this;
  }

  /**
   * Minifies the compiled code
   *
   * @memberOf SASSCompiler
   * @instance
   * @method minify
   * @param  {string}      path     - a path to the file (can be used for the sourceMappingURL comment)
   * @param  {ProgramData} data     - the actual program data to compress
   * @return {ProgramData} processed application code with source maps or null on error
   * @example
   * const minifiedData = compiler.minify('/path/to/the/output/file.css', data);
   */

  /**
   * importOnce resolver configuration
   *
   * @member {Object} importOnce
   * @memberof SASSCompiler
   * @private
   * @instance
   */

  (0, _createClass3.default)(SASSCompiler, [{
    key: 'minify',
    value: function minify(path, data) {
      var sourceMappingURL = data.code.match(sourceMappingURLPattern),
          minified = new _cleanCss2.default({
        keepSpecialComments: 0,
        roundingPrecision: roundingPrecision,
        sourceMap: data.map,
        sourceMapInlineSources: true
      }).minify(data.code),
          errors = minified.errors.concat(minified.warnings);

      if (errors.length) {
        errors.forEach(function (error) {
          console.error(error);
        });
        return null;
      }
      return { code: '' + minified.styles + (sourceMappingURL ? sourceMappingURL[0] : ''), map: minified.sourceMap };
    }

    /**
     * Auto-prefixes the compiled code
     *
     * @memberOf SASSCompiler
     * @instance
     * @method autoprefix
     * @param {string}             path     - a path to the file
     * @param {ProgramData}        data     - the actual program data to auto-prefix
     * @param {AutoprefixCallback} callback - a callback function
     * @example
     * compiler.autoprefix('/path/to/the/output/file.css', data, function (autoprefixedData) {
     *   // successfully added the vendor prefixes
     * });
     */

  }, {
    key: 'autoprefix',
    value: function autoprefix(path, data, callback) {
      (0, _postcss2.default)([_autoprefixer2.default]).process(data.code, {
        from: path,
        to: path,
        map: { prev: data.map }
      }).then(function (result) {
        var warnings = result.warnings();

        if (warnings.length) {
          return warnings.forEach(function (warning) {
            console.error(warning.toString());
          });
        }
        callback({ code: result.css, map: (0, _stringify2.default)(result.map) });
      });
    }

    /**
     * Compiles, auto-prefixes and optionally minifies and g-zips in the production mode
     *
     * @memberof SASSCompiler
     * @instance
     * @method fe
     * @param {string}   inPath                    - a full system path to the input file
     * @param {string}   outPath                   - a full system path to the output file
     * @param {Function} [callback=function () {}] - a callback function
     * @example
     * compiler.fe('/path/to/the/input/file.scss', '/path/to/the/output/file.css', function () {
     *   // compiled successfully
     * });
     */

  }, {
    key: 'fe',
    value: function fe(inPath, outPath) {
      var _this2 = this;

      var callback = arguments.length <= 2 || arguments[2] === undefined ? emptyFn : arguments[2];

      (0, _nodeSass.render)((0, _assign2.default)({}, options, {
        file: inPath,
        outFile: outPath,
        importOnce: this.importOnce,
        includePaths: this.includePaths
      }), function (error, result) {
        if (error) {
          return console.log('\x1b[41mSASS error\x1b[0m "\x1b[33m%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m', error.message, error.file, error.line, error.column);
        }
        _this2.autoprefix(outPath, { code: result.css, map: result.map.toString() }, function (data) {
          if (_this2.isProduction) {
            return _this2.optimize(inPath, outPath, data, callback);
          }
          _this2.fsWrite(outPath, data, function () {
            _this2.done(inPath, callback);
          });
        });
      });
    }
  }]);
  return SASSCompiler;
}(_Compiler2.Compiler);