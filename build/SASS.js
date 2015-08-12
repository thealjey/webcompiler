'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _bind = Function.prototype.bind;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _SASSLint = require('./SASSLint');

var _SASSLint2 = _interopRequireDefault(_SASSLint);

var _SASSCompile = require('./SASSCompile');

var _SASSCompile2 = _interopRequireDefault(_SASSCompile);

var _cssAutoprefix = require('./cssAutoprefix');

var _cssAutoprefix2 = _interopRequireDefault(_cssAutoprefix);

var _cssMin = require('./cssMin');

var _cssMin2 = _interopRequireDefault(_cssMin);

var _zlib = require('zlib');

var _fs = require('fs');

var _path = require('path');

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var i = 0;

/**
 * A SASS compiler
 *
 * @class
 * @param {Array<string>} [excludeLinter]     - names of linters to exclude
 * @param {Object}        [importOnceOptions] - an object that lets you override default importOnce resolver
 *                                              configuration
 * @param {Array<string>} [includePaths]      - an array of additional include paths
 * @example
 * import {SASS} from 'webcompiler';
 *
 * var sass = new SASS();
 */

var SASS = (function () {
  function SASS() {
    var excludeLinter = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var importOnceOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var includePaths = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    _classCallCheck(this, SASS);

    /**
     * SCSS linter
     *
     * @memberof SASS
     * @private
     * @instance
     * @type {SASSLint}
     */
    this.linter = new (_bind.apply(_SASSLint2['default'], [null].concat(_toConsumableArray(excludeLinter))))();

    /**
     * SCSS compiler
     *
     * @memberof SASS
     * @private
     * @instance
     * @type {SASSCompile}
     */
    this.compiler = new _SASSCompile2['default'](importOnceOptions, includePaths);
  }

  /**
   * Performs linting
   *
   * @memberof SASS
   * @instance
   * @method validate
   * @param {string}        inPath    - a full system path to the input file/directory
   * @param {Array<string>} lintPaths - an array of paths to lint
   * @param {Function}      callback  - a callback function, invoked only when successfully validated
   * @example
   * sass.validate('/path/to/the/input/file.scss', ['/lint/this/directory/too'], function () {
   *   // successfully validated
   * });
   */

  _createClass(SASS, [{
    key: 'validate',
    value: function validate(inPath, lintPaths, callback) {
      this.linter.run(lintPaths.concat([inPath]), function (linterErr) {
        if (linterErr) {
          return console.error(linterErr);
        }
        callback();
      });
    }

    /**
     * Compiles and auto-prefixes an SCSS file for the browser.
     *
     * @memberof SASS
     * @private
     * @instance
     * @method webCompile
     * @param {string}   inPath   - a full system path to the input file
     * @param {string}   outPath  - a full system path to the output file
     * @param {Function} callback - a callback function, executed after the successful compilation
     * @example
     * sass.webCompile('/path/to/the/input/file.scss', '/path/to/the/output/file.css', function (result) {
     *   // result -> {code: string, map: string}
     * });
     */
  }, {
    key: 'webCompile',
    value: function webCompile(inPath, outPath, callback) {
      this.compiler.run(inPath, outPath, function (compileErr, result) {
        if (compileErr) {
          return console.log('\x1b[41mSASS error\x1b[0m "\x1b[33m%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m', compileErr.message, compileErr.file, compileErr.line, compileErr.column);
        }
        (0, _cssAutoprefix2['default'])(result, outPath, function (prefixErr, prefixed) {
          if (!prefixErr) {
            return callback(prefixed);
          }
          prefixErr.forEach(function (err) {
            console.error(err);
          });
          console.log('CSS auto-prefix errors: %s', prefixErr.length);
        });
      });
    }

    /**
     * Writes files to disk.
     *
     * @memberof SASS
     * @private
     * @instance
     * @method fsWrite
     * @param {string}                      inPath   - a full system path to the input file
     * @param {string}                      outPath  - a full system path to the output file
     * @param {{code: string, map: string}} data     - an object with a code and a map strings
     * @param {Function}                    callback - a callback function, executed after the write operation
     * @example
     * sass.fsWrite('/path/to/the/input/file.scss', '/path/to/the/output/file.css', data, function () {
     *   // file system write was successful
     * });
     */
  }, {
    key: 'fsWrite',
    value: function fsWrite(inPath, outPath, data, callback) {
      (0, _mkdirp2['default'])((0, _path.dirname)(outPath), function (mkdirpErr) {
        if (mkdirpErr) {
          return console.error(mkdirpErr);
        }
        (0, _fs.writeFile)(outPath, data.code, function (styleErr) {
          if (styleErr) {
            return console.error(styleErr);
          }
          (0, _fs.writeFile)(outPath + '.map', data.map, function (mapErr) {
            if (mapErr) {
              return console.error(mapErr);
            }
            console.log('\x1b[32m%s. Compiled %s\x1b[0m', ++i, inPath);
            callback();
          });
        });
      });
    }

    /**
     * Compiles and auto-prefixes an SCSS file for the browser (development mode - faster recompilation).
     *
     * @memberof SASS
     * @instance
     * @method feDev
     * @param {string}   inPath   - a full system path to the input file
     * @param {string}   outPath  - a full system path to the output file
     * @param {Function} callback - a callback function, executed after the successful compilation
     * @example
     * sass.feDev('/path/to/the/input/file.scss', '/path/to/the/output/file.css', function () {
     *   // compiled successfully
     * });
     */
  }, {
    key: 'feDev',
    value: function feDev(inPath, outPath, callback) {
      var _this = this;

      this.webCompile(inPath, outPath, function (result) {
        _this.fsWrite(inPath, outPath, result, callback);
      });
    }

    /**
     * Lints, compiles, auto-prefixes, minifies and GZIPs an SCSS file for the browser (production mode).
     *
     * @memberof SASS
     * @instance
     * @method feProd
     * @param {string}    inPath    - a full system path to the input file
     * @param {string}    outPath   - a full system path to the output file
     * @param {Function}  callback  - a callback function, executed after the successful compilation
     * @param {...string} lintPaths - paths to files/directories to lint (the input file is included automatically)
     * @example
     * sass.feProd('/path/to/the/input/file.scss', '/path/to/the/output/file.css', function () {
     *   // compiled successfully
     * }, '/lint/this/directory/too');
     */
  }, {
    key: 'feProd',
    value: function feProd(inPath, outPath, callback) {
      var _this2 = this;

      for (var _len = arguments.length, lintPaths = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        lintPaths[_key - 3] = arguments[_key];
      }

      this.validate(inPath, lintPaths, function () {
        _this2.webCompile(inPath, outPath, function (result) {
          var minified = (0, _cssMin2['default'])(result);

          (0, _zlib.gzip)(minified.code, function (gzipErr, code) {
            if (gzipErr) {
              return console.error(gzipErr);
            }
            _this2.fsWrite(inPath, outPath, { code: code, map: minified.map }, callback);
          });
        });
      });
    }
  }]);

  return SASS;
})();

exports['default'] = SASS;
module.exports = exports['default'];