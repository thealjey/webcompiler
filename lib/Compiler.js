'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Compiler = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require('path');

var _fs = require('fs');

var _zlib = require('zlib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var i = 0;

/**
 * Processed application code with source maps
 *
 * @typedef {Object} ProgramData
 * @property {string} code - program code
 * @property {string} map  - source map json string
 */

/**
 * The base compiler class
 *
 * @class Compiler
 * @abstract
 */

var Compiler = exports.Compiler = function () {
  function Compiler() {
    (0, _classCallCheck3.default)(this, Compiler);

    this.isProduction = 'production' === process.env.NODE_ENV;
  }

  /**
   * Minifies the compiled code
   *
   * @memberOf Compiler
   * @instance
   * @abstract
   * @method minify
   * @param  {string}      path     - a path to the file (can be used for the sourceMappingURL comment)
   * @param  {ProgramData} data     - the actual program data to compress
   * @return {ProgramData} processed application code with source maps or null on error
   */

  /**
   * True if the NODE_ENV environment variable is equal to `production`.
   *
   * Caution: modifying it's value directly may lead to unexpected results
   *
   * @member {boolean} isProduction
   * @memberof Compiler
   * @readOnly
   * @instance
   */

  (0, _createClass3.default)(Compiler, [{
    key: 'done',

    /**
     * Executed when the compilation is complete
     *
     * @memberOf Compiler
     * @instance
     * @protected
     * @method done
     * @param {string}   inPath   - the input path
     * @param {Function} callback - a callback function
     * @example
     * compiler.done('/path/to/an/input/file', callback);
     */
    value: function done(inPath, callback) {
      console.log('\x1b[32m%s. Compiled %s\x1b[0m', ++i, inPath);
      callback();
    }

    /**
     * Writes the data to disk
     *
     * @memberOf Compiler
     * @instance
     * @protected
     * @method fsWrite
     * @param {string}      path     - the output path
     * @param {ProgramData} data     - the data to write
     * @param {Function}    callback - a callback function
     * @example
     * compiler.fsWrite('/path/to/an/output/file', data, callback);
     */

  }, {
    key: 'fsWrite',
    value: function fsWrite(path, data, callback) {
      (0, _mkdirp2.default)((0, _path.dirname)(path), function (mkdirpErr) {
        if (mkdirpErr) {
          return console.error(mkdirpErr);
        }
        (0, _fs.writeFile)(path, data.code, function (scriptErr) {
          if (scriptErr) {
            return console.error(scriptErr);
          }
          if (!data.map) {
            return callback();
          }
          (0, _fs.writeFile)(path + '.map', data.map, function (mapErr) {
            if (mapErr) {
              return console.error(mapErr);
            }
            callback();
          });
        });
      });
    }

    /**
     * Minifies and g-zips the program
     *
     * @memberOf Compiler
     * @instance
     * @protected
     * @method optimize
     * @param {string}      inPath   - the input path
     * @param {string}      outPath  - the output path
     * @param {ProgramData} data     - processed application code with source maps
     * @param {Function}    callback - a callback function
     * @example
     * compiler.optimize('/path/to/an/input/file', '/path/to/the/output/file', data, callback);
     */

  }, {
    key: 'optimize',
    value: function optimize(inPath, outPath, data, callback) {
      var _this = this;

      var minified = this.minify(outPath, data);

      if (!minified) {
        return;
      }
      (0, _zlib.gzip)(minified.code, function (gzipErr, code) {
        if (gzipErr) {
          return console.error(gzipErr);
        }
        _this.fsWrite(outPath, { code: code, map: minified.map }, function () {
          _this.done(inPath, callback);
        });
      });
    }
  }]);
  return Compiler;
}();