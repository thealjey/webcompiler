/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import MemoryFS from 'memory-fs';
import {WebpackDevServer, DefinePlugin, OccurrenceOrderPlugin, DedupePlugin, UglifyJsPlugin, HotModuleReplacementPlugin,
  getWebpack} from './mock';

/* eslint-disable no-process-env */
/* eslint-disable require-jsdoc */

chai.use(sinonChai);

const WEB_PORT = 3000;

let webpack, webpackFn, configureApplication, server, serveStatic;

function req(options: Object = {}) {
  return proxyquire('../src/webpack', options);
}

describe('webpack', () => {

  describe('default imports', () =>  {

    beforeEach(() => {
      webpack = req();
    });

    describe('getLoaders', () => {

      beforeEach(() => {
        spy(webpack, 'getLoaders');
        webpack.getLoaders();
      });

      afterEach(() => {
        webpack.getLoaders.restore();
      });

      it('returns result', () => {
        expect(webpack.getLoaders).returned([{
          loader: 'babel',
          query: webpack.babelFEOptions
        }]);
      });

    });

    describe('getConfig', () => {

      beforeEach(() => {
        spy(webpack, 'getConfig');
        webpack.getConfig([
          'react-hot',
          {loader: 'babel', query: {something: 'here'}}
        ]);
      });

      afterEach(() => {
        webpack.getConfig.restore();
      });

      it('returns result', () => {
        expect(webpack.getConfig).returned({
          cache: {},
          debug: true,
          node: {fs: 'empty'},
          module: {
            loaders: [{
              test: /jsdom/,
              loader: 'null'
            }, {
              test: /\.js$/,
              exclude: /node_modules/,
              loader: 'react-hot!babel?something=here'
            }, {
              test: /\.json$/,
              loader: 'json'
            }]
          }
        });
      });

    });

  });

  describe('getCompiler development', () => {

    beforeEach(() => {
      webpackFn = getWebpack({webpack: 'Compiler'});
      webpack = req({webpack: webpackFn});
      spy(webpack, 'getCompiler');
      webpack.getCompiler('in', 'out/file');
    });

    afterEach(() => {
      webpack.getCompiler.restore();
    });

    it('calls webpack', () => {
      expect(webpackFn).calledWith({
        ...webpack.getConfig(webpack.getLoaders()),
        devtool: 'source-map',
        entry: ['babel-polyfill', 'in'],
        output: {path: 'out', filename: 'file', publicPath: '/'},
        plugins: []
      });
    });

    it('returns result', () => {
      expect(webpack.getCompiler).returned({
        webpack: 'Compiler',
        outputFileSystem: match.instanceOf(MemoryFS)
      });
    });

  });

  describe('getCompiler production', () => {

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      webpackFn = getWebpack({webpack: 'Compiler'});
      webpack = req({webpack: webpackFn});
      spy(webpack, 'getCompiler');
      webpack.getCompiler('in', 'out/file');
    });

    afterEach(() => {
      delete process.env.NODE_ENV;
      webpack.getCompiler.restore();
    });

    it('calls webpack', () => {
      expect(webpackFn).calledWith({
        ...webpack.getConfig(webpack.getLoaders()),
        devtool: 'source-map',
        entry: ['babel-polyfill', 'in'],
        output: {path: 'out', filename: 'file', publicPath: '/'},
        plugins: [
          match.instanceOf(DefinePlugin),
          match.instanceOf(OccurrenceOrderPlugin),
          match.instanceOf(DedupePlugin),
          match.instanceOf(UglifyJsPlugin)
        ]
      });
    });

  });

  describe('getServer', () => {

    beforeEach(() => {
      configureApplication = stub();
      serveStatic = stub().returns('serving static files');
      webpackFn = getWebpack({webpack: 'Compiler'});
      webpack = req({webpack: webpackFn, 'webpack-dev-server': WebpackDevServer, 'serve-static': serveStatic});
    });

    describe('no react', () => {

      beforeEach(() => {
        server = webpack.getServer('in', {react: false, port: WEB_PORT, contentBase: 'base', configureApplication});
      });

      it('calls webpack', () => {
        expect(webpackFn).calledWith({
          ...webpack.getConfig(webpack.getLoaders()),
          devtool: 'eval-source-map',
          entry: [
            `webpack-dev-server/client?http://0.0.0.0:${WEB_PORT}`,
            'webpack/hot/only-dev-server',
            'babel-polyfill',
            'in'
          ],
          output: {path: 'base', filename: 'script.js', publicPath: '/'},
          plugins: [match.instanceOf(HotModuleReplacementPlugin)]
        });
      });

      it('instantiates server', () => {
        expect(server.webpackInstance).eql({webpack: 'Compiler'});
        expect(server.config).eql({contentBase: false, publicPath: '/', hot: true});
      });

      it('calls serveStatic', () => {
        expect(serveStatic).calledWith('base');
      });

      it('calls server.use', () => {
        expect(server.use).calledWith('serving static files');
      });

      it('returns result', () => {
        expect(server).instanceof(WebpackDevServer);
      });

    });

    describe('react', () => {

      beforeEach(() => {
        server = webpack.getServer('in', {react: true, port: WEB_PORT, contentBase: 'base', configureApplication});
      });

      it('calls webpack', () => {
        expect(webpackFn).calledWith({
          ...webpack.getConfig(['react-hot', ...webpack.getLoaders()]),
          devtool: 'eval-source-map',
          entry: [
            `webpack-dev-server/client?http://0.0.0.0:${WEB_PORT}`,
            'webpack/hot/only-dev-server',
            'babel-polyfill',
            'in'
          ],
          output: {path: 'base', filename: 'script.js', publicPath: '/'},
          plugins: [match.instanceOf(HotModuleReplacementPlugin)]
        });
      });

    });

  });

});
