/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import {SASSCompiler} from '../src/SASSCompiler';
import {Server} from './mock';
import noop from 'lodash/noop';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */
/* eslint-disable require-jsdoc */

const WEB_PORT = 3000,
  LIVERELOAD_PORT = 35729,
  error = new Error('something happened'),
  cwd = process.cwd();

let DevServer, cmp, tinylr, srv, send, watch, logError, log, green, use, listen;

function req(options: Object) {
  return proxyquire('../src/DevServer', options).DevServer;
}

describe('DevServer', () => {

  beforeEach(() => {
    srv = new Server();
    tinylr = stub().returns(srv);
    send = spy();
    watch = spy();
    use = stub().callsArgWith(0, null, {send});
    listen = stub().callsArgWith(2, error);
    logError = stub();
    log = stub();
    green = stub().returns('green text');
    stub(SASSCompiler.prototype, 'fe').callsArg(2);
    spy(SASSCompiler.prototype.fe, 'bind');
    DevServer = req({'./watch': {watch}, 'tiny-lr': tinylr, './webpack': {getServer: () => ({use, listen})},
      './logger': {logError, log, consoleStyles: {green}}});
  });

  afterEach(() => {
    /* @flowignore */
    SASSCompiler.prototype.fe.bind.restore();
    SASSCompiler.prototype.fe.restore();
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

    describe('watchJS listen error', () => {

      beforeEach(() => {
        stub(cmp, 'layout').returns('html string');
        cmp.watchJS();
      });

      afterEach(() => {
        cmp.layout.restore();
      });

      it('creates the index route', () => {
        expect(use).calledWith(match.func);
        expect(send).calledWith('html string');
      });

      it('invokes the server listen method', () => {
        expect(listen).calledWith(cmp.options.port, '0.0.0.0', match.func);
      });

      it('prints the error on screen', () => {
        expect(logError).calledWith(error);
      });

      it('does not print the success message', () => {
        expect(log).not.called;
      });

    });

    describe('watchJS listen success', () => {

      beforeEach(() => {
        listen = stub().callsArg(2);
        DevServer = req({'./webpack': {getServer: () => ({use, listen})},
          './logger': {logError, log, consoleStyles: {green}}});
        cmp = new DevServer('/path/to/a/script/file.js');
        cmp.watchJS();
      });

      it('does not print any errors', () => {
        expect(logError).not.called;
      });

      it('prints the successful message', () => {
        expect(green).calledWith('Started the development server at localhost:', cmp.options.port);
        expect(log).calledWith('green text');
      });

    });

  });

});
