/* @flow */

import {Compiler} from './Compiler';
import {join, extname, dirname, basename} from 'path';
import {readdir, stat, createReadStream, createWriteStream} from 'fs';
import {transformFile, OptionManager} from 'babel-core';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import forEach from 'lodash/forEach';
import noop from 'lodash/noop';

/* eslint-disable no-sync */

const manager = new OptionManager(),
    cache = {},
    fakeFS = new MemoryFS(),
    {DedupePlugin, UglifyJsPlugin} = webpack.optimize,
    productionPlugins = [new DedupePlugin(), new UglifyJsPlugin()];

/**
 * A JavaScript compiler
 *
 * @class JSCompiler
 * @extends Compiler
 * @param {boolean} [compress=true] - if true `Compiler#optimize` will gzip compress the data
 * @param {Object}  [options={}]    - allows to override the default Babel options
 * @example
 * import {JSCompiler} from 'webcompiler';
 *
 * const compiler = new JSCompiler();
 */
export class JSCompiler extends Compiler {
  /**
   * Babel options
   *
   * @member {Object} options
   * @memberOf JSCompiler
   * @private
   * @instance
   */
  options: Object;

  /**
   * The number of files being compiled at the moment
   *
   * @member {number} processing
   * @memberOf JSCompiler
   * @private
   * @instance
   */
  processing: number;

  constructor(compress: boolean = true, options: Object = {}) {
    super(compress);
    this.options = manager.init({filename: __dirname, ...options});
    this.processing = 0;
  }

  /**
   * Compiles a directory of files for the back end
   *
   * @memberOf JSCompiler
   * @instance
   * @private
   * @method beDir
   * @param {string}   inPath   - the input path
   * @param {string}   outPath  - the output path
   * @param {Function} callback - a callback function
   * @example
   * compiler.beDir('/path/to/an/input/directory', '/path/to/the/output/directory', callback);
   */
  beDir(inPath: string, outPath: string, callback: () => void) {
    readdir(inPath, (readdirErr, files) => {
      if (readdirErr) {
        return console.error(readdirErr);
      }
      forEach(files, file => {
        this.beTraverse(join(inPath, file), join(outPath, file), callback);
      });
    });
  }

  /**
   * Compiles a JavaScript file for the back end
   *
   * @memberOf JSCompiler
   * @instance
   * @private
   * @method beFile
   * @param {string}   inPath   - the input path
   * @param {string}   outPath  - the output path
   * @param {Function} callback - a callback function
   * @example
   * compiler.beFile('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
   */
  beFile(inPath: string, outPath: string, callback: () => void) {
    ++this.processing;
    transformFile(inPath, this.options, (transformFileErr, result) => {
      if (transformFileErr) {
        return console.error(transformFileErr);
      }
      this.fsWrite(outPath, result, callback);
    });
  }

  /**
   * Copies a file
   *
   * @memberOf JSCompiler
   * @instance
   * @private
   * @method copyFile
   * @param {string}   inPath   - the input path
   * @param {string}   outPath  - the output path
   * @param {Function} callback - a callback function
   * @example
   * compiler.copyFile('/path/to/an/input/file', '/path/to/the/output/file', callback);
   */
  copyFile(inPath: string, outPath: string, callback: () => void) {
    ++this.processing;
    this.mkdir(outPath, () => {
      createReadStream(inPath).pipe(createWriteStream(outPath));
      callback();
    });
  }

  /**
   * Compiles a JavaScript file for the back end or recursively traverses a directory, looking for the JavaScript files
   * to compile. Non-JavaScript files are simply copied over.
   *
   * @memberOf JSCompiler
   * @instance
   * @private
   * @method beTraverse
   * @param {string}   inPath   - the input path
   * @param {string}   outPath  - the output path
   * @param {Function} callback - a callback function
   * @example
   * compiler.beTraverse('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
   */
  beTraverse(inPath: string, outPath: string, callback: () => void) {
    stat(inPath, (statErr, stats) => {
      if (statErr) {
        return console.error(statErr);
      }
      if (stats.isDirectory()) {
        this.beDir(inPath, outPath, callback);
      } else if ('.js' === extname(inPath)) {
        this.beFile(inPath, outPath, callback);
      } else {
        this.copyFile(inPath, outPath, callback);
      }
    });
  }

  /**
   * Compiles a JavaScript file or a directory for the back end. Non-JavaScript files are simply copied over.
   *
   * @memberOf JSCompiler
   * @instance
   * @method be
   * @param {string}   inPath                    - the input path
   * @param {string}   outPath                   - the output path
   * @param {Function} [callback=function () {}] - a callback function
   * @return {void}
   * @example
   * compiler.be('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
   */
  be(inPath: string, outPath: string, callback: () => void = noop) {
    if (this.processing) {
      return console.error('Still working...');
    }
    this.beTraverse(inPath, outPath, () => {
      if (!(--this.processing)) {
        this.done(inPath, callback);
      }
    });
  }

  /**
   * Compiles, bundles (in production mode also minifies and g-zips) a JavaScript file for the front end.
   *
   * @memberOf JSCompiler
   * @instance
   * @method fe
   * @param {string}   inPath                    - the input path
   * @param {string}   outPath                   - the output path
   * @param {Function} [callback=function () {}] - a callback function
   * @example
   * compiler.fe('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
   */
  fe(inPath: string, outPath: string, callback: () => void = noop) {
    const compiler = webpack({
      cache,
      debug: true,
      devtool: 'source-map',
      entry: inPath,
      output: {path: dirname(outPath), filename: basename(outPath)},
      plugins: this.isProduction ? productionPlugins : [],
      module: {
        loaders: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {cacheDirectory: true, ...this.options}
        }, {
          test: /\.json$/,
          loader: 'json'
        }]
      }
    });

    compiler.outputFileSystem = fakeFS;

    compiler.run((error, stats) => {
      if (error) {
        return console.error(error);
      }
      const jsonStats = stats.toJson(),
          errors = jsonStats.errors.concat(jsonStats.warnings);

      if (errors.length) {
        return forEach(errors, err => {
          console.error(err);
        });
      }
      this.optimize(inPath, outPath, {
        code: fakeFS.readFileSync(outPath, 'utf8'),
        map: fakeFS.readFileSync(`${outPath}.map`, 'utf8')
      }, callback);
    });
  }

}
