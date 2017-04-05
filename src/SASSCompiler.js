/* @flow */

import type {ProgramData, ProgramDataCallback, SASSCompilerConfig} from './typedef';
import {Compiler} from './Compiler';
import {render} from 'node-sass';
import importer from 'node-sass-import-once';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import noop from 'lodash/noop';
import {logError, logPostCSSWarnings, logSASSError} from './logger';

const precision = 8,
  importOnceDefaults = {index: true, css: false, bower: false},
  defaultIncludePaths = [
    'node_modules/bootstrap-sass/assets/stylesheets',
    'node_modules/font-awesome/scss',
    'node_modules',
    'node_modules/bootswatch'
  ],
  defaultOptions = {
    includePaths: [],
    importOnce: {}
  };

/**
 * A SASS compiler
 *
 * Configures the default include paths for the following popular CSS modules:
 *
 *  1. Bootstrap (e.g. you can write `@import "bootstrap";` in your ".scss" files)
 *  2. Font Awesome (`@import "font-awesome";`)
 *  3. Bootswatch (`@import "cosmo/variables"; @import "bootstrap"; @import "cosmo/bootswatch";`)
 *
 * Additionally, if an NPM module contains an `_index.scss` (or `_index.sass`, or `index.scss`, or `index.sass`) file in
 * its root directory, importing its stylesheets is as easy as: `@import "<module name>";` (same as you would `import`
 * the module in JavaScript).
 *
 * @class SASSCompiler
 * @extends Compiler
 * @param {SASSCompilerConfig} [options={}] - configuration object
 * @example
 * import {SASSCompiler} from 'webcompiler';
 * // or - import {SASSCompiler} from 'webcompiler/lib/SASSCompiler';
 * // or - var SASSCompiler = require('webcompiler').SASSCompiler;
 * // or - var SASSCompiler = require('webcompiler/lib/SASSCompiler').SASSCompiler;
 * import {join} from 'path';
 *
 * const scssDir = join(__dirname, 'scss'),
 *   cssDir = join(__dirname, 'css');
 *
 * const compiler = new SASSCompiler();
 *
 * // compile for the browser
 * compiler.fe(join(scssDir, 'style.scss'), join(cssDir, 'style.css'));
 */
export class SASSCompiler extends Compiler {

  /**
   * postcss plugins
   *
   * @member {Array<*>} postcssPlugins
   * @memberof SASSCompiler
   * @private
   * @instance
   */
  postcssPlugins: any[] = [autoprefixer];

  // eslint-disable-next-line require-jsdoc
  constructor(options: SASSCompilerConfig = {}) {
    const {includePaths, importOnce, ...rest} = {...defaultOptions, ...options};

    super({
      includePaths: defaultIncludePaths.concat(includePaths),
      importOnce: {...importOnceDefaults, ...importOnce},
      ...rest
    });
  }

  /**
   * Adds postcss plugins (autoprefixer is included by default).
   *
   * @memberof SASSCompiler
   * @instance
   * @method addPostcssPlugins
   * @param {...*} plugins - postcss plugins
   * @return {SASSCompiler} self
   */
  addPostcssPlugins(...plugins: any[]) {
    this.postcssPlugins.push(...plugins);

    return this;
  }

  /**
   * Runs the compiled code through the list of configured postcss plugins.
   *
   * @memberOf SASSCompiler
   * @instance
   * @method postcss
   * @param {string}              path     - a path to the file
   * @param {ProgramData}         data     - the actual program data to execute postcss on
   * @param {ProgramDataCallback} callback - a callback function
   */
  postcss(path: string, data: ProgramData, callback: ProgramDataCallback) {
    postcss(this.postcssPlugins).process(data.code, {
      from: path,
      to: path,
      map: {prev: data.map}
    }).then(result => {
      const warnings = result.warnings();

      if (warnings.length) {
        return logPostCSSWarnings(warnings);
      }
      callback({code: result.css, map: JSON.stringify(result.map)});
    }, logError);
  }

  /**
   * Compiles, runs postcss on the result and, optionally, g-zips in the production mode.
   *
   * @memberof SASSCompiler
   * @instance
   * @method fe
   * @param {string}   inPath                    - a full system path to the input file
   * @param {string}   outPath                   - a full system path to the output file
   * @param {Function} [callback=function () {}] - a callback function
   */
  fe(inPath: string, outPath: string, callback: () => void = noop) {
    const {importOnce, includePaths} = this.options;

    render({
      file: inPath,
      outFile: outPath,
      importer,
      precision,
      importOnce,
      includePaths,
      sourceMap: true,
      sourceMapContents: true,
      outputStyle: 'compressed'
    }, (error, result) => {
      if (error) {
        return logSASSError(error);
      }
      this.postcss(outPath, {code: result.css, map: result.map.toString()}, data => {
        this.save(inPath, outPath, data, callback);
      });
    });
  }

}
