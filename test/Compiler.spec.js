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

    describe('fsRead readFile error', () => {

      beforeEach(() => {
        stub(fs, 'readFile', (path, callback) => {
          callback('failed to read the script file');
        });
        cmp.fsRead('/path/to/the/output/file', callback);
      });

      afterEach(() => {
        fs.readFile.restore();
      });

      it('attempt to read script', () => {
        expect(fs.readFile).calledOnce;
        expect(fs.readFile).calledWith('/path/to/the/output/file', match.func);
      });

      it('calls the callback', () => {
        expect(callback).calledWith({code: '', map: ''});
      });

    });

    describe('fsRead readFile map error', () => {

      beforeEach(() => {
        stub(fs, 'readFile', (path, options, callback) => {
          if (/\.map$/.test(path)) {
            callback('failed to read the map file');
          } else {
            options(null, 'some code');
          }
        });
      });

      afterEach(() => {
        fs.readFile.restore();
      });

      describe('not compress', () => {

        beforeEach(() => {
          stub(zlib, 'gunzip');
          cmp.compress = false;
          cmp.fsRead('/path/to/the/output/file', callback);
        });

        afterEach(() => {
          zlib.gunzip.restore();
        });

        it('attempt to read map', () => {
          expect(fs.readFile).calledTwice;
          expect(fs.readFile).calledWith('/path/to/the/output/file.map', 'utf8', match.func);
        });

        it('calls the callback', () => {
          expect(callback).calledWith({code: 'some code', map: ''});
        });

        it('does not call gunzip', () => {
          expect(zlib.gunzip).not.called;
        });

      });

      describe('compress', () => {

        beforeEach(() => {
          cmp.compress = true;
        });

        describe('gunzip error', () => {

          beforeEach(() => {
            stub(zlib, 'gunzip').callsArgWith(1, 'failed to uncompress');
            cmp.fsRead('/path/to/the/output/file', callback);
          });

          afterEach(() => {
            zlib.gunzip.restore();
          });

          it('calls gunzip', () => {
            expect(zlib.gunzip).calledWith('some code', match.func);
          });

          it('calls the callback', () => {
            expect(callback).calledWith({code: '', map: ''});
          });

        });

        describe('gunzip success', () => {

          beforeEach(() => {
            stub(zlib, 'gunzip').callsArgWith(1, null, 'uncompressed code');
            cmp.fsRead('/path/to/the/output/file', callback);
          });

          afterEach(() => {
            zlib.gunzip.restore();
          });

          it('calls the callback', () => {
            expect(callback).calledWith({code: 'uncompressed code', map: ''});
          });

        });

      });

    });

    describe('fsRead readFile success', () => {

      beforeEach(() => {
        stub(fs, 'readFile', (path, options, callback) => {
          if (!callback) {
            callback = options;
          }
          callback(null, /\.map$/.test(path) ? 'source map' : 'some code');
        });
      });

      afterEach(() => {
        fs.readFile.restore();
      });

      describe('not compress', () => {

        beforeEach(() => {
          stub(zlib, 'gunzip');
          cmp.compress = false;
          cmp.fsRead('/path/to/the/output/file', callback);
        });

        afterEach(() => {
          zlib.gunzip.restore();
        });

        it('calls the callback', () => {
          expect(callback).calledWith({code: 'some code', map: 'source map'});
        });

        it('does not call gunzip', () => {
          expect(zlib.gunzip).not.called;
        });

      });

      describe('compress', () => {

        beforeEach(() => {
          cmp.compress = true;
        });

        describe('gunzip error', () => {

          beforeEach(() => {
            stub(zlib, 'gunzip').callsArgWith(1, 'failed to uncompress');
            cmp.fsRead('/path/to/the/output/file', callback);
          });

          afterEach(() => {
            zlib.gunzip.restore();
          });

          it('calls gunzip', () => {
            expect(zlib.gunzip).calledWith('some code', match.func);
          });

          it('calls the callback', () => {
            expect(callback).calledWith({code: '', map: 'source map'});
          });

        });

        describe('gunzip success', () => {

          beforeEach(() => {
            stub(zlib, 'gunzip').callsArgWith(1, null, 'uncompressed code');
            cmp.fsRead('/path/to/the/output/file', callback);
          });

          afterEach(() => {
            zlib.gunzip.restore();
          });

          it('calls the callback', () => {
            expect(callback).calledWith({code: 'uncompressed code', map: 'source map'});
          });

        });

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

      describe('no code', () => {

        beforeEach(() => {
          Compiler.fsWrite('/path/to/the/output/file', {code: ''}, callback);
        });

        it('calls the callback', () => {
          expect(callback).called;
        });

        it('does not call mkdir', () => {
          expect(Compiler.mkdir).not.called;
        });

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
      });

      afterEach(() => {
        zlib.gzip.restore();
      });

      describe('no code', () => {

        beforeEach(() => {
          Compiler.gzip({code: '', map: 'source map'}, callback);
        });

        it('calls the callback', () => {
          expect(callback).calledWith({code: '', map: 'source map'});
        });

        it('does not g-zip the code', () => {
          expect(zlib.gzip).not.called;
        });

      });

      describe('code', () => {

        beforeEach(() => {
          Compiler.gzip({code: 'some code', map: 'source map'}, callback);
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

    describe('save', () => {

      beforeEach(() => {
        stub(Compiler, 'writeAndCallDone');
        stub(cmp, 'fsRead').callsArgWith(1, {code: 'old code', map: 'old source map'});
        stub(Compiler, 'gzip', (data, callback) => {
          callback(data.code ? {code: 'compressed code', map: data.map} : data);
        });
      });

      afterEach(() => {
        Compiler.writeAndCallDone.restore();
        cmp.fsRead.restore();
        Compiler.gzip.restore();
      });

      describe('not compress', () => {

        beforeEach(() => {
          cmp.compress = false;
          cmp.save('/path/to/the/input/file', '/path/to/the/output/file', {code: 'some code', map: 'source map'},
                   callback);
        });

        it('calls fsRead', () => {
          expect(cmp.fsRead).calledWith('/path/to/the/output/file', match.func);
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
          cmp.save('/path/to/the/input/file', '/path/to/the/output/file', {code: 'old code', map: 'old source map'},
                   callback);
        });

        it('calls gzip', () => {
          expect(Compiler.gzip).calledWith({code: '', map: ''}, match.func);
        });

        it('calls writeAndCallDone', () => {
          expect(Compiler.writeAndCallDone).calledWith('/path/to/the/input/file', '/path/to/the/output/file',
                                                       {code: '', map: ''}, callback);
        });

      });

    });

  });

});
