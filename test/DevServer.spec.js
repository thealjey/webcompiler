/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import {SASSCompiler} from '../src/SASSCompiler';
import {WebpackDevServer, Server, HotModuleReplacementPlugin, NoErrorsPlugin, webpackApp} from './mock';
import noop from 'lodash/noop';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */
/* eslint-disable require-jsdoc */

const WEB_PORT = 3000,
  LIVERELOAD_PORT = 35729,
  cwd = process.cwd();

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
    spy(WebpackDevServer.prototype, 'use');
    DevServer = req({'./watch': {watch}, 'tiny-lr': tinylr, 'webpack-dev-server': WebpackDevServer, webpack});
    stub(console, 'log');
    stub(console, 'error');
  });

  afterEach(() => {
    /* @flowignore */
    SASSCompiler.prototype.fe.bind.restore();
    SASSCompiler.prototype.fe.restore();
    WebpackDevServer.prototype.use.restore();
    console.log.restore();
    console.error.restore();
  });

  describe('no options', () => {

    beforeEach(() => {
      cmp = new DevServer('/path/to/a/script/file.js');
    });

    it('configures script', () => {
      expect(cmp.script).equal('/path/to/a/script/file.js');
    });

    it('configures options', () => {
      expect(cmp.options).eql({
        port: WEB_PORT,
        react: true,
        contentBase: cwd,
        configureApplication: noop
      });
    });

    describe('layout', () => {

      beforeEach(() => {
        spy(cmp, 'layout');
        cmp.layout();
      });

      afterEach(() => {
        cmp.layout.restore();
      });

      it('returns layout without style', () => {
        expect(cmp.layout).returned(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Development server - WebCompiler</title>
    <link rel="shortcut icon" href="/favicon.ico">
  </head>
  <body>
    <div id="app"></div>
    <script src="/script.js" async defer></script>
  </body>
</html>`);
      });

    });

    describe('watchSASS', () => {

      beforeEach(() => {
        cmp.watchSASS();
      });

      it('does not start up the watcher', () => {
        expect(watch).not.called;
      });

    });

    describe('run', () => {

      beforeEach(() => {
        stub(cmp, 'watchJS');
        stub(cmp, 'watchSASS');
        cmp.run();
      });

      afterEach(() => {
        cmp.watchJS.restore();
        cmp.watchSASS.restore();
      });

      it('invokes the watchJS method', () => {
        expect(cmp.watchJS).called;
      });

      it('invokes the watchSASS method', () => {
        expect(cmp.watchSASS).called;
      });

    });

  });

  describe('options', () => {

    beforeEach(() => {
      cmp = new DevServer('/path/to/a/script/file.js', {
        style: '/path/to/a/style/file.scss',
        contentBase: '/path/to/the/public/directory'
      });
    });

    describe('layout', () => {

      beforeEach(() => {
        spy(cmp, 'layout');
        cmp.layout();
      });

      afterEach(() => {
        cmp.layout.restore();
      });

      it('returns layout without style', () => {
        expect(cmp.layout).returned(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Development server - WebCompiler</title>
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="stylesheet" href="/style.css">
  </head>
  <body>
    <div id="app"></div>
    <script src="/script.js" async defer></script>
  </body>
</html>`);
      });

    });

    describe('watchSASS', () => {

      beforeEach(() => {
        stub(srv, 'listen');
        cmp.watchSASS();
      });

      afterEach(() => {
        srv.listen.restore();
      });

      it('calls tinylr', () => {
        expect(tinylr).called;
      });

      it('binds the sass compiler', () => {
        expect(SASSCompiler.prototype.fe.bind).calledWith(match.instanceOf(SASSCompiler), '/path/to/a/style/file.scss',
                                                          '/path/to/the/public/directory/style.css', match.func);
      });

      it('starts up LiveReload', () => {
        expect(srv.listen).calledWith(LIVERELOAD_PORT);
      });

      it('starts up the watcher', () => {
        expect(watch).calledWith(cwd, 'scss', match.func);
      });

    });

    describe('loaders', () => {

      beforeEach(() => {
        spy(cmp, 'loaders');
      });

      afterEach(() => {
        cmp.loaders.restore();
      });

      describe('non-react', () => {

        beforeEach(() => {
          cmp.options.react = false;
          cmp.loaders();
        });

        it('returns result', () => {
          expect(cmp.loaders).returned(['babel']);
        });

      });

      describe('react', () => {

        beforeEach(() => {
          cmp.options.react = true;
          cmp.loaders();
        });

        it('returns result', () => {
          expect(cmp.loaders).returned(['react-hot', 'babel']);
        });

      });

    });

    describe('watchJS listen error', () => {

      beforeEach(() => {
        stub(cmp, 'loaders').returns('collection of loaders');
        stub(cmp, 'layout').returns('html string');
        stub(WebpackDevServer.prototype, 'listen').callsArgWith(2, 'something bad happened');
        cmp.watchJS();
      });

      afterEach(() => {
        cmp.loaders.restore();
        cmp.layout.restore();
        WebpackDevServer.prototype.listen.restore();
      });

      it('invokes webpack', () => {
        expect(webpack).calledWith({
          cache: {},
          debug: true,
          devtool: 'eval-source-map',
          entry: [
            'webpack-dev-server/client?http://0.0.0.0:3000',
            'webpack/hot/only-dev-server',
            '/path/to/a/script/file.js'
          ],
          output: {
            path: '/path/to/the/public/directory',
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
              loaders: 'collection of loaders'
            }, {
              test: /\.json$/,
              loader: 'json'
            }]
          }
        });
      });

      it('creates the index route', () => {
        expect(WebpackDevServer.prototype.use).calledWith(match.func);
        webpackApp.handler(null, {send});
        expect(send).calledWith('html string');
      });

      it('invokes the server listen method', () => {
        expect(WebpackDevServer.prototype.listen).calledWith(cmp.options.port, '0.0.0.0', match.func);
      });

      it('prints the error on screen', () => {
        expect(console.error).calledWith('something bad happened');
      });

      it('does not print the success message', () => {
        expect(console.log).not.called;
      });

    });

    describe('watchJS listen success', () => {

      beforeEach(() => {
        stub(WebpackDevServer.prototype, 'listen').callsArg(2);
        cmp.watchJS();
      });

      afterEach(() => {
        WebpackDevServer.prototype.listen.restore();
      });

      it('does not print any errors', () => {
        expect(console.error).not.called;
      });

      it('prints the successful message', () => {
        expect(console.log).calledWith('\x1b[32mStarted the development server at localhost:%d\x1b[0m',
                                       cmp.options.port);
      });

    });

  });

});
