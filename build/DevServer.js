

/* @noflow */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _simpleRecursiveWatch = require('simple-recursive-watch');

var _SASS = require('./SASS');

var _SASS2 = _interopRequireDefault(_SASS);

var _tinyLr = require('tiny-lr');

var _tinyLr2 = _interopRequireDefault(_tinyLr);

var _webpackDevServer = require('webpack-dev-server');

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

/**
 * A lightweight development server that rapidly recompiles the JavaScript and SASS files when they are edited and
 * updates the page.
 * Utilizes the Webpack development server.
 * Includes react hot loader to further optimize the development process of the React applications.
 * Please install and enable the LiveReload browser extension for the CSS reloading to work.
 *
 * @class
 * @param {string}  script       - a full system path to a JavaScript file
 * @param {string}  style        - a full system path to a SASS file
 * @param {string}  devDir       - a full system path to a directory in which to put any compiled development resources
 * @param {number}  [port=3000]  - a port at which to start the dev server
 * @param {boolean} [react=true] - false to disable the react hot loader plugin
 * @example
 * import {DevServer} from 'webcompiler';
 * import {join} from 'path';
 *
 * let rootDir = join(__dirname, '..'),
 *     devDir = join(rootDir, 'development'),
 *     server = new DevServer(join(devDir, 'script.js'), join(devDir, 'app.scss'), devDir);
 *
 * server.run(rootDir, 'bin', 'build', 'docs', 'lib', 'node_modules', 'spec');
 * // now navigate to http://localhost:3000 using your favorite browser ( preferably Chrome :) )
 */

var DevServer = (function () {
  function DevServer(script, style, devDir) {
    var _this = this;

    var port = arguments.length <= 3 || arguments[3] === undefined ? 3000 : arguments[3];
    var react = arguments.length <= 4 || arguments[4] === undefined ? true : arguments[4];

    _classCallCheck(this, DevServer);

    var sass = new _SASS2['default'](),
        loaders = [];

    if (react) {
      loaders.push('react-hot');
    }
    loaders.push('babel');

    /**
     * a port at which to start the dev server
     *
     * @memberof DevServer
     * @private
     * @instance
     * @type {number}
     */
    this.port = port;

    /**
     * a LiveReload server
     *
     * @memberof DevServer
     * @private
     * @instance
     * @type {tinylr.Server}
     */
    this.lr = (0, _tinyLr2['default'])();

    /**
     * recompiles SASS and notifies LiveReload
     *
     * @memberof DevServer
     * @private
     * @instance
     * @type {Function}
     */
    this.compileSASS = sass.feDev.bind(sass, style, (0, _path.join)(devDir, 'style.css'), function () {
      _this.lr.changed({ body: { files: ['style.css'] } });
    });

    /**
     * the Webpack development server
     *
     * @memberof DevServer
     * @private
     * @instance
     * @type {WebpackDevServer}
     */
    this.server = new _webpackDevServer2['default']((0, _webpack2['default'])({
      cache: {},
      debug: true,
      devtool: 'eval-source-map',
      entry: ['webpack-dev-server/client?http://localhost:' + this.port, 'webpack/hot/only-dev-server', script],
      output: {
        path: devDir,
        filename: 'script.js',
        publicPath: '/'
      },
      plugins: [new _webpack2['default'].HotModuleReplacementPlugin(), new _webpack2['default'].NoErrorsPlugin()],
      module: {
        loaders: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: loaders
        }]
      }
    }), {
      contentBase: devDir,
      publicPath: '/',
      hot: true,
      historyApiFallback: true
    });

    this.server.app.get('*', function (req, res) {
      res.send('<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Development server - Webcompiler</title>\n    <link href="/style.css" rel="stylesheet">\n  </head>\n  <body>\n    <div id="app"></div>\n    <script src="/script.js" async defer></script>\n  </body>\n</html>');
    });
  }

  /**
   * Compile SASS and start watching for file changes
   *
   * @memberof DevServer
   * @instance
   * @method watchSASS
   * @param {string}    watchDir - the directory in which to watch for the changes in the SASS files
   * @param {...string} exclude  - file/directory names to exclude from watching for the changes in the SASS files
   * @example
   * server.watchSASS('/path/to/some/directory', 'node_modules', 'spec', 'docs', 'config', 'bin', 'build', 'coverage');
   */

  _createClass(DevServer, [{
    key: 'watchSASS',
    value: function watchSASS(watchDir) {
      this.lr.listen(35729);
      this.compileSASS();

      for (var _len = arguments.length, exclude = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        exclude[_key - 1] = arguments[_key];
      }

      _simpleRecursiveWatch.DirectoryWatcher.watch.apply(_simpleRecursiveWatch.DirectoryWatcher, [watchDir, 'scss', this.compileSASS].concat(exclude));
    }

    /**
     * Starts the Webpack development server
     *
     * @memberof DevServer
     * @instance
     * @method watchJS
     * @example
     * server.watchJS();
     */
  }, {
    key: 'watchJS',
    value: function watchJS() {
      var port = this.port;

      this.server.listen(port, '0.0.0.0', function (e) {
        if (e) {
          return console.error(e);
        }
        console.log('Started the development server at localhost:' + port);
      });
    }

    /**
     * Starts the Webpack development server, compiles SASS and starts watching for file changes
     *
     * @memberof DevServer
     * @instance
     * @method run
     * @param {string}    watchDir - the directory in which to watch for the changes in the SASS files
     * @param {...string} exclude  - file/directory names to exclude from watching for the changes in the SASS files
     * @example
     * server.run('/path/to/some/directory', 'node_modules', 'spec', 'docs', 'config', 'bin', 'build', 'coverage');
     */
  }, {
    key: 'run',
    value: function run(watchDir) {
      this.watchJS();

      for (var _len2 = arguments.length, exclude = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        exclude[_key2 - 1] = arguments[_key2];
      }

      this.watchSASS.apply(this, [watchDir].concat(exclude));
    }
  }]);

  return DevServer;
})();

exports['default'] = DevServer;
module.exports = exports['default'];