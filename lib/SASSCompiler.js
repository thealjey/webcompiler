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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const precision = 8,
      importOnceDefaults = { index: true, css: false, bower: false },
      defaultIncludePaths = ['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules/font-awesome/scss', 'node_modules', 'node_modules/bootswatch'],
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
class SASSCompiler extends _Compiler.Compiler {

  // eslint-disable-next-line require-jsdoc
  constructor(options = {}) {
    const _defaultOptions$optio = _extends({}, defaultOptions, options),
          { includePaths, importOnce } = _defaultOptions$optio,
          rest = _objectWithoutProperties(_defaultOptions$optio, ['includePaths', 'importOnce']);

    super(_extends({
      includePaths: defaultIncludePaths.concat(includePaths),
      importOnce: _extends({}, importOnceDefaults, importOnce)
    }, rest));
    this.postcssPlugins = [_autoprefixer2.default];
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
    const { importOnce, includePaths } = this.options;

    (0, _nodeSass.render)({
      file: inPath,
      outFile: outPath,
      importer: _nodeSassImportOnce2.default,
      precision,
      importOnce,
      includePaths,
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