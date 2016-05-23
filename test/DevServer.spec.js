/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import {SASSCompiler} from '../src/SASSCompiler';
import {WebpackDevServer, Server, HotModuleReplacementPlugin, NoErrorsPlugin} from './mock';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */
/* eslint-disable require-jsdoc */

const DEFAULT_WEB_PORT = 3000,
  WEB_PORT = 8000,
  LIVERELOAD_PORT = 35729;

let DevServer, cmp, tinylr, webpack, srv, send, watch;

function req(options) {
  return proxyquire('../src/DevServer', options).DevServer;
}

describe('DevServer', () => {

  beforeEach(() => {
    srv = new Server();
    tinylr = stub().returns(srv);
    webpack = stub().returns('the webpack module bundler');
    send = spy();
    watch = spy();
    webpack.HotModuleReplacementPlugin = HotModuleReplacementPlugin;
    webpack.NoErrorsPlugin = NoErrorsPlugin;
    stub(SASSCompiler.prototype, 'fe').callsArg(2);
    spy(SASSCompiler.prototype.fe, 'bind');
    spy(WebpackDevServer.prototype.app, 'get');
    DevServer = req({'./watch': {watch}, 'tiny-lr': tinylr, 'webpack-dev-server': WebpackDevServer, webpack});
    stub(console, 'log');
    stub(console, 'error');
  });

  afterEach(() => {
    /* @flowignore */
    SASSCompiler.prototype.fe.bind.restore();
    SASSCompiler.prototype.fe.restore();
    WebpackDevServer.prototype.app.get.restore();
    console.log.restore();
    console.error.restore();
  });

  describe('non-react', () => {

    beforeEach(() => {
      cmp = new DevServer('/path/to/a/script/file.js', '/path/to/a/style/file.scss',
                          '/path/to/the/development/directory', WEB_PORT, false);
    });

    it('assigns a port number', () => {
      expect(cmp.port).equal(WEB_PORT);
    });

    it('constructs a LiveReload server instance', () => {
      expect(cmp.lr).equal(srv);
    });

    it('binds the sass compiler', () => {
      expect(SASSCompiler.prototype.fe.bind).calledWith(match.instanceOf(SASSCompiler), '/path/to/a/style/file.scss',
                                                        '/path/to/the/development/directory/style.css', match.func);
      expect(cmp.compileSASS).a('function');
    });

    describe('invoke notifies LiveReload when SASS is recompiled', () => {

      beforeEach(() => {
        stub(cmp.lr, 'changed');
        cmp.compileSASS();
      });

      afterEach(() => {
        cmp.lr.changed.restore();
      });

      it('calls changed', () => {
        expect(cmp.lr.changed).calledWith({body: {files: ['style.css']}});
      });

    });

    it('invokes webpack', () => {
      expect(webpack).calledWith({
        cache: {},
        debug: true,
        devtool: 'eval-source-map',
        entry: [
          'webpack-dev-server/client?http://localhost:8000',
          'webpack/hot/only-dev-server',
          '/path/to/a/script/file.js'
        ],
        output: {
          path: '/path/to/the/development/directory',
          filename: 'script.js',
          publicPath: '/'
        },
        plugins: [
          match.instanceOf(HotModuleReplacementPlugin),
          match.instanceOf(NoErrorsPlugin)
        ],
        module: {
          loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: ['babel']
          }]
        }
      });
    });

    it('instantiates WebpackDevServer', () => {
      expect(cmp.server).instanceof(WebpackDevServer);
      expect(cmp.server.webpackInstance).equal('the webpack module bundler');
      expect(cmp.server.config).eql({
        contentBase: '/path/to/the/development/directory',
        publicPath: '/',
        hot: true,
        historyApiFallback: true
      });
    });

    it('creates the index route', () => {
      expect(cmp.server.app.get).calledWith('*', match.func);
      cmp.server.app.handler(null, {send});
      expect(send).calledWith(`<!DOCTYPE html>
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

  });

  describe('react', () => {

    beforeEach(() => {
      cmp = new DevServer('/path/to/a/script/file.js', '/path/to/a/style/file.scss',
                          '/path/to/the/development/directory');
    });

    it('invokes webpack', () => {
      expect(webpack).calledWith({
        cache: {},
        debug: true,
        devtool: 'eval-source-map',
        entry: [
          'webpack-dev-server/client?http://localhost:3000',
          'webpack/hot/only-dev-server',
          '/path/to/a/script/file.js'
        ],
        output: {
          path: '/path/to/the/development/directory',
          filename: 'script.js',
          publicPath: '/'
        },
        plugins: [
          match.instanceOf(HotModuleReplacementPlugin),
          match.instanceOf(NoErrorsPlugin)
        ],
        module: {
          loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: ['react-hot', 'babel']
          }]
        }
      });
    });

    describe('watchSASS', () => {

      beforeEach(() => {
        stub(cmp.lr, 'listen');
        stub(cmp, 'compileSASS');
        cmp.watchSASS('/path/to/some/directory');
      });

      afterEach(() => {
        cmp.lr.listen.restore();
        cmp.compileSASS.restore();
      });

      it('starts up LiveReload', () => {
        expect(cmp.lr.listen).calledWith(LIVERELOAD_PORT);
      });

      it('compiles SASS on start up', () => {
        expect(cmp.compileSASS).called;
      });

      it('starts up the watcher', () => {
        expect(watch).calledWith('/path/to/some/directory', 'scss', cmp.compileSASS);
      });

    });

    describe('watchJS start up error', () => {

      beforeEach(() => {
        stub(cmp.server, 'listen').callsArgWith(2, 'something bad happened');
        cmp.watchJS();
      });

      afterEach(() => {
        cmp.server.listen.restore();
      });

      it('invokes the server listen method', () => {
        expect(cmp.server.listen).calledWith(DEFAULT_WEB_PORT, '0.0.0.0', match.func);
      });

      it('prints the error on screen', () => {
        expect(console.error).calledWith('something bad happened');
      });

      it('does not print the success message', () => {
        expect(console.log).not.called;
      });

    });

    describe('watchJS success', () => {

      beforeEach(() => {
        stub(cmp.server, 'listen').callsArg(2);
        cmp.watchJS();
      });

      afterEach(() => {
        cmp.server.listen.restore();
      });

      it('does not print any errors', () => {
        expect(console.error).not.called;
      });

      it('prints the successful message', () => {
        expect(console.log).calledWith('Started the development server at localhost:3000');
      });

    });

    describe('run', () => {

      beforeEach(() => {
        stub(cmp, 'watchJS');
        stub(cmp, 'watchSASS');
        cmp.run('/path/to/some/directory');
      });

      afterEach(() => {
        cmp.watchJS.restore();
        cmp.watchSASS.restore();
      });

      it('invokes the watchJS method', () => {
        expect(cmp.watchJS).called;
      });

      it('invokes the watchSASS method', () => {
        expect(cmp.watchSASS).calledWith('/path/to/some/directory');
      });

    });

  });

});
