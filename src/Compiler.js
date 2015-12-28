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
 * The base compiler class
 *
 * @class Compiler
 * @abstract
 */
export class Compiler {
  /**
   * True if the NODE_ENV environment variable is equal to 'production'.
   * Caution: modifying it's value directly may lead to unexpected results
   *
   * @member {boolean} isProduction
   * @memberof Compiler
   * @readOnly
   * @instance
   */
  isProduction: boolean;

  constructor() {
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
  minify: (path: string, data: ProgramData) => ?ProgramData;

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
    mkdirp(dirname(path), mkdirpErr => {
      if (mkdirpErr) {
        return console.error(mkdirpErr);
      }
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
  optimize(inPath: string, outPath: string, data: ProgramData, callback: () => void) {
    const minified = this.minify(outPath, data);

    if (!minified) {
      return;
    }
    gzip(minified.code, (gzipErr, code) => {
      if (gzipErr) {
        return console.error(gzipErr);
      }
      this.fsWrite(outPath, {code, map: minified.map}, () => {
        this.done(inPath, callback);
      });
    });
  }

}
