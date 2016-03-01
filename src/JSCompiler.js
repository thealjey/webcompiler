/* @flow */

import {Compiler} from './Compiler';
import {join, extname, dirname, basename} from 'path';
import {readdir, stat, createReadStream, createWriteStream, readFileSync} from 'fs';
import {transformFile} from 'babel-core';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import forEach from 'lodash/forEach';
import noop from 'lodash/noop';
import assignWith from 'lodash/assignWith';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import uniq from 'lodash/uniq';

/* eslint-disable no-sync */
/* eslint-disable no-process-env */

const config = JSON.parse(readFileSync(join(__dirname, '..', '.babelrc'), 'utf8')),
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

  /** @constructs */
  constructor(compress: boolean = true, options: Object = {}) {
    super(compress);
    this.configure(options);
    this.processing = 0;
  }

  /**
   * Merges Babel configuration options
   *
   * @memberOf JSCompiler
   * @instance
   * @private
   * @method configure
   * @param {Object} options - allows to override the default Babel options
   * @example
   * compiler.configure(options);
   */
  configure(options: Object) {
    this.options = assignWith({}, config, get(config, ['env', process.env.NODE_ENV || 'development']), options,
      (objValue, srcValue) => {
        if (!isArray(srcValue)) {
          return srcValue;
        }
        if (!isArray(objValue)) {
          return uniq(srcValue);
        }
        return uniq(srcValue.concat(objValue));
      });
    delete this.options.env;
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
      Compiler.fsWrite(outPath, result, callback);
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
    Compiler.mkdir(outPath, () => {
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
      --this.processing;
      if (!this.processing) {
        Compiler.done(inPath, callback);
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
      node: {
        fs: 'empty'
      },
      module: {
        loaders: [{
          test: /jsdom/,
          loader: 'null'
        }, {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel',
          query: {cacheDirectory: true, ...this.options}
        }, {
          test: /\.json$/,
          loader: 'json'
        }]
      }
    });

    compiler.outputFileSystem = fakeFS;

    compiler.run((err, stats) => {
      if (err) {
        return console.error(err);
      }
      const {warnings, errors} = stats.toJson();

      forEach(warnings, warning => {
        console.log('\x1b[33m%s\x1b[0m', warning);
      });
      if (errors.length) {
        return forEach(errors, error => {
          console.error(error);
        });
      }
      this.optimize(inPath, outPath, {
        code: fakeFS.readFileSync(outPath, 'utf8'),
        map: fakeFS.readFileSync(`${outPath}.map`, 'utf8')
      }, callback);
    });
  }

}
