/* @flow */

import type {ProgramData, ProgramDataCallback} from './typedef';
import mkdirp from 'mkdirp';
import {dirname} from 'path';
import {writeFile} from 'fs';
import {gzip} from 'zlib';

/* eslint-disable no-process-env */

let i = 0;

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

  /* eslint-disable require-jsdoc */
  constructor(compress: boolean = true) {
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
  static done(inPath: string, callback: () => void) {
    console.log('\x1b[32m%s. Compiled %s\x1b[0m', ++i, inPath);
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
   * @example
   * Compiler.writeAndCallDone('/path/to/an/input/file', '/path/to/the/output/file', data, callback);
   */
  static writeAndCallDone(inPath: string, outPath: string, data: ProgramData, callback: () => void) {
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
   * @example
   * Compiler.fsWrite('/path/to/an/output/file', data, callback);
   */
  static fsWrite(path: string, data: ProgramData, callback: () => void) {
    Compiler.mkdir(path, () => {
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
   * @static
   * @method mkdir
   * @param {string}   path     - a path to a file
   * @param {Function} callback - a callback function
   * @example
   * Compiler.mkdir('/path/to/a/file', callback);
   */
  static mkdir(path: string, callback: () => void) {
    mkdirp(dirname(path), mkdirpErr => {
      if (mkdirpErr) {
        return console.error(mkdirpErr);
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
   * @param {ProgramData}         data     - the actual program data to auto-prefix
   * @param {ProgramDataCallback} callback - a callback function
   * @example
   * Compiler.gzip(data, callback);
   */
  static gzip(data: ProgramData, callback: ProgramDataCallback) {
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
      Compiler.writeAndCallDone(inPath, outPath, data, callback);

      return;
    }
    Compiler.gzip(data, result => {
      Compiler.writeAndCallDone(inPath, outPath, result, callback);
    });
  }

}
