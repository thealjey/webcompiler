/* @flow */

/* @noflow */
import {DirectoryWatcher} from 'simple-recursive-watch';
import SASS from './SASS';
import tinylr from 'tiny-lr';
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import {join} from 'path';

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
 * var rootDir = join(__dirname, '..'),
 *     devDir = join(rootDir, 'development'),
 *     server = new DevServer(join(devDir, 'script.js'), join(devDir, 'app.scss'), devDir);
 *
 * server.run(rootDir, 'bin', 'build', 'docs', 'lib', 'node_modules', 'spec');
 * // now navigate to http://localhost:3000 using your favorite browser ( preferably Chrome :) )
 */
export default class DevServer {

  port: number;

  lr: tinylr.Server;

  compileSASS: Function;

  server: WebpackDevServer;

  constructor(script: string, style: string, devDir: string, port: number = 3000, react: boolean = true) {
    var sass = new SASS(), loaders = [];

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
    this.lr = tinylr();

    /**
     * recompiles SASS and notifies LiveReload
     *
     * @memberof DevServer
     * @private
     * @instance
     * @type {Function}
     */
    this.compileSASS = sass.feDev.bind(sass, style, join(devDir, 'style.css'), () => {
      this.lr.changed({body: {files: ['style.css']}});
    });

    /**
     * the Webpack development server
     *
     * @memberof DevServer
     * @private
     * @instance
     * @type {WebpackDevServer}
     */
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
        }]
      }
    }), {
      contentBase: devDir,
      publicPath: '/',
      hot: true,
      historyApiFallback: true
    });

    this.server.app.get('*', function (req, res) {
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
   * @param {string}    watchDir - the directory in which to watch for the changes in the SASS files
   * @param {...string} exclude  - file/directory names to exclude from watching for the changes in the SASS files
   * @example
   * server.watchSASS('/path/to/some/directory', 'node_modules', 'spec', 'docs', 'config', 'bin', 'build', 'coverage');
   */
  watchSASS(watchDir: string, ...exclude: Array<string>) {
    this.lr.listen(35729);
    this.compileSASS();
    DirectoryWatcher.watch(watchDir, 'scss', this.compileSASS, ...exclude);
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
    var port = this.port;

    this.server.listen(port, '0.0.0.0', function (e) {
      if (e) {
        return console.error(e);
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
   * @param {string}    watchDir - the directory in which to watch for the changes in the SASS files
   * @param {...string} exclude  - file/directory names to exclude from watching for the changes in the SASS files
   * @example
   * server.run('/path/to/some/directory', 'node_modules', 'spec', 'docs', 'config', 'bin', 'build', 'coverage');
   */
  run(watchDir: string, ...exclude: Array<string>) {
    this.watchJS();
    this.watchSASS(watchDir, ...exclude);
  }

}
