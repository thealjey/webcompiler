'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevServer = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _SASSCompiler = require('./SASSCompiler');

var _watch = require('./watch');

var _tinyLr = require('tiny-lr');

var _tinyLr2 = _interopRequireDefault(_tinyLr);

var _webpackDevServer = require('webpack-dev-server');

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LIVERELOAD_PORT = 35729,
    WEB_PORT = 3000;

/**
 * A lightweight development server that rapidly recompiles the JavaScript and SASS files when they are edited and
 * updates the page.
 *
 * Utilizes the Webpack development server.
 *
 * Includes react hot loader to further optimize the development process of the React applications.
 *
 * Please install and enable the LiveReload browser extension for the CSS reloading to work.
 *
 * @class DevServer
 * @param {string}  script       - a full system path to a JavaScript file
 * @param {string}  style        - a full system path to a SASS file
 * @param {string}  devDir       - a full system path to a directory in which to put any compiled development resources
 * @param {number}  [port=3000]  - a port at which to start the dev server
 * @param {boolean} [react=true] - false to disable the react hot loader plugin
 * @see {@link http://gaearon.github.io/react-hot-loader/|React Hot Loader}
 * @example
 * import {DevServer} from 'webcompiler';
 * import {join} from 'path';
 *
 * const rootDir = join(__dirname, '..'),
 *     devDir = join(rootDir, 'development'),
 *     server = new DevServer(join(devDir, 'script.js'), join(devDir, 'app.scss'), devDir);
 *
 * server.run(rootDir);
 * // now navigate to http://localhost:3000 using your favorite browser ( preferably Chrome :) )
 */

var DevServer = exports.DevServer = function () {

  /**
   * recompiles SASS and notifies LiveReload
   *
   * @method compileSASS
   * @memberof DevServer
   * @private
   * @instance
   */

  /**
   * a port at which to start the dev server
   *
   * @member {number} port
   * @memberof DevServer
   * @private
   * @instance
   */

  function DevServer(script, style, devDir) {
    var _this = this;

    var port = arguments.length <= 3 || arguments[3] === undefined ? WEB_PORT : arguments[3];
    var react = arguments.length <= 4 || arguments[4] === undefined ? true : arguments[4];
    (0, _classCallCheck3.default)(this, DevServer);

    var sass = new _SASSCompiler.SASSCompiler(),
        loaders = [];

    if (react) {
      loaders.push('react-hot');
    }
    loaders.push('babel');

    this.port = port;
    this.lr = (0, _tinyLr2.default)();
    this.compileSASS = sass.fe.bind(sass, style, (0, _path.join)(devDir, 'style.css'), function () {
      _this.lr.changed({ body: { files: ['style.css'] } });
    });
    this.server = new _webpackDevServer2.default((0, _webpack2.default)({
      cache: {},
      debug: true,
      devtool: 'eval-source-map',
      entry: ['webpack-dev-server/client?http://localhost:' + this.port, 'webpack/hot/only-dev-server', script],
      output: {
        path: devDir,
        filename: 'script.js',
        publicPath: '/'
      },
      plugins: [new _webpack2.default.HotModuleReplacementPlugin(), new _webpack2.default.NoErrorsPlugin()],
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
   * @param {string} watchDir - the directory in which to watch for the changes in the SASS files
   * @example
   * server.watchSASS('/path/to/some/directory');
   */


  /**
   * the Webpack development server
   *
   * @member {WebpackDevServer} server
   * @memberof DevServer
   * @private
   * @instance
   */


  /**
   * a LiveReload server
   *
   * @member {tinylr.Server} lr
   * @memberof DevServer
   * @private
   * @instance
   */


  (0, _createClass3.default)(DevServer, [{
    key: 'watchSASS',
    value: function watchSASS(watchDir) {
      this.lr.listen(LIVERELOAD_PORT);
      this.compileSASS();
      (0, _watch.watch)(watchDir, 'scss', this.compileSASS);
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

      this.server.listen(port, '0.0.0.0', function (error) {
        if (error) {
          return console.error(error);
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
     * @param {string} watchDir - the directory in which to watch for the changes in the SASS files
     * @example
     * server.run('/path/to/some/directory');
     */

  }, {
    key: 'run',
    value: function run(watchDir) {
      this.watchJS();
      this.watchSASS(watchDir);
    }
  }]);
  return DevServer;
}();