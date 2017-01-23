/* @flow */

import webpack from 'webpack';
import {dirname, basename} from 'path';
import combineLoaders from 'webpack-combine-loaders';
import WebpackDevServer from 'webpack-dev-server';
import MemoryFS from 'memory-fs';
import serveStatic from 'serve-static';

/* eslint-disable no-process-env */

const cache = {},
  fakeFS = new MemoryFS(),
  {optimize, DefinePlugin, HotModuleReplacementPlugin} = webpack,
  {OccurrenceOrderPlugin, DedupePlugin, UglifyJsPlugin} = optimize,
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
 */

/**
 * `true` if the `NODE_ENV` environment variable is set to `'production'`
 *
 * @memberof module:webpack
 * @constant {boolean} isProduction
 */
export const isProduction = 'production' === process.env.NODE_ENV;

/**
 * Babel configuration for the Node.js.
 *
 * @memberof module:webpack
 * @member {Object} babelBEOptions
 * @example
 * import {babelBEOptions} from 'webcompiler';
 * // or - import {babelBEOptions} from 'webcompiler/lib/webpack';
 * // or - var babelBEOptions = require('webcompiler').babelBEOptions;
 * // or - var babelBEOptions = require('webcompiler/lib/webpack').babelBEOptions;
 *
 * babelFEOptions.presets.push('my-custom-preset');
 */
export const babelBEOptions = {
  presets: ['es2016', 'es2017', 'stage-2', 'react'],
  plugins: [
    ['transform-es2015-modules-commonjs', {loose: true}]
  ]
};

/**
 * Babel configuration for the browser.
 *
 * @memberof module:webpack
 * @member {Object} babelFEOptions
 * @example
 * import {babelFEOptions} from 'webcompiler';
 * // or - import {babelFEOptions} from 'webcompiler/lib/webpack';
 * // or - var babelFEOptions = require('webcompiler').babelFEOptions;
 * // or - var babelFEOptions = require('webcompiler/lib/webpack').babelFEOptions;
 *
 * babelFEOptions.presets.push('my-custom-preset');
 */
export const babelFEOptions = {
  cacheDirectory: true,
  presets: [
    ['es2015', {loose: true, modules: false}],
    'es2016', 'es2017', 'stage-2', 'react'
  ],
  plugins: ['transform-runtime']
};

/**
 * Returns the default set of JavaScript loaders.
 *
 * @memberof module:webpack
 * @private
 * @method getLoaders
 * @return {Array<string | Object>} webpack JavaScript loaders
 */
export function getLoaders(): Array<string | Object> {
  return [{
    loader: 'babel',
    query: babelFEOptions
  }];
}

/**
 * Returns a webpack configuration object.
 *
 * @memberof module:webpack
 * @private
 * @method getConfig
 * @param {Array<string | Object>} loaders - the JavaScript loaders array
 * @return {Object} webpack configuration object
 */
export function getConfig(loaders: Array<string | Object>): Object {
  return {
    cache,
    debug: true,
    node: {fs: 'empty'},
    module: {
      loaders: [{
        test: /jsdom/,
        loader: 'null'
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: combineLoaders(loaders)
      }, {
        test: /\.json$/,
        loader: 'json'
      }]
    }
  };
}

/**
 * Returns a webpack Compiler instance.
 *
 * @memberof module:webpack
 * @private
 * @method getCompiler
 * @param {string} inPath  - the path to an input file
 * @param {string} outPath - the path to an output file
 * @return {Object} webpack Compiler instance
 */
export function getCompiler(inPath: string, outPath: string): Object {
  const compiler = webpack({
    ...getConfig(getLoaders()),
    devtool: 'source-map',
    entry: ['babel-polyfill', inPath],
    output: {path: dirname(outPath), filename: basename(outPath), publicPath: '/'},
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
export function getServer(inPath: string, options: Object) {
  const {react, port, contentBase, configureApplication} = options,
    loaders = getLoaders();

  if (react) {
    loaders.unshift('react-hot');
  }

  const server = new WebpackDevServer(webpack({
    ...getConfig(loaders),
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
