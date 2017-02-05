'use strict';

exports.__esModule = true;
exports.Compiler = undefined;

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require('path');

var _fs = require('fs');

var _zlib = require('zlib');

var _logger = require('./logger');

var _webpack = require('./webpack');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-process-env */

const { green } = _logger.consoleStyles;

let i = 0;

/**
 * The base compiler class
 *
 * @class Compiler
 * @abstract
 * @param {boolean} [compress=true] - if true `Compiler#save` will gzip compress the data in production mode
 */
class Compiler {

  /* eslint-disable require-jsdoc */
  constructor(compress = true) {
    /* eslint-enable require-jsdoc */
    this.compress = _webpack.isProduction && compress;
  }

  /**
   * Executed when the compilation is complete
   *
   * @memberOf Compiler
   * @static
   * @method done
   * @param {string}   inPath   - the input path
   * @param {Function} callback - a callback function
   */


  /**
   * if true `Compiler#save` will gzip compress the data
   *
   * @member {boolean} compress
   * @memberof Compiler
   * @private
   * @instance
   */
  static done(inPath, callback) {
    (0, _logger.log)(green(++i, '. Compiled ', inPath));
    callback();
  }

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
   */
  static writeAndCallDone(inPath, outPath, data, callback) {
    Compiler.fsWrite(outPath, data, () => {
      Compiler.done(inPath, callback);
    });
  }

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
   */
  static fsWrite(path, data, callback) {
    if (!data.code) {
      return callback();
    }
    Compiler.mkdir(path, () => {
      (0, _fs.writeFile)(path, data.code, scriptErr => {
        if (scriptErr) {
          return (0, _logger.logError)(scriptErr);
        }
        if (!data.map) {
          return callback();
        }
        (0, _fs.writeFile)(`${path}.map`, data.map, mapErr => {
          if (mapErr) {
            return (0, _logger.logError)(mapErr);
          }
          callback();
        });
      });
    });
  }

  /**
   * Recursively creates a directory containing a file specified by `path`.
   *
   * @memberOf Compiler
   * @static
   * @method mkdir
   * @param {string}   path     - a path to a file
   * @param {Function} callback - a callback function
   */
  static mkdir(path, callback) {
    (0, _mkdirp2.default)((0, _path.dirname)(path), mkdirpErr => {
      if (mkdirpErr) {
        return (0, _logger.logError)(mkdirpErr);
      }
      callback();
    });
  }

  /**
   * G-zips the compiled code
   *
   * @memberOf Compiler
   * @static
   * @method gzip
   * @param {ProgramData}         data     - the actual program data to gzip
   * @param {ProgramDataCallback} callback - a callback function
   * @return {void}
   */
  static gzip(data, callback) {
    if (!data.code) {
      return callback(data);
    }

    (0, _zlib.gzip)(data.code, (err, code) => {
      if (err) {
        return (0, _logger.logError)(err);
      }
      callback({ code, map: data.map });
    });
  }

  /**
   * Reads the data from disk
   *
   * @memberOf Compiler
   * @private
   * @method fsRead
   * @param {string}              path     - the input path
   * @param {ProgramDataCallback} callback - a callback function
   */
  fsRead(path, callback) {
    (0, _fs.readFile)(path, (scriptErr, scriptData) => {
      if (scriptErr) {
        return callback({ code: '', map: '' });
      }
      (0, _fs.readFile)(`${path}.map`, 'utf8', (mapErr, mapData) => {
        const map = mapErr ? '' : mapData;

        if (!this.compress) {
          return callback({ code: scriptData.toString('utf8'), map });
        }

        (0, _zlib.gunzip)(scriptData, (zipErr, zipData) => {
          callback({ code: zipErr ? '' : zipData.toString('utf8'), map });
        });
      });
    });
  }

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
   */
  save(inPath, outPath, data, callback) {
    this.fsRead(outPath, oldData => {
      const newData = {
        code: oldData.code === data.code ? '' : data.code,
        map: oldData.map === data.map ? '' : data.map
      };

      if (!this.compress) {
        Compiler.writeAndCallDone(inPath, outPath, newData, callback);

        return;
      }
      Compiler.gzip(newData, result => {
        Compiler.writeAndCallDone(inPath, outPath, result, callback);
      });
    });
  }

}
exports.Compiler = Compiler;