'use strict';

exports.__esModule = true;
exports.Compiler = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require('path');

var _fs = require('fs');

var _zlib = require('zlib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-process-env */

var i = 0;

/**
 * The base compiler class
 *
 * @class Compiler
 * @abstract
 * @param {boolean} [compress=true] - if true `Compiler#save` will gzip compress the data in production mode
 */

var Compiler = exports.Compiler = function () {

  /* eslint-disable require-jsdoc */

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

  function Compiler() {
    var compress = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
    (0, _classCallCheck3.default)(this, Compiler);

    /* eslint-enable require-jsdoc */
    this.isProduction = 'production' === process.env.NODE_ENV;
    this.compress = this.isProduction && compress;
  }

  /**
   * Executed when the compilation is complete
   *
   * @memberOf Compiler
   * @static
   * @method done
   * @param {string}   inPath   - the input path
   * @param {Function} callback - a callback function
   * @example
   * Compiler.done('/path/to/an/input/file', callback);
   */


  /**
   * if true `Compiler#save` will gzip compress the data
   *
   * @member {boolean} compress
   * @memberof Compiler
   * @private
   * @instance
   */


  Compiler.done = function done(inPath, callback) {
    console.log('\x1b[32m%s. Compiled %s\x1b[0m', ++i, inPath);
    callback();
  };

  /**
   * Writes the data to disk and then calls `done`.
   *
   * @memberOf Compiler
   * @static
   * @private
   * @method writeAndCallDone
   * @param {string}      inPath   - the input path
   * @param {string}      outPath  - the output path
   * @param {ProgramData} data     - processed application code with source maps
   * @param {Function}    callback - a callback function
   * @example
   * Compiler.writeAndCallDone('/path/to/an/input/file', '/path/to/the/output/file', data, callback);
   */


  Compiler.writeAndCallDone = function writeAndCallDone(inPath, outPath, data, callback) {
    Compiler.fsWrite(outPath, data, function () {
      Compiler.done(inPath, callback);
    });
  };

  /**
   * Writes the data to disk
   *
   * @memberOf Compiler
   * @static
   * @method fsWrite
   * @param {string}      path     - the output path
   * @param {ProgramData} data     - the data to write
   * @param {Function}    callback - a callback function
   * @return {void}
   * @example
   * Compiler.fsWrite('/path/to/an/output/file', data, callback);
   */


  Compiler.fsWrite = function fsWrite(path, data, callback) {
    if (!data.code) {
      return callback();
    }
    Compiler.mkdir(path, function () {
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
  };

  /**
   * Recursively creates a directory containing a file specified by `path`.
   *
   * @memberOf Compiler
   * @static
   * @method mkdir
   * @param {string}   path     - a path to a file
   * @param {Function} callback - a callback function
   * @example
   * Compiler.mkdir('/path/to/a/file', callback);
   */


  Compiler.mkdir = function mkdir(path, callback) {
    (0, _mkdirp2.default)((0, _path.dirname)(path), function (mkdirpErr) {
      if (mkdirpErr) {
        return console.error(mkdirpErr);
      }
      callback();
    });
  };

  /**
   * G-zips the compiled code
   *
   * @memberOf Compiler
   * @static
   * @method gzip
   * @param {ProgramData}         data     - the actual program data to auto-prefix
   * @param {ProgramDataCallback} callback - a callback function
   * @return {void}
   * @example
   * Compiler.gzip(data, callback);
   */


  Compiler.gzip = function gzip(data, callback) {
    if (!data.code) {
      return callback(data);
    }

    /* ignore */
    (0, _zlib.gzip)(data.code, function (err, code) {
      if (err) {
        return console.error(err);
      }
      callback({ code: code, map: data.map });
    });
  };

  /**
   * Reads the data from disk
   *
   * @memberOf Compiler
   * @private
   * @method fsRead
   * @param {string}              path     - the input path
   * @param {ProgramDataCallback} callback - a callback function
   * @example
   * Compiler.fsRead('/path/to/an/output/file', callback);
   */


  Compiler.prototype.fsRead = function fsRead(path, callback) {
    var _this = this;

    (0, _fs.readFile)(path, function (scriptErr, scriptData) {
      if (scriptErr) {
        return callback({ code: '', map: '' });
      }
      (0, _fs.readFile)(path + '.map', 'utf8', function (mapErr, mapData) {
        var map = mapErr ? '' : mapData;

        if (!_this.compress) {
          return callback({ code: scriptData.toString('utf8'), map: map });
        }

        /* ignore */
        (0, _zlib.gunzip)(scriptData, function (zipErr, zipData) {
          callback({ code: zipErr ? '' : zipData.toString('utf8'), map: map });
        });
      });
    });
  };

  /**
   * G-zips the program if necessary and writes the results to disk.
   *
   * Skips the final write if the contents of the file have not changed since the previous write.
   * Which adds a little overhead at compile time, but at the same time does not alter the last modified timestamp of
   * the file unnecessarily.
   *
   * Good news for someone who is using that timestamp for public cache invalidation.
   *
   * @memberOf Compiler
   * @instance
   * @protected
   * @method save
   * @param {string}      inPath   - the input path
   * @param {string}      outPath  - the output path
   * @param {ProgramData} data     - processed application code with source maps
   * @param {Function}    callback - a callback function
   * @example
   * compiler.save('/path/to/an/input/file', '/path/to/the/output/file', data, callback);
   */


  Compiler.prototype.save = function save(inPath, outPath, data, callback) {
    var _this2 = this;

    this.fsRead(outPath, function (oldData) {
      var newData = {
        code: oldData.code === data.code ? '' : data.code,
        map: oldData.map === data.map ? '' : data.map
      };

      if (!_this2.compress) {
        Compiler.writeAndCallDone(inPath, outPath, newData, callback);

        return;
      }
      Compiler.gzip(newData, function (result) {
        Compiler.writeAndCallDone(inPath, outPath, result, callback);
      });
    });
  };

  return Compiler;
}();