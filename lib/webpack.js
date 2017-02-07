'use strict';

exports.__esModule = true;
exports.babelFEOptions = exports.babelBEOptions = exports.isProduction = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getConfig = getConfig;
exports.getCompiler = getCompiler;
exports.getServer = getServer;

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

var _webpackDevServer = require('webpack-dev-server');

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _memoryFs = require('memory-fs');

var _memoryFs2 = _interopRequireDefault(_memoryFs);

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-process-env */

const cache = {},
      fakeFS = new _memoryFs2.default(),
      { optimize, DefinePlugin, HotModuleReplacementPlugin } = _webpack2.default,
      { OccurrenceOrderPlugin, DedupePlugin, UglifyJsPlugin } = optimize,
      productionPlugins = [new DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('production') } }), new OccurrenceOrderPlugin(), new DedupePlugin(), new UglifyJsPlugin({ compress: { warnings: false } })],
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
const isProduction = exports.isProduction = 'production' === process.env.NODE_ENV;

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
const babelBEOptions = exports.babelBEOptions = {
  presets: ['es2016', 'es2017', 'stage-2', 'react'],
  plugins: [['transform-es2015-modules-commonjs', { loose: true }]]
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
const babelFEOptions = exports.babelFEOptions = {
  cacheDirectory: true,
  presets: [['es2015', { loose: true, modules: false }], 'es2016', 'es2017', 'stage-2', 'react'],
  plugins: ['transform-runtime']
};

/**
 * Returns a webpack configuration object.
 *
 * @memberof module:webpack
 * @private
 * @method getConfig
 * @param {boolean} react - true if the react loader is needed
 * @return {Object} webpack configuration object
 */
function getConfig(react) {
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
    node: { fs: 'empty' },
    module: { loaders }
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
function getCompiler(inPath, outPath) {
  const compiler = (0, _webpack2.default)(_extends({}, getConfig(false), {
    devtool: 'source-map',
    entry: ['babel-polyfill', inPath],
    output: { path: (0, _path.dirname)(outPath), filename: (0, _path.basename)(outPath), publicPath: '/' },
    plugins: isProduction ? productionPlugins : []
  }));

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
function getServer(inPath, options) {
  const { react, port, contentBase, configureApplication } = options;

  const server = new _webpackDevServer2.default((0, _webpack2.default)(_extends({}, getConfig(react), {
    devtool: 'eval-source-map',
    entry: [`webpack-dev-server/client?http://0.0.0.0:${port}`, 'webpack/hot/only-dev-server', 'babel-polyfill', inPath],
    output: { path: contentBase, filename: 'script.js', publicPath: '/' },
    plugins: serverPlugins
  })), { contentBase: false, publicPath: '/', hot: true });

  server.use((0, _serveStatic2.default)(contentBase));
  configureApplication(server.app);

  return server;
}