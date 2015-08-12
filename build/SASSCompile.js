'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nodeSass = require('node-sass');

var _nodeSassImportOnce = require('node-sass-import-once');

var _nodeSassImportOnce2 = _interopRequireDefault(_nodeSassImportOnce);

var options = {
  file: null,
  outFile: null,
  importer: _nodeSassImportOnce2['default'],
  importOnce: { index: true, css: false, bower: false },
  includePaths: ['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules'],
  precision: 8,
  sourceMap: true,
  sourceMapContents: true
};

/**
 * SCSS file compiler
 *
 * @class
 * @param {Object}    [importOnceOptions] - an object that lets you override default importOnce resolver configuration
 * @param {...string} includePaths        - an array of additional include paths
 * @example
 * import {SASSCompile} from 'webcompiler';
 *
 * var compiler = new SASSCompile();
 */

var SASSCompile = (function () {
  function SASSCompile() {
    var importOnceOptions = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var includePaths = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    _classCallCheck(this, SASSCompile);

    /**
     * importOnce resolver configuration
     *
     * @memberof SASSCompile
     * @private
     * @instance
     * @type {Object}
     */
    this.importOnce = Object.assign({}, options.importOnce, importOnceOptions);

    /**
     * an array of paths to search for an scss file in if it's not found in cwd
     *
     * @memberof SASSCompile
     * @private
     * @instance
     * @type {Array<string>}
     */
    this.includePaths = options.includePaths.concat(includePaths);
  }

  /**
   * Run the compiler
   *
   * @memberof SASSCompile
   * @instance
   * @method run
   * @param {string}   inPath   - a full system path to the input file
   * @param {string}   outPath  - a full system path to the output file (used when building a map file, nothing is ever
   *                              written to disk)
   * @param {Function} callback - a callback function which accepts 2 arguments: an error object or null and an object
   *                              containing the compiled "code" and a "map" string
   * @example
   * compiler.run('/path/to/the/input/file.scss', '/path/to/the/output/file.css', function (e) {
   *   if (e) {
   *     return console.log(
   *       '\x1b[41mSASS error\x1b[0m "\x1b[33m%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
   *       e.message, e.file, e.line, e.column);
   *   }
   *   // compiled successfully
   * });
   */

  _createClass(SASSCompile, [{
    key: 'run',
    value: function run(inPath, outPath, callback) {
      (0, _nodeSass.render)(Object.assign({}, options, {
        file: inPath,
        outFile: outPath,
        importOnce: this.importOnce,
        includePaths: this.includePaths
      }), function (e, result) {
        if (e) {
          return callback(e);
        }
        callback(null, { code: result.css, map: result.map.toString() });
      });
    }
  }]);

  return SASSCompile;
})();

exports['default'] = SASSCompile;
module.exports = exports['default'];