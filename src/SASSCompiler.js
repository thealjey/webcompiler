/* @flow */

import type {ProgramData, ProgramDataCallback, ImportOnceOptions} from './typedef';
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
  ];

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
 * @param {boolean}           [compress=true]        - if true `Compiler#save` will gzip compress the data in production
 *                                                     mode
 * @param {Array<string>}     [includePaths=[]]      - an array of additional include paths
 * @param {ImportOnceOptions} [importOnceOptions={}] - an object that lets you override default importOnce resolver
 *                                                     configuration
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
   * an array of paths to search for an scss file in if it's not found in cwd
   *
   * @member {Array<string>} includePaths
   * @memberof SASSCompiler
   * @private
   * @instance
   */
  includePaths: string[];

  /**
   * importOnce resolver configuration
   *
   * @member {ImportOnceOptions} importOnce
   * @memberof SASSCompiler
   * @private
   * @instance
   */
  importOnce: ImportOnceOptions;

  /**
   * postcss plugins
   *
   * @member {Array<*>} postcssPlugins
   * @memberof SASSCompiler
   * @private
   * @instance
   */
  postcssPlugins: any[] = [autoprefixer];

  /* eslint-disable require-jsdoc */
  constructor(compress: boolean = true, includePaths: string[] = [], importOnceOptions: ImportOnceOptions = {}) {
    /* eslint-enable require-jsdoc */
    super(compress);
    this.includePaths = defaultIncludePaths.concat(includePaths);
    this.importOnce = {...importOnceDefaults, ...importOnceOptions};
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
    render({
      file: inPath,
      outFile: outPath,
      importer,
      precision,
      importOnce: this.importOnce,
      includePaths: this.includePaths,
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
