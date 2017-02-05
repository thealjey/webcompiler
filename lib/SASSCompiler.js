'use strict';

exports.__esModule = true;
exports.SASSCompiler = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _Compiler = require('./Compiler');

var _nodeSass = require('node-sass');

var _nodeSassImportOnce = require('node-sass-import-once');

var _nodeSassImportOnce2 = _interopRequireDefault(_nodeSassImportOnce);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _logger = require('./logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const precision = 8,
      importOnceDefaults = { index: true, css: false, bower: false },
      defaultIncludePaths = ['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules/font-awesome/scss', 'node_modules', 'node_modules/bootswatch'];

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
class SASSCompiler extends _Compiler.Compiler {

  /* eslint-disable require-jsdoc */


  /**
   * importOnce resolver configuration
   *
   * @member {ImportOnceOptions} importOnce
   * @memberof SASSCompiler
   * @private
   * @instance
   */
  constructor(compress = true, includePaths = [], importOnceOptions = {}) {
    /* eslint-enable require-jsdoc */
    super(compress);
    this.postcssPlugins = [_autoprefixer2.default];
    this.includePaths = defaultIncludePaths.concat(includePaths);
    this.importOnce = _extends({}, importOnceDefaults, importOnceOptions);
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


  /**
   * postcss plugins
   *
   * @member {Array<*>} postcssPlugins
   * @memberof SASSCompiler
   * @private
   * @instance
   */


  /**
   * an array of paths to search for an scss file in if it's not found in cwd
   *
   * @member {Array<string>} includePaths
   * @memberof SASSCompiler
   * @private
   * @instance
   */
  addPostcssPlugins(...plugins) {
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
  postcss(path, data, callback) {
    (0, _postcss2.default)(this.postcssPlugins).process(data.code, {
      from: path,
      to: path,
      map: { prev: data.map }
    }).then(result => {
      const warnings = result.warnings();

      if (warnings.length) {
        return (0, _logger.logPostCSSWarnings)(warnings);
      }
      callback({ code: result.css, map: JSON.stringify(result.map) });
    }, _logger.logError);
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
  fe(inPath, outPath, callback = _noop2.default) {
    (0, _nodeSass.render)({
      file: inPath,
      outFile: outPath,
      importer: _nodeSassImportOnce2.default,
      precision,
      importOnce: this.importOnce,
      includePaths: this.includePaths,
      sourceMap: true,
      sourceMapContents: true,
      outputStyle: 'compressed'
    }, (error, result) => {
      if (error) {
        return (0, _logger.logSASSError)(error);
      }
      this.postcss(outPath, { code: result.css, map: result.map.toString() }, data => {
        this.save(inPath, outPath, data, callback);
      });
    });
  }

}
exports.SASSCompiler = SASSCompiler;