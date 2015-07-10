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

var _zlib2 = _interopRequireDefault(_zlib);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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

  _createClass(SASS, [{
    key: 'validate',

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
    value: function validate(inPath, lintPaths, callback) {
      this.linter.run(lintPaths.concat([inPath]), function (linterErr) {
        if (linterErr) {
          return console.error(linterErr);
        }
        callback();
      });
    }
  }, {
    key: 'fe',

    /**
     * Lints, compiles, adds browser vendor prefixes, minifies and GZIPs an SCSS file for the browser.
     *
     * @memberof SASS
     * @instance
     * @method fe
     * @param {string}    inPath    - a full system path to the input file
     * @param {string}    outPath   - a full system path to the output file
     * @param {Function}  callback  - a callback function, executed after the successful compilation
     * @param {...string} lintPaths - paths to files/directories to lint (the input file is included automatically)
     * @example
     * sass.fe('/path/to/the/input/file.scss', '/path/to/the/output/file.css', function () {
     *   // compiled successfully
     * }, '/lint/this/directory/too');
     */
    value: function fe(inPath, outPath, callback) {
      var _this = this;

      for (var _len = arguments.length, lintPaths = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        lintPaths[_key - 3] = arguments[_key];
      }

      this.validate(inPath, lintPaths, function () {
        _this.compiler.run(inPath, outPath, function (compileErr, result) {
          if (compileErr) {
            return console.log('\u001b[41mSASS error\u001b[0m "\u001b[33m%s\u001b[0m" in \u001b[36m%s\u001b[0m on \u001b[35m%s:%s\u001b[0m', compileErr.message, compileErr.file, compileErr.line, compileErr.column);
          }
          (0, _cssAutoprefix2['default'])(result, outPath, function (prefixErr, prefixed) {

            /* @noflow */
            var minified;

            if (prefixErr) {
              return prefixErr.forEach(function (err) {
                console.error(err);
              });
            }
            minified = (0, _cssMin2['default'])(prefixed);
            _zlib2['default'].gzip(minified.code, function (gzipErr, code) {
              if (gzipErr) {
                return console.error(gzipErr);
              }
              (0, _mkdirp2['default'])(_path2['default'].dirname(outPath), function (mkdirpErr) {
                if (mkdirpErr) {
                  return console.error(mkdirpErr);
                }
                _fs2['default'].writeFile(outPath, code, function (styleErr) {
                  if (styleErr) {
                    return console.error(styleErr);
                  }
                  _fs2['default'].writeFile(outPath + '.map', minified.map, function (mapErr) {
                    if (mapErr) {
                      return console.error(mapErr);
                    }
                    console.log('\u001b[32m%s. Compiled %s\u001b[0m', ++i, inPath);
                    callback();
                  });
                });
              });
            });
          });
        });
      });
    }
  }]);

  return SASS;
})();

exports['default'] = SASS;
module.exports = exports['default'];