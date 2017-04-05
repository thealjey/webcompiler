'use strict';

exports.__esModule = true;
exports.DevServer = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _SASSCompiler = require('./SASSCompiler');

var _logger = require('./logger');

var _livereload = require('./livereload');

var _watch = require('./watch');

var _webpack = require('./webpack');

var _path = require('path');

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WEB_PORT = 3000,
      cwd = process.cwd(),
      { green } = _logger.consoleStyles,
      defaultOptions = {
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
 * @see {@link https://facebook.github.io/watchman/ Watchman}
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
class DevServer {

  // eslint-disable-next-line require-jsdoc


  /**
   * a full system path to a JavaScript file
   *
   * @member {string} script
   * @memberof DevServer
   * @private
   * @instance
   */
  constructor(script, options = {}) {
    this.script = script;
    this.options = _extends({}, defaultOptions, options);
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
   * @member {DevServerConfig} options
   * @memberof DevServer
   * @private
   * @instance
   */
  layout() {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Development server - WebCompiler</title>
    <link rel="shortcut icon" href="/favicon.ico">${this.options.style ? '\n    <link rel="stylesheet" href="/style.css">' : ''}
  </head>
  <body>
    <div id="app"></div>
    <script src="/script.js" async defer></script>
  </body>
</html>`;
  }

  /**
   * Compile SASS and start watching for file changes
   *
   * @memberof DevServer
   * @instance
   * @method watchSASS
   */
  watchSASS() {
    const { style, contentBase } = this.options;

    if (!style) {
      return;
    }

    const sass = new _SASSCompiler.SASSCompiler({ compress: false }),
          lr = (0, _livereload.livereload)(),
          compileSASS = sass.fe.bind(sass, style, (0, _path.join)(contentBase, 'style.css'), () => {
      lr('/style.css');
    });

    compileSASS();
    (0, _watch.watch)(cwd, 'scss', compileSASS);
  }

  /**
   * Starts the Webpack development server
   *
   * @memberof DevServer
   * @instance
   * @method watchJS
   */
  watchJS() {
    const { port } = this.options,
          server = (0, _webpack.getServer)(this.script, this.options);

    server.use((req, res) => {
      res.send(this.layout());
    });

    server.listen(port, '0.0.0.0', error => {
      if (error) {
        return (0, _logger.logError)(error);
      }
      (0, _logger.log)(green('Started the development server at localhost:', port));
    });
  }

  /**
   * Starts the Webpack development server, compiles SASS and starts watching for file changes (only if the `style`
   * option was specified)
   *
   * @memberof DevServer
   * @instance
   * @method run
   */
  run() {
    this.watchJS();
    this.watchSASS();
  }

}
exports.DevServer = DevServer;