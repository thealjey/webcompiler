/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import fs from 'fs';
import zlib from 'zlib';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */
/* eslint-disable no-process-env */
/* eslint-disable require-jsdoc */

let cmp, mkdirp, Compiler, callback;

function req(options) {
  return proxyquire('../src/Compiler', options).Compiler;
}

describe('Compiler', () => {

  beforeEach(() => {
    callback = spy();
    stub(console, 'log');
    stub(console, 'error');
  });

  afterEach(() => {
    console.log.restore();
    console.error.restore();
  });

  describe('mkdirp error', () => {

    beforeEach(() => {
      mkdirp = stub().callsArgWith(1, 'something bad happened');
      Compiler = req({mkdirp});
    });

    describe('development mode', () => {

      beforeEach(() => {
        process.env.NODE_ENV = 'development';
        cmp = new Compiler(false);
        delete process.env.NODE_ENV;
      });

      it('has the isProduction flag set to false', () => {
        expect(cmp.isProduction).false;
      });

      it('has the compress flag set to false', () => {
        expect(cmp.compress).false;
      });

      describe('mkdir', () => {

        beforeEach(() => {
          Compiler.mkdir('/path/to/the/output/file', callback);
        });

        it('calls mkdirp', () => {
          expect(mkdirp).calledWith('/path/to/the/output', match.func);
        });

        it('prints the error on screen', () => {
          expect(console.error).calledWith('something bad happened');
        });

        it('does not call the callback', () => {
          expect(callback).not.called;
        });

      });

    });

    describe('production mode', () => {

      beforeEach(() => {
        process.env.NODE_ENV = 'production';
        cmp = new Compiler();
        delete process.env.NODE_ENV;
      });

      it('has the isProduction flag set to true', () => {
        expect(cmp.isProduction).true;
      });

      it('has the compress flag set to false', () => {
        expect(cmp.compress).true;
      });

    });

  });

  describe('mkdirp success', () => {

    beforeEach(() => {
      mkdirp = stub().callsArg(1);
      Compiler = req({mkdirp});
      cmp = new Compiler();
    });

    describe('done', () => {

      beforeEach(() => {
        Compiler.done('/path/to/the/output/file', callback);
      });

      it('logs the info to stdout', () => {
        expect(console.log).calledWith('\x1b[32m%s. Compiled %s\x1b[0m', 1, '/path/to/the/output/file');
      });

      it('invokes the callback', () => {
        expect(callback).called;
      });

    });

    describe('writeAndCallDone', () => {

      beforeEach(() => {
        stub(Compiler, 'fsWrite').callsArg(2);
        stub(Compiler, 'done');
        Compiler.writeAndCallDone('/path/to/the/input/file', '/path/to/the/output/file',
                             {code: 'some code', map: 'source map'}, callback);
      });

      afterEach(() => {
        Compiler.fsWrite.restore();
        Compiler.done.restore();
      });

      it('calls fsWrite', () => {
        expect(Compiler.fsWrite).calledWith('/path/to/the/output/file', {code: 'some code', map: 'source map'},
                                            match.func);
      });

      it('calls done', () => {
        expect(Compiler.done).calledWith('/path/to/the/input/file', callback);
      });

    });

    describe('mkdir', () => {

      beforeEach(() => {
        Compiler.mkdir('/path/to/the/output/file', callback);
      });

      it('does not print any errors on screen', () => {
        expect(console.error).not.called;
      });

      it('calls the callback', () => {
        expect(callback).called;
      });

    });

    describe('fsWrite', () => {

      beforeEach(() => {
        stub(Compiler, 'mkdir').callsArg(1);
      });

      afterEach(() => {
        Compiler.mkdir.restore();
      });

      describe('script write error', () => {

        beforeEach(() => {
          stub(fs, 'writeFile').callsArgWith(2, 'failed to write script');
          Compiler.fsWrite('/path/to/the/output/file', {code: 'some code'}, callback);
        });

        afterEach(() => {
          fs.writeFile.restore();
        });

        it('calls mkdir', () => {
          expect(Compiler.mkdir).calledWith('/path/to/the/output/file', match.func);
        });

        it('attempt to write the script file', () => {
          expect(fs.writeFile).calledWith('/path/to/the/output/file', 'some code', match.func);
        });

        it('prints the error on screen', () => {
          expect(console.error).calledWith('failed to write script');
        });

        it('does not call the callback', () => {
          expect(callback).not.called;
        });

      });

      describe('no map', () => {

        beforeEach(() => {
          stub(fs, 'writeFile').callsArg(2);
          Compiler.fsWrite('/path/to/the/output/file', {code: 'some code'}, callback);
        });

        afterEach(() => {
          fs.writeFile.restore();
        });

        it('calls the callback', () => {
          expect(callback).called;
        });

        it('does not write the map file', () => {
          expect(fs.writeFile).calledOnce;
        });

      });

      describe('map error', () => {

        beforeEach(() => {
          stub(fs, 'writeFile', (path, data, cb) => {
            cb('/path/to/the/output/file.map' === path ? 'failed to write map' : null);
          });
          Compiler.fsWrite('/path/to/the/output/file', {code: 'some code', map: 'source map'}, callback);
        });

        afterEach(() => {
          fs.writeFile.restore();
        });

        it('attempt to write the map file', () => {
          expect(fs.writeFile).calledWith('/path/to/the/output/file.map', 'source map', match.func);
        });

        it('prints the error on screen', () => {
          expect(console.error).calledWith('failed to write map');
        });

        it('does not call the callback', () => {
          expect(callback).not.called;
        });

      });

      describe('map', () => {

        beforeEach(() => {
          stub(fs, 'writeFile').callsArg(2);
          Compiler.fsWrite('/path/to/the/output/file', {code: 'some code', map: 'source map'}, callback);
        });

        afterEach(() => {
          fs.writeFile.restore();
        });

        it('writes both files', () => {
          expect(fs.writeFile).calledTwice;
        });

        it('calls the callback', () => {
          expect(callback).called;
        });

      });

    });

    describe('gzip error', () => {

      beforeEach(() => {
        stub(zlib, 'gzip').callsArgWith(1, 'failed to compress');
        Compiler.gzip({code: 'some code', map: 'source map'}, callback);
      });

      afterEach(() => {
        zlib.gzip.restore();
      });

      it('g-zips the code', () => {
        expect(zlib.gzip).calledWith('some code', match.func);
      });

      it('prints the error on screen', () => {
        expect(console.error).calledWith('failed to compress');
      });

      it('does not call the callback', () => {
        expect(callback).not.called;
      });

    });

    describe('gzip success', () => {

      beforeEach(() => {
        stub(zlib, 'gzip').callsArgWith(1, null, 'compressed code');
        Compiler.gzip({code: 'some code', map: 'source map'}, callback);
      });

      afterEach(() => {
        zlib.gzip.restore();
      });

      it('calls the callback', () => {
        expect(callback).calledWith({code: 'compressed code', map: 'source map'});
      });

    });

    describe('optimize', () => {

      beforeEach(() => {
        stub(Compiler, 'writeAndCallDone');
        stub(Compiler, 'gzip').callsArgWith(1, {code: 'compressed code', map: 'source map'});
      });

      afterEach(() => {
        Compiler.writeAndCallDone.restore();
        Compiler.gzip.restore();
      });

      describe('not compress', () => {

        beforeEach(() => {
          cmp.compress = false;
          cmp.optimize('/path/to/the/input/file', '/path/to/the/output/file',
                       {code: 'some code', map: 'source map'}, callback);
        });

        it('calls writeAndCallDone', () => {
          expect(Compiler.writeAndCallDone).calledWith('/path/to/the/input/file', '/path/to/the/output/file',
                                                  {code: 'some code', map: 'source map'}, callback);
        });

        it('does not call gzip', () => {
          expect(Compiler.gzip).not.called;
        });

      });

      describe('compress', () => {

        beforeEach(() => {
          cmp.compress = true;
          cmp.optimize('/path/to/the/input/file', '/path/to/the/output/file',
                       {code: 'some code', map: 'source map'}, callback);
        });

        it('calls gzip', () => {
          expect(Compiler.gzip).calledWith({code: 'some code', map: 'source map'}, match.func);
        });

        it('calls writeAndCallDone', () => {
          expect(Compiler.writeAndCallDone).calledWith('/path/to/the/input/file', '/path/to/the/output/file',
                                                  {code: 'compressed code', map: 'source map'}, callback);
        });

      });

    });

  });

});
