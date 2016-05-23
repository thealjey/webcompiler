'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SASSCompiler = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _nodeSass = require('node-sass');

var _nodeSassImportOnce = require('node-sass-import-once');

var _nodeSassImportOnce2 = _interopRequireDefault(_nodeSassImportOnce);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var precision = 8,
    importOnceDefaults = { index: true, css: false, bower: false },
    defaultIncludePaths = ['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules'];

/**
 * A SASS compiler
 *
 * @class SASSCompiler
 * @extends Compiler
 * @param {boolean}       [compress=true]        - if true `Compiler#optimize` will gzip compress the data
 * @param {Array<string>} [includePaths=[]]      - an array of additional include paths
 * @param {Object}        [importOnceOptions={}] - an object that lets you override default importOnce resolver
 *                                                 configuration
 * @example
 * import {SASSCompiler} from 'webcompiler';
 * // or - import {SASSCompiler} from 'webcompiler/lib/SASSCompiler';
 * // or - var SASSCompiler = require('webcompiler').SASSCompiler;
 * // or - var SASSCompiler = require('webcompiler/lib/SASSCompiler').SASSCompiler;
 *
 * const compiler = new SASSCompiler();
 */

var SASSCompiler = exports.SASSCompiler = function (_Compiler) {
  (0, _inherits3.default)(SASSCompiler, _Compiler);


  /* eslint-disable require-jsdoc */

  /**
   * an array of paths to search for an scss file in if it's not found in cwd
   *
   * @member {Array<string>} includePaths
   * @memberof SASSCompiler
   * @private
   * @instance
   */

  function SASSCompiler() {
    var compress = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
    var includePaths = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var importOnceOptions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    (0, _classCallCheck3.default)(this, SASSCompiler);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SASSCompiler).call(this, compress));
    /* eslint-enable require-jsdoc */


    _this.includePaths = defaultIncludePaths.concat(includePaths);
    _this.importOnce = (0, _extends3.default)({}, importOnceDefaults, importOnceOptions);
    return _this;
  }

  /**
   * Auto-prefixes the compiled code
   *
   * @memberOf SASSCompiler
   * @static
   * @method autoprefix
   * @param {string}             path     - a path to the file
   * @param {ProgramData}        data     - the actual program data to auto-prefix
   * @param {ProgramDataCallback} callback - a callback function
   * @example
   * SASSCompiler.autoprefix('/path/to/the/output/file.css', data, result => {
   *   // successfully added the vendor prefixes
   * });
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
    key: 'fe',


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
     * compiler.fe('/path/to/the/input/file.scss', '/path/to/the/output/file.css', () => {
     *   // compiled successfully
     * });
     */
    value: function fe(inPath, outPath) {
      var _this2 = this;

      var callback = arguments.length <= 2 || arguments[2] === undefined ? _noop2.default : arguments[2];

      (0, _nodeSass.render)({
        file: inPath,
        outFile: outPath,
        importer: _nodeSassImportOnce2.default,
        precision: precision,
        importOnce: this.importOnce,
        includePaths: this.includePaths,
        sourceMap: true,
        sourceMapContents: true,
        outputStyle: this.isProduction ? 'compressed' : 'nested'
      }, function (error, result) {
        if (error) {
          return console.log('\x1b[41mSASS error\x1b[0m "\x1b[33m%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m', error.message, error.file, error.line, error.column);
        }
        SASSCompiler.autoprefix(outPath, { code: result.css, map: result.map.toString() }, function (data) {
          _this2.optimize(inPath, outPath, data, callback);
        });
      });
    }
  }], [{
    key: 'autoprefix',
    value: function autoprefix(path, data, callback) {
      (0, _postcss2.default)([_autoprefixer2.default]).process(data.code, {
        from: path,
        to: path,
        map: { prev: data.map }
      }).then(function (result) {
        var warnings = result.warnings();

        if (warnings.length) {
          (0, _forEach2.default)(warnings, function (warning) {
            console.error(warning.toString());
          });

          return;
        }
        callback({ code: result.css, map: (0, _stringify2.default)(result.map) });
      });
    }
  }]);
  return SASSCompiler;
}(_Compiler2.Compiler);