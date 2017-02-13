/* @flow */

import type {DevServerConfig} from './typedef';
import {SASSCompiler} from './SASSCompiler';
import {logError, log, consoleStyles} from './logger';
import {livereload} from './livereload';
import {watch} from './watch';
import {getServer} from './webpack';
import {join} from 'path';
import noop from 'lodash/noop';

const WEB_PORT = 3000,
  cwd = process.cwd(),
  {green} = consoleStyles,
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
   * Compile SASS and start watching for file changes
   *
   * @memberof DevServer
   * @instance
   * @method watchSASS
   */
  watchSASS() {
    const {style, contentBase} = this.options;

    if (!style) {
      return;
    }

    const sass = new SASSCompiler(false),
      lr = livereload(),
      compileSASS = sass.fe.bind(sass, style, join(contentBase, 'style.css'), () => {
        lr('/style.css');
      });

    compileSASS();
    watch(cwd, 'scss', compileSASS);
  }

  /**
   * Starts the Webpack development server
   *
   * @memberof DevServer
   * @instance
   * @method watchJS
   */
  watchJS() {
    const {port} = this.options,
      server = getServer(this.script, this.options);

    server.use((req, res) => {
      res.send(this.layout());
    });

    server.listen(port, '0.0.0.0', error => {
      if (error) {
        return logError(error);
      }
      log(green('Started the development server at localhost:', port));
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
