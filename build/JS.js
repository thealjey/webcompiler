'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _NativeProcess = require('./NativeProcess');

var _NativeProcess2 = _interopRequireDefault(_NativeProcess);

var _JSLint = require('./JSLint');

var _JSLint2 = _interopRequireDefault(_JSLint);

var _jsWebCompile = require('./jsWebCompile');

var _jsWebCompile2 = _interopRequireDefault(_jsWebCompile);

var _jsNodeCompileFile = require('./jsNodeCompileFile');

var _jsNodeCompileFile2 = _interopRequireDefault(_jsNodeCompileFile);

var _jsNodeCompileDir = require('./jsNodeCompileDir');

var _jsNodeCompileDir2 = _interopRequireDefault(_jsNodeCompileDir);

var _jsMin = require('./jsMin');

var _jsMin2 = _interopRequireDefault(_jsMin);

var _zlib = require('zlib');

var _fs = require('fs');

var _path = require('path');

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var i = 0;

/**
 * A JavaScript compiler
 *
 * @class
 * @param {Object} [rules] - an object that lets you override default linting rules
 * @example
 * import {JS} from 'webcompiler';
 *
 * var js = new JS();
 */

var JS = (function () {
  function JS() {
    var lintRules = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, JS);

    /**
     * flow static analyzer
     *
     * @memberof JS
     * @private
     * @instance
     * @type {NativeProcess}
     */
    this.flow = new _NativeProcess2['default']('flow');

    /**
     * JavaScript linter
     *
     * @memberof JS
     * @private
     * @instance
     * @type {JSLint}
     */
    this.linter = new _JSLint2['default'](lintRules);
  }

  _createClass(JS, [{
    key: 'validate',

    /**
     * Performs static analysis and linting
     *
     * @memberof JS
     * @instance
     * @method validate
     * @param {string}        inPath    - a full system path to the input file/directory
     * @param {Array<string>} lintPaths - an array of paths to lint
     * @param {Function}      callback  - a callback function, invoked only when successfully validated
     * @example
     * js.validate('/path/to/the/input/file.js', ['/lint/this/directory/too'], function () {
     *   // successfully validated
     * });
     */
    value: function validate(inPath, lintPaths, callback) {
      var _this = this;

      this.flow.run(function (flowErr, stdout) {
        if (flowErr) {
          return console.error(flowErr);
        }

        /*eslint-disable quotes*/
        if ('No errors!\n' !== stdout) {
          return console.error(stdout);
        }

        /*eslint-enable quotes*/
        _this.linter.run(lintPaths.concat([inPath]), function (linterErr) {
          if (linterErr) {
            return linterErr.forEach(function (e) {
              console.log('\u001b[41mESLint error\u001b[0m "\u001b[33m%s%s\u001b[0m" in \u001b[36m%s\u001b[0m on \u001b[35m%s:%s\u001b[0m', e.message, e.ruleId ? ' (' + e.ruleId + ')' : '', e.filePath, e.line, e.column);
            });
          }
          callback();
        });
      });
    }
  }, {
    key: 'webCompile',

    /**
     * Typechecks, lints and compiles a JavaScript file for the browser (development mode - faster recompilation).
     *
     * @memberof JS
     * @private
     * @instance
     * @method webCompile
     * @param {string}        inPath    - a full system path to the input file
     * @param {string}        outPath   - a full system path to the output file
     * @param {Function}      callback  - a callback function, executed after the successful compilation
     * @param {Array<string>} lintPaths - paths to files/directories to lint (the input file is included automatically)
     * @param {boolean}       devMode   - if true provides faster source map rebuilds, good for rapid development
     * @example
     * js.webCompile('/path/to/the/input/file.js', '/path/to/the/output/file.js', function () {
     *   // compiled successfully
     * }, ['/lint/this/directory/too'], true);
     */
    value: function webCompile(inPath, outPath, callback, lintPaths, devMode) {
      this.validate(inPath, lintPaths, function () {
        (0, _jsWebCompile2['default'])(inPath, outPath, function (compileErr) {
          if (compileErr) {
            return compileErr.forEach(function (err) {
              console.error(err);
            });
          }
          console.log('\u001b[32m%s. Compiled %s\u001b[0m', ++i, inPath);
          callback();
        }, devMode);
      });
    }
  }, {
    key: 'feDev',

    /**
     * Typechecks, lints and compiles a JavaScript file for the browser (development mode - faster recompilation).
     *
     * @memberof JS
     * @instance
     * @method feDev
     * @param {string}    inPath    - a full system path to the input file
     * @param {string}    outPath   - a full system path to the output file
     * @param {Function}  callback  - a callback function, executed after the successful compilation
     * @param {...string} lintPaths - paths to files/directories to lint (the input file is included automatically)
     * @example
     * js.feDev('/path/to/the/input/file.js', '/path/to/the/output/file.js', function () {
     *   // compiled successfully
     * }, '/lint/this/directory/too');
     */
    value: function feDev(inPath, outPath, callback) {
      for (var _len = arguments.length, lintPaths = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        lintPaths[_key - 3] = arguments[_key];
      }

      this.webCompile(inPath, outPath, callback, lintPaths, true);
    }
  }, {
    key: 'feProd',

    /**
     * Typechecks, lints, compiles, minifies and GZIPs a JavaScript file for the browser (production mode).
     *
     * @memberof JS
     * @instance
     * @method feProd
     * @param {string}    inPath    - a full system path to the input file
     * @param {string}    outPath   - a full system path to the output file
     * @param {Function}  callback  - a callback function, executed after the successful compilation
     * @param {...string} lintPaths - paths to files/directories to lint (the input file is included automatically)
     * @example
     * js.feProd('/path/to/the/input/file.js', '/path/to/the/output/file.js', function () {
     *   // compiled successfully
     * }, '/lint/this/directory/too');
     */
    value: function feProd(inPath, outPath, callback) {
      for (var _len2 = arguments.length, lintPaths = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
        lintPaths[_key2 - 3] = arguments[_key2];
      }

      this.webCompile(inPath, outPath, function () {
        var minified = (0, _jsMin2['default'])(outPath);

        (0, _zlib.gzip)(minified.code, function (gzipErr, code) {
          if (gzipErr) {
            return console.error(gzipErr);
          }
          (0, _fs.writeFile)(outPath, code, function (scriptErr) {
            if (scriptErr) {
              return console.error(scriptErr);
            }
            (0, _fs.writeFile)(outPath + '.map', minified.map, function (mapErr) {
              if (mapErr) {
                return console.error(mapErr);
              }
              console.log('\u001b[32m%s. Optimized for production %s\u001b[0m', ++i, inPath);
              callback();
            });
          });
        });
      }, lintPaths, false);
    }
  }, {
    key: 'beFile',

    /**
     * Typechecks, lints and compiles a JavaScript file for the NodeJS.
     *
     * @memberof JS
     * @instance
     * @method beFile
     * @param {string}    inPath    - a full system path to the input file
     * @param {string}    outPath   - a full system path to the output file
     * @param {Function}  callback  - a callback function, executed after the successful compilation
     * @param {...string} lintPaths - paths to files/directories to lint (the input file is included automatically)
     * @example
     * js.beFile('/path/to/the/input/file.js', '/path/to/the/output/file.js', function () {
     *   // compiled successfully
     * }, '/lint/this/directory/too');
     */
    value: function beFile(inPath, outPath, callback) {
      for (var _len3 = arguments.length, lintPaths = Array(_len3 > 3 ? _len3 - 3 : 0), _key3 = 3; _key3 < _len3; _key3++) {
        lintPaths[_key3 - 3] = arguments[_key3];
      }

      this.validate(inPath, lintPaths, function () {
        (0, _jsNodeCompileFile2['default'])(inPath, function (compileErr, code) {
          if (compileErr) {
            return console.error(compileErr);
          }
          (0, _mkdirp2['default'])((0, _path.dirname)(outPath), function (mkdirpErr) {
            if (mkdirpErr) {
              return console.error(mkdirpErr);
            }
            (0, _fs.writeFile)(outPath, code, function (scriptErr) {
              if (scriptErr) {
                return console.error(scriptErr);
              }
              console.log('\u001b[32m%s. Compiled %s\u001b[0m', ++i, inPath);
              callback();
            });
          });
        });
      });
    }
  }, {
    key: 'beDir',

    /**
     * Typechecks, lints and compiles all JavaScript files inside the inPath for the NodeJS.
     *
     * @memberof JS
     * @instance
     * @method beDir
     * @param {string}    inPath    - a full system path to the input directory
     * @param {string}    outPath   - a full system path to the output directory
     * @param {Function}  callback  - a callback function, executed after the successful compilation
     * @param {...string} lintPaths - paths to files/directories to lint (the input file is included automatically)
     * @example
     * js.beDir('/path/to/the/input/directory', '/path/to/the/output/directory', function () {
     *   // compiled successfully
     * }, '/lint/this/directory/too');
     */
    value: function beDir(inPath, outPath, callback) {
      for (var _len4 = arguments.length, lintPaths = Array(_len4 > 3 ? _len4 - 3 : 0), _key4 = 3; _key4 < _len4; _key4++) {
        lintPaths[_key4 - 3] = arguments[_key4];
      }

      this.validate(inPath, lintPaths, function () {
        (0, _jsNodeCompileDir2['default'])(inPath, outPath, function (compileErr) {
          if (compileErr) {
            return console.error(compileErr);
          }
          console.log('\u001b[32m%s. Compiled %s\u001b[0m', ++i, inPath);
          callback();
        });
      });
    }
  }]);

  return JS;
})();

exports['default'] = JS;
module.exports = exports['default'];