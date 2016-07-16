/* @flow */

import type {DevServerConfig} from './typedef';
import {SASSCompiler} from './SASSCompiler';
import {watch} from './watch';
import tinylr from 'tiny-lr';
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import {join} from 'path';
import noop from 'lodash/noop';
import serveStatic from 'serve-static';

const LIVERELOAD_PORT = 35729,
  WEB_PORT = 3000,
  cwd = process.cwd(),
  {HotModuleReplacementPlugin, NoErrorsPlugin} = webpack,
  defaultOptions = {
    port: WEB_PORT,
    react: true,
    contentBase: cwd,
    configureApplication: noop
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
export class DevServer {
  /**
   * a full system path to a JavaScript file
   *
   * @member {string} script
   * @memberof DevServer
   * @private
   * @instance
   */
  script: string;

  /**
   * optional configuration
   *
   * @member {Object} options
   * @memberof DevServer
   * @private
   * @instance
   */
  options: Object;

  /* eslint-disable require-jsdoc */
  constructor(script: string, options: DevServerConfig = {}) {
    /* eslint-enable require-jsdoc */
    this.script = script;
    this.options = {...defaultOptions, ...options};
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
  layout(): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Development server - WebCompiler</title>
    <link rel="shortcut icon" href="/favicon.ico">${
      this.options.style
        ? '\n    <link rel="stylesheet" href="/style.css">'
        : ''
    }
  </head>
  <body>
    <div id="app"></div>
    <script src="/script.js" async defer></script>
  </body>
</html>`;
  }

  /**
   * Returns the JavaScript module loaders array necessary to run the server
   *
   * @memberof DevServer
   * @private
   * @instance
   * @method loaders
   * @return {Array<string>} JavaScript module loaders
   */
  loaders(): Array<string> {
    const loaders = [];

    if (this.options.react) {
      loaders.push('react-hot');
    }
    loaders.push('babel');

    return loaders;
  }

  /**
   * Compile SASS and start watching for file changes
   *
   * @memberof DevServer
   * @instance
   * @method watchSASS
   * @example
   * server.watchSASS();
   */
  watchSASS() {
    const {style, contentBase} = this.options;

    if (!style) {
      return;
    }

    const sass = new SASSCompiler(false),
      lr = tinylr(),
      compileSASS = sass.fe.bind(sass, style, join(contentBase, 'style.css'), () => {
        lr.changed({body: {files: ['style.css']}});
      });

    lr.listen(LIVERELOAD_PORT);
    compileSASS();
    watch(cwd, 'scss', compileSASS);
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
  watchJS() {
    const {port, contentBase, configureApplication} = this.options;

    const server = new WebpackDevServer(webpack({
      cache: {},
      debug: true,
      devtool: 'eval-source-map',
      entry: [
        `webpack-dev-server/client?http://0.0.0.0:${port}`,
        'webpack/hot/only-dev-server',
        this.script
      ],
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

    server.use(serveStatic(contentBase));
    configureApplication(server.app);
    server.use((req, res) => {
      res.send(this.layout());
    });

    server.listen(port, '0.0.0.0', error => {
      if (error) {
        return console.error(error);
      }
      console.log('\x1b[32mStarted the development server at localhost:%d\x1b[0m', port);
    });
  }

  /**
   * Starts the Webpack development server, compiles SASS and starts watching for file changes
   *
   * @memberof DevServer
   * @instance
   * @method run
   * @example
   * server.run();
   */
  run() {
    this.watchJS();
    this.watchSASS();
  }

}
