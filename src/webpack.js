/* @flow */

import type {JSCompilerConfig} from './typedef';
import webpack from 'webpack';
import {dirname, basename} from 'path';
import WebpackDevServer from 'webpack-dev-server';
import MemoryFS from 'memory-fs';
import serveStatic from 'serve-static';
import {isProduction, babelFEOptions} from './util';

/* eslint-disable no-process-env */

const cache = {},
  fakeFS = new MemoryFS(),
  {optimize: {OccurrenceOrderPlugin, DedupePlugin, UglifyJsPlugin}, DefinePlugin, HotModuleReplacementPlugin} = webpack,
  productionPlugins = [
    new DefinePlugin({'process.env': {NODE_ENV: JSON.stringify('production')}}),
    new OccurrenceOrderPlugin(),
    new DedupePlugin(),
    new UglifyJsPlugin({compress: {warnings: false}})
  ],
  serverPlugins = [new HotModuleReplacementPlugin()];

/**
 * Webpack helpers. Mostly for internal use.
 *
 * You can use it to tweak the Babel options.
 *
 * @module webpack
 * @private
 */

/**
 * Returns a webpack configuration object.
 *
 * @memberof module:webpack
 * @private
 * @method getConfig
 * @param {boolean} react - true if the react loader is needed
 * @return {Object} webpack configuration object
 */
export function getConfig(react: boolean): Object {
  const loaders = [{
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'babel',
    query: babelFEOptions
  }, {
    test: /\.json$/,
    loader: 'json'
  }, {
    test: /jsdom/,
    loader: 'null'
  }];

  if (react) {
    loaders.unshift({
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'react-hot'
    });
  }

  return {
    cache,
    debug: true,
    node: {fs: 'empty'},
    module: {loaders},

    // temporary hack while `react-hot-loader` v3 is not out
    resolve: {
      alias: {
        'react/lib/ReactMount': 'react-dom/lib/ReactMount'
      }
    }
  };
}

/**
 * Returns a webpack Compiler instance.
 *
 * @memberof module:webpack
 * @private
 * @method getCompiler
 * @param {string}           inPath  - the path to an input file
 * @param {string}           outPath - the path to an output file
 * @param {JSCompilerConfig} options - configuration object
 * @return {Object} webpack Compiler instance
 */
export function getCompiler(inPath: string, outPath: string, {library, libraryTarget}: JSCompilerConfig): Object {
  const compiler = webpack({
    ...getConfig(false),
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    entry: ['babel-polyfill', inPath],
    output: {path: dirname(outPath), filename: basename(outPath), publicPath: '/', library, libraryTarget},
    plugins: isProduction ? productionPlugins : []
  });

  compiler.outputFileSystem = fakeFS;

  return compiler;
}

/**
 * Returns a webpack development server instance.
 *
 * @memberof module:webpack
 * @private
 * @method getServer
 * @param {string}          inPath  - the path to an input file
 * @param {DevServerConfig} options - a config object
 * @return {Object} an instance of the webpack development server
 */
export function getServer(inPath: string, {react, port, contentBase, configureApplication}: DevServerConfig) {
  const server = new WebpackDevServer(webpack({
    ...getConfig(react),
    devtool: 'eval-source-map',
    entry: [
      `webpack-dev-server/client?http://0.0.0.0:${port}`,
      'webpack/hot/only-dev-server',
      'babel-polyfill',
      inPath
    ],
    output: {path: contentBase, filename: 'script.js', publicPath: '/'},
    plugins: serverPlugins
  }), {contentBase: false, publicPath: '/', hot: true});

  server.use(serveStatic(contentBase));
  configureApplication(server.app);

  return server;
}
