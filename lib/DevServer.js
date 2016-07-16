'use strict';

exports.__esModule = true;
exports.DevServer = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _SASSCompiler = require('./SASSCompiler');

var _watch = require('./watch');

var _tinyLr = require('tiny-lr');

var _tinyLr2 = _interopRequireDefault(_tinyLr);

var _webpackDevServer = require('webpack-dev-server');

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LIVERELOAD_PORT = 35729;
var WEB_PORT = 3000;
var cwd = process.cwd();
var HotModuleReplacementPlugin = _webpack2.default.HotModuleReplacementPlugin;
var NoErrorsPlugin = _webpack2.default.NoErrorsPlugin;
var defaultOptions = {
  port: WEB_PORT,
  react: true,
  contentBase: cwd,
  configureApplication: _noop2.default
};

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
 * @param {string}  script               - a full system path to a JavaScript file
 * @param {DevServerConfig} [options={}] - optional configuration
 * @see {@link http://webpack.github.io/docs/webpack-dev-server.html webpack-dev-server}
 * @see {@link http://gaearon.github.io/react-hot-loader/ React Hot Loader}
 * @example
 * import {DevServer} from 'webcompiler';
 * // or - import {DevServer} from 'webcompiler/lib/DevServer';
 * // or - var DevServer = require('webcompiler').DevServer;
 * // or - var DevServer = require('webcompiler/lib/DevServer').DevServer;
 * import {join} from 'path';
 *
 * const devDir = join(__dirname, '..', 'development'),
 *   script = join(devDir, 'script.js'),
 *   style = join(devDir, 'app.scss');
 *
 * new DevServer(script, {style}).run();
 * // now navigate to http://localhost:3000 using your favorite browser ( preferably Chrome :) )
 */

var DevServer = exports.DevServer = function () {

  /* eslint-disable require-jsdoc */

  /**
   * a full system path to a JavaScript file
   *
   * @member {string} script
   * @memberof DevServer
   * @private
   * @instance
   */

  function DevServer(script) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    (0, _classCallCheck3.default)(this, DevServer);

    /* eslint-enable require-jsdoc */
    this.script = script;
    this.options = (0, _extends3.default)({}, defaultOptions, options);
  }

  /**
   * Returns the HTML page layout
   *
   * @memberof DevServer
   * @private
   * @instance
   * @method layout
   * @return {string} HTML layout
   */


  /**
   * optional configuration
   *
   * @member {Object} options
   * @memberof DevServer
   * @private
   * @instance
   */


  DevServer.prototype.layout = function layout() {
    return '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Development server - WebCompiler</title>\n    <link rel="shortcut icon" href="/favicon.ico">' + (this.options.style ? '\n    <link rel="stylesheet" href="/style.css">' : '') + '\n  </head>\n  <body>\n    <div id="app"></div>\n    <script src="/script.js" async defer></script>\n  </body>\n</html>';
  };

  /**
   * Returns the JavaScript module loaders array necessary to run the server
   *
   * @memberof DevServer
   * @private
   * @instance
   * @method loaders
   * @return {Array<string>} JavaScript module loaders
   */


  DevServer.prototype.loaders = function loaders() {
    var loaders = [];

    if (this.options.react) {
      loaders.push('react-hot');
    }
    loaders.push('babel');

    return loaders;
  };

  /**
   * Compile SASS and start watching for file changes
   *
   * @memberof DevServer
   * @instance
   * @method watchSASS
   * @example
   * server.watchSASS();
   */


  DevServer.prototype.watchSASS = function watchSASS() {
    var _options = this.options;
    var style = _options.style;
    var contentBase = _options.contentBase;


    if (!style) {
      return;
    }

    var sass = new _SASSCompiler.SASSCompiler(false),
        lr = (0, _tinyLr2.default)(),
        compileSASS = sass.fe.bind(sass, style, (0, _path.join)(contentBase, 'style.css'), function () {
      lr.changed({ body: { files: ['style.css'] } });
    });

    lr.listen(LIVERELOAD_PORT);
    compileSASS();
    (0, _watch.watch)(cwd, 'scss', compileSASS);
  };

  /**
   * Starts the Webpack development server
   *
   * @memberof DevServer
   * @instance
   * @method watchJS
   * @example
   * server.watchJS();
   */


  DevServer.prototype.watchJS = function watchJS() {
    var _this = this;

    var _options2 = this.options;
    var port = _options2.port;
    var contentBase = _options2.contentBase;
    var configureApplication = _options2.configureApplication;


    var server = new _webpackDevServer2.default((0, _webpack2.default)({
      cache: {},
      debug: true,
      devtool: 'eval-source-map',
      entry: ['webpack-dev-server/client?http://0.0.0.0:' + port, 'webpack/hot/only-dev-server', this.script],
      output: {
        path: contentBase,
        filename: 'script.js',
        publicPath: '/'
      },
      plugins: [new HotModuleReplacementPlugin(), new NoErrorsPlugin()],
      module: {
        loaders: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: this.loaders()
        }, {
          test: /\.json$/,
          loader: 'json'
        }]
      }
    }), {
      contentBase: false,
      publicPath: '/',
      hot: true
    });

    server.use((0, _serveStatic2.default)(contentBase));
    configureApplication(server.app);
    server.use(function (req, res) {
      res.send(_this.layout());
    });

    server.listen(port, '0.0.0.0', function (error) {
      if (error) {
        return console.error(error);
      }
      console.log('\x1b[32mStarted the development server at localhost:%d\x1b[0m', port);
    });
  };

  /**
   * Starts the Webpack development server, compiles SASS and starts watching for file changes
   *
   * @memberof DevServer
   * @instance
   * @method run
   * @example
   * server.run();
   */


  DevServer.prototype.run = function run() {
    this.watchJS();
    this.watchSASS();
  };

  return DevServer;
}();