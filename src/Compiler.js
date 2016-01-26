/* @flow */

import mkdirp from 'mkdirp';
import {dirname} from 'path';
import {writeFile} from 'fs';
import {gzip} from 'zlib';

let i = 0;

/**
 * Processed application code with source maps
 *
 * @typedef {Object} ProgramData
 * @property {string} code - program code
 * @property {string} map  - source map json string
 */
export type ProgramData = {code: string, map: string};

/**
 * Invoked when the data was successfully g-zipped
 *
 * @callback GzipCallback
 * @param {ProgramData} data - the program data
 */
type GzipCallback = (data: ProgramData) => void;

/**
 * The base compiler class
 *
 * @class Compiler
 * @abstract
 * @param {boolean} [compress=true] - if true `Compiler#optimize` will gzip compress the data in production mode
 */
export class Compiler {
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
  isProduction: boolean;

  /**
   * if true `Compiler#optimize` will gzip compress the data
   *
   * @member {boolean} compress
   * @memberof Compiler
   * @private
   * @instance
   */
  compress: boolean;

  constructor(compress: boolean = true) {
    this.isProduction = 'production' === process.env.NODE_ENV;
    this.compress = this.isProduction && compress;
  }

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
  done(inPath: string, callback: () => void) {
    console.log('\x1b[32m%s. Compiled %s\x1b[0m', ++i, inPath);
    callback();
  }

  /**
   * Writes the data to disk and then calls `done`.
   *
   * @memberOf Compiler
   * @instance
   * @private
   * @method writeAndCallDone
   * @param {string}      inPath   - the input path
   * @param {string}      outPath  - the output path
   * @param {ProgramData} data     - processed application code with source maps
   * @param {Function}    callback - a callback function
   * @example
   * compiler.writeAndCallDone('/path/to/an/input/file', '/path/to/the/output/file', data, callback);
   */
  writeAndCallDone(inPath: string, outPath: string, data: ProgramData, callback: () => void) {
    this.fsWrite(outPath, data, () => {
      this.done(inPath, callback);
    });
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
  fsWrite(path: string, data: ProgramData, callback: () => void) {
    this.mkdir(path, () => {
      writeFile(path, data.code, scriptErr => {
        if (scriptErr) {
          return console.error(scriptErr);
        }
        if (!data.map) {
          return callback();
        }
        writeFile(`${path}.map`, data.map, mapErr => {
          if (mapErr) {
            return console.error(mapErr);
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
   * @instance
   * @protected
   * @method mkdir
   * @param {string}   path     - a path to a file
   * @param {Function} callback - a callback function
   * @example
   * compiler.mkdir('/path/to/a/file', callback);
   */
  mkdir(path: string, callback: () => void) {
    mkdirp(dirname(path), mkdirpErr => {
      if (mkdirpErr) {
        return console.error(mkdirpErr);
      }
      callback();
    });
  }

  /**
   * Z-zips the compiled code
   *
   * @memberOf Compiler
   * @instance
   * @method gzip
   * @param {ProgramData}  data     - the actual program data to auto-prefix
   * @param {GzipCallback} callback - a callback function
   * @example
   * compiler.gzip(data, callback);
   */
  gzip(data: ProgramData, callback: GzipCallback) {
    gzip(data.code, (err, code) => {
      if (err) {
        return console.error(err);
      }
      callback({code, map: data.map});
    });
  }

  /**
   * G-zips the program if necessary and writes the results to disk.
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
  optimize(inPath: string, outPath: string, data: ProgramData, callback: () => void) {
    if (!this.compress) {
      this.writeAndCallDone(inPath, outPath, data, callback);
      return;
    }
    this.gzip(data, result => {
      this.writeAndCallDone(inPath, outPath, result, callback);
    });
  }

}
