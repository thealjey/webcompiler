/* @flow */

/* @flowignore */
import config from '../config/babel';
import {Compiler} from './Compiler';
import type {ProgramData} from './Compiler';
import {join, extname, dirname, basename} from 'path';
import {readdir, stat, createReadStream, createWriteStream} from 'fs';
import {transformFile} from 'babel-core';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import UglifyJS from 'uglify-js';
import autoprefixer from 'autoprefixer';
import importer from 'node-sass-import-once';

/* eslint-disable no-sync */

/* @flowignore */
const emptyFn: () => void = Function.prototype,
    precision = 8,
    cache = {},
    fakeFS = new MemoryFS();

/**
 * A JavaScript compiler
 *
 * @class JSCompiler
 * @extends Compiler
 * @param {Object} [options={}] - allows to override the default Babel options
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

  constructor(options: Object = {}) {
    super();
    this.options = Object.assign({}, config.env[this.isProduction ? 'production' : 'development'], options);
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
      files.forEach(file => {
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
   * Compiles a files
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
   * Minifies the compiled code
   *
   * @memberOf JSCompiler
   * @instance
   * @method minify
   * @param  {string}      path     - a path to the file (can be used for the sourceMappingURL comment)
   * @param  {ProgramData} data     - the actual program data to compress
   * @return {ProgramData} processed application code with source maps
   * @example
   * const minifiedData = compiler.minify('/path/to/the/output/file.js', data);
   */
  minify(path: string, data: ProgramData): ProgramData {
    return UglifyJS.minify(data.code, {
      fromString: true,
      mangle: false,
      output: {space_colon: false},
      inSourceMap: JSON.parse(data.map),
      outSourceMap: `${basename(path)}.map`
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
  be(inPath: string, outPath: string, callback: () => void = emptyFn) {
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
   * Supports importing (requiring) `.scss` files inside of JavaScript.
   *
   * @memberOf JSCompiler
   * @instance
   * @method fe
   * @param {string}   inPath                    - the input path
   * @param {string}   outPath                   - the output path
   * @param {Function} [callback=function () {}] - a callback function
   * @return {void}
   * @see {@link https://github.com/css-modules/css-modules|CSS Modules}
   * @example
   * compiler.fe('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
   */
  fe(inPath: string, outPath: string, callback: () => void = emptyFn) {
    const {plugins} = this.options,
        {NODE_ENV} = process.env;

    if (plugins) {
      this.options.plugins = plugins.filter(plugin => 'webpack-loaders' !== plugin && 'webpack-loaders' !== plugin[0]);
    }

    if (!this.isProduction) {
      process.env.NODE_ENV = 'development';
    }

    const compiler = webpack({
      cache,
      debug: true,
      devtool: 'source-map',
      entry: inPath,
      output: {path: dirname(outPath), filename: basename(outPath)},
      module: {
        loaders: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {cacheDirectory: true, ...this.options}
        }, {
          test: /\.scss$/,
          loaders: ['style?singleton', 'css?modules&minimize&importLoaders=1&sourceMap', 'postcss', 'sass?sourceMap']
        }]
      },
      postcss: () => [autoprefixer],
      sassLoader: {
        importer,
        importOnce: {index: true, css: false, bower: false},
        includePaths: ['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules'],
        precision
      }
    });

    /* istanbul ignore next */
    if (NODE_ENV) {
      process.env.NODE_ENV = NODE_ENV;
    } else {
      delete process.env.NODE_ENV;
    }

    if (this.isProduction) {
      compiler.outputFileSystem = fakeFS;
    }
    compiler.run((error, stats) => {
      if (error) {
        return console.error(error);
      }
      const jsonStats = stats.toJson(),
          errors = jsonStats.errors.concat(jsonStats.warnings);

      if (errors.length) {
        return errors.forEach(err => {
          console.error(err);
        });
      }
      if (!this.isProduction) {
        return this.done(inPath, callback);
      }
      this.optimize(inPath, outPath, {
        code: fakeFS.readFileSync(outPath, 'utf8'),
        map: fakeFS.readFileSync(`${outPath}.map`, 'utf8')
      }, callback);
    });
  }

}
