/* @flow */

import type {ProgramData, ProgramDataCallback} from './typedef';
import mkdirp from 'mkdirp';
import {dirname} from 'path';
import {writeFile, readFile} from 'fs';
import {gzip, gunzip} from 'zlib';
import {isProduction} from './util';
import {logError, logSequentialSuccessMessage} from './logger';

/**
 * The base compiler class
 *
 * @class Compiler
 * @abstract
 * @param {boolean} [compress=true] - if true `Compiler#save` will gzip compress the data in production mode
 */
export class Compiler {

  /**
   * if true `Compiler#save` will gzip compress the data
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
    this.compress = isProduction && compress;
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
  static done(inPath: string, callback: () => void) {
    logSequentialSuccessMessage(`Compiled ${inPath}`);
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
   * @return {void}
   */
  static fsWrite(path: string, data: ProgramData, callback: () => void) {
    if (!data.code) {
      return callback();
    }
    Compiler.mkdir(path, () => {
      writeFile(path, data.code, scriptErr => {
        if (scriptErr) {
          return logError(scriptErr);
        }
        if (!data.map) {
          return callback();
        }
        writeFile(`${path}.map`, data.map, mapErr => {
          if (mapErr) {
            return logError(mapErr);
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
  static mkdir(path: string, callback: () => void) {
    mkdirp(dirname(path), mkdirpErr => {
      if (mkdirpErr) {
        return logError(mkdirpErr);
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
  static gzip(data: ProgramData, callback: ProgramDataCallback) {
    if (!data.code) {
      return callback(data);
    }

    gzip(data.code, (err, code) => {
      if (err) {
        return logError(err);
      }
      callback({code, map: data.map});
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
  fsRead(path: string, callback: ProgramDataCallback) {
    readFile(path, (scriptErr, scriptData) => {
      if (scriptErr) {
        return callback({code: '', map: ''});
      }
      readFile(`${path}.map`, 'utf8', (mapErr, mapData) => {
        const map = mapErr ? '' : mapData;

        if (!this.compress) {
          return callback({code: scriptData.toString('utf8'), map});
        }

        gunzip(scriptData, (zipErr, zipData) => {
          callback({code: zipErr ? '' : zipData.toString('utf8'), map});
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
  save(inPath: string, outPath: string, data: ProgramData, callback: () => void) {
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
