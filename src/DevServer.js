/* @flow */

import {SASSCompiler} from './SASSCompiler';
import {watch} from './watch';
import tinylr from 'tiny-lr';
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import {join} from 'path';

const LIVERELOAD_PORT = 35729,
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
 * @see {@link http://webpack.github.io/docs/webpack-dev-server.html webpack-dev-server}
 * @see {@link http://gaearon.github.io/react-hot-loader/ React Hot Loader}
 * @example
 * import {DevServer} from 'webcompiler';
 * // or - import {DevServer} from 'webcompiler/lib/DevServer';
 * // or - var DevServer = require('webcompiler').DevServer;
 * // or - var DevServer = require('webcompiler/lib/DevServer').DevServer;
 * import {join} from 'path';
 *
 * const rootDir = join(__dirname, '..'),
 *     devDir = join(rootDir, 'development'),
 *     server = new DevServer(join(devDir, 'script.js'), join(devDir, 'app.scss'), devDir);
 *
 * server.run(rootDir);
 * // now navigate to http://localhost:3000 using your favorite browser ( preferably Chrome :) )
 */
export class DevServer {
  /**
   * a port at which to start the dev server
   *
   * @member {number} port
   * @memberof DevServer
   * @private
   * @instance
   */
  port: number;

  /**
   * a LiveReload server
   *
   * @member {tinylr.Server} lr
   * @memberof DevServer
   * @private
   * @instance
   */
  lr: tinylr.Server;

  /**
   * recompiles SASS and notifies LiveReload
   *
   * @method compileSASS
   * @memberof DevServer
   * @private
   * @instance
   */
  compileSASS: () => void;

  /**
   * the Webpack development server
   *
   * @member {WebpackDevServer} server
   * @memberof DevServer
   * @private
   * @instance
   */
  server: WebpackDevServer;

  /* eslint-disable require-jsdoc */
  constructor(script: string, style: string, devDir: string, port: number = WEB_PORT, react: boolean = true) {
    /* eslint-enable require-jsdoc */
    const sass = new SASSCompiler(), loaders = [];

    if (react) {
      loaders.push('react-hot');
    }
    loaders.push('babel');

    this.port = port;
    this.lr = tinylr();
    this.compileSASS = sass.fe.bind(sass, style, join(devDir, 'style.css'), () => {
      this.lr.changed({body: {files: ['style.css']}});
    });
    this.server = new WebpackDevServer(webpack({
      cache: {},
      debug: true,
      devtool: 'eval-source-map',
      entry: [
        `webpack-dev-server/client?http://localhost:${this.port}`,
        'webpack/hot/only-dev-server',
        script
      ],
      output: {
        path: devDir,
        filename: 'script.js',
        publicPath: '/'
      },
      plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
      ],
      module: {
        loaders: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loaders
        }, {
          test: /\.json$/,
          loader: 'json'
        }]
      }
    }), {
      contentBase: devDir,
      publicPath: '/',
      hot: true,
      historyApiFallback: true
    });

    this.server.app.get('*', (req, res) => {
      res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Development server - Webcompiler</title>
    <link href="/style.css" rel="stylesheet">
  </head>
  <body>
    <div id="app"></div>
    <script src="/script.js" async defer></script>
  </body>
</html>`);
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
  watchSASS(watchDir: string) {
    this.lr.listen(LIVERELOAD_PORT);
    this.compileSASS();
    watch(watchDir, 'scss', this.compileSASS);
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
    const port = this.port;

    this.server.listen(port, '0.0.0.0', error => {
      if (error) {
        return console.error(error);
      }
      console.log(`Started the development server at localhost:${port}`);
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
  run(watchDir: string) {
    this.watchJS();
    this.watchSASS(watchDir);
  }

}
