/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import fs from 'fs';
import {Compiler} from '../src/Compiler';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */
/* eslint-disable no-sync */
/* eslint-disable require-jsdoc */

const files = 10,
  error = new Error('something happened');

let cmp, transformFile, isDirectory, run, JSCompiler, callback, pipe, logError, log, yellow, red, readFileSync;

function req(options: Object) {
  return proxyquire('../src/JSCompiler', options).JSCompiler;
}

describe('JSCompiler', () => {

  beforeEach(() => {
    callback = spy();
    logError = stub();
    log = stub();
    yellow = stub().returns('yellow text');
    red = stub().returns('red text');
  });

  describe('webpack exception', () => {

    beforeEach(() => {
      run = stub().callsArgWith(0, error);
      JSCompiler = req({'./webpack': {getCompiler: () => ({run})}, './logger': {logError}});
      cmp = new JSCompiler();
    });

    describe('fe', () => {

      beforeEach(() => {
        stub(cmp, 'save');
        cmp.fe('/path/to/the/input/file.js', '/path/to/the/output/file.js');
      });

      afterEach(() => {
        cmp.save.restore();
      });

      it('calls compiler.run', () => {
        expect(run).calledWith(match.func);
      });

      it('logs the error', () => {
        expect(logError).calledWith(error);
      });

      it('does not call cmp.save', () => {
        expect(cmp.save).not.called;
      });

    });

  });

  describe('webpack errors', () => {

    beforeEach(() => {
      run = stub().callsArgWith(0, null, {toJson: () => ({warnings: ['something'], errors: ['happened']})});
      JSCompiler = req({'./webpack': {getCompiler: () => ({run})}, './logger': {log, consoleStyles: {yellow, red}}});
      cmp = new JSCompiler();
    });

    describe('fe', () => {

      beforeEach(() => {
        stub(cmp, 'save');
        cmp.fe('/path/to/the/input/file.js', '/path/to/the/output/file.js');
      });

      afterEach(() => {
        cmp.save.restore();
      });

      it('logs errors', () => {
        expect(yellow).calledWith('something');
        expect(log).calledWith('yellow text');
        expect(red).calledWith('happened');
        expect(log).calledWith('red text');
      });

      it('does not call cmp.save', () => {
        expect(cmp.save).not.called;
      });

    });

  });

  describe('webpack success', () => {

    beforeEach(() => {
      run = stub().callsArgWith(0, null, {toJson: () => ({errors: [], warnings: []})});
      readFileSync = stub().returnsArg(0);
    });

    describe('no callback', () => {

      beforeEach(() => {
        JSCompiler = req({
          './webpack': {getCompiler: () => ({run, outputFileSystem: {readFileSync}})},
          './util': {isProduction: true}
        });
        cmp = new JSCompiler();
        stub(cmp, 'save');
        cmp.fe('/path/to/the/input/file.js', '/path/to/the/output/file.js');
      });

      afterEach(() => {
        cmp.save.restore();
      });

      it('calls save', () => {
        expect(cmp.save).calledWith('/path/to/the/input/file.js', '/path/to/the/output/file.js',
          {code: '/path/to/the/output/file.js', map: '/path/to/the/output/file.js.map'}, match.func);
      });

    });

    describe('callback', () => {

      beforeEach(() => {
        JSCompiler = req({
          './webpack': {getCompiler: () => ({run, outputFileSystem: {readFileSync}})},
          './util': {isProduction: false}
        });
        cmp = new JSCompiler();
        stub(cmp, 'save');
        cmp.fe('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
      });

      afterEach(() => {
        cmp.save.restore();
      });

      it('calls save', () => {
        expect(cmp.save).calledWith('/path/to/the/input/file.js', '/path/to/the/output/file.js',
          {code: '/path/to/the/output/file.js', map: ''}, callback);
      });

    });

  });

  describe('transformFile error', () => {

    beforeEach(() => {
      transformFile = stub().callsArgWith(2, error);
      JSCompiler = req({'./util': {babelBEOptions: {something: 'here'}}, 'babel-core': {transformFile},
        './logger': {logError}});
      cmp = new JSCompiler();
      stub(Compiler, 'fsWrite').callsArg(2);
      stub(Compiler, 'done');
    });

    afterEach(() => {
      Compiler.fsWrite.restore();
      Compiler.done.restore();
    });

    describe('beFile', () => {

      beforeEach(() => {
        cmp.beFile('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
      });

      it('increments processing', () => {
        expect(cmp.processing).equal(1);
      });

      it('calls transformFile', () => {
        expect(transformFile).calledWith('/path/to/the/input/file.js', {something: 'here'}, match.func);
      });

      it('logs the error', () => {
        expect(logError).calledWith(error);
      });

      it('does not write anything to disk', () => {
        expect(Compiler.fsWrite).not.called;
      });

    });

  });

  describe('transformFile success', () => {

    beforeEach(() => {
      transformFile = stub().callsArgWith(2, null, {code: 'compiled code', map: 'compiled source map'});
      JSCompiler = req({'babel-core': {transformFile}, './logger': {logError}});
      cmp = new JSCompiler();
      stub(Compiler, 'fsWrite').callsArg(2);
      stub(Compiler, 'done');
    });

    afterEach(() => {
      Compiler.fsWrite.restore();
      Compiler.done.restore();
    });

    describe('beFile', () => {

      beforeEach(() => {
        cmp.processing = 0;
        cmp.beFile('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
      });

      it('increments the processing counter', () => {
        expect(cmp.processing).equal(1);
      });

      it('calls fsWrite', () => {
        expect(Compiler.fsWrite).calledWith('/path/to/the/output/file.js',
          {code: 'compiled code', map: 'compiled source map'}, callback);
      });

    });

    describe('beDir', () => {

      beforeEach(() => {
        stub(cmp, 'beTraverse');
      });

      afterEach(() => {
        cmp.beTraverse.restore();
      });

      describe('readdir error', () => {

        beforeEach(() => {
          stub(fs, 'readdir').callsArgWith(1, error);
          cmp.beDir('/path/to/the/input/directory', '/path/to/the/output/directory', callback);
        });

        afterEach(() => {
          fs.readdir.restore();
        });

        it('calls readdir', () => {
          expect(fs.readdir).calledWith('/path/to/the/input/directory', match.func);
        });

        it('logs the error', () => {
          expect(logError).calledWith(error);
        });

        it('does not traverse the directory', () => {
          expect(cmp.beTraverse).not.called;
        });

      });

      describe('readdir success', () => {

        beforeEach(() => {
          stub(fs, 'readdir').callsArgWith(1, null, ['file1.js', 'file2.js']);
          cmp.beDir('/path/to/the/input/directory', '/path/to/the/output/directory', callback);
        });

        afterEach(() => {
          fs.readdir.restore();
        });

        it('traverses the directory', () => {
          expect(cmp.beTraverse).calledWith('/path/to/the/input/directory/file1.js',
                                            '/path/to/the/output/directory/file1.js', callback);
        });

      });

    });

    describe('copyFile', () => {

      beforeEach(() => {
        cmp.processing = 0;
        pipe = spy();
        stub(Compiler, 'mkdir').callsArg(1);
        stub(fs, 'createReadStream').returns({pipe});
        stub(fs, 'createWriteStream').returns('write stream');
        cmp.copyFile('/path/to/the/input/file.css', '/path/to/the/output/file.css', callback);
      });

      afterEach(() => {
        Compiler.mkdir.restore();
        fs.createReadStream.restore();
        fs.createWriteStream.restore();
      });

      it('increments the processing counter', () => {
        expect(cmp.processing).equal(1);
      });

      it('calls mkdir', () => {
        expect(Compiler.mkdir).calledWith('/path/to/the/output/file.css', match.func);
      });

      it('calls createReadStream', () => {
        expect(fs.createReadStream).calledWith('/path/to/the/input/file.css');
      });

      it('calls createWriteStream', () => {
        expect(fs.createWriteStream).calledWith('/path/to/the/output/file.css');
      });

      it('calls pipe', () => {
        expect(pipe).calledWith('write stream');
      });

      it('calls the callback', () => {
        expect(callback).called;
      });

    });

    describe('beTraverse', () => {

      beforeEach(() => {
        stub(cmp, 'beDir');
        stub(cmp, 'beFile');
        stub(cmp, 'copyFile');
      });

      afterEach(() => {
        cmp.beDir.restore();
        cmp.beFile.restore();
        cmp.copyFile.restore();
      });

      describe('stat error', () => {

        beforeEach(() => {
          isDirectory = spy();
          stub(fs, 'stat').callsArgWith(1, error, {isDirectory});
          cmp.beTraverse('/path/to/the/input/directory', '/path/to/the/output/directory', callback);
        });

        afterEach(() => {
          fs.stat.restore();
        });

        it('calls stat', () => {
          expect(fs.stat).calledWith('/path/to/the/input/directory', match.func);
        });

        it('logs the error', () => {
          expect(logError).calledWith(error);
        });

        it('does not call isDirectory', () => {
          expect(isDirectory).not.called;
        });

      });

      describe('stat success file', () => {

        beforeEach(() => {
          isDirectory = stub().returns(false);
          stub(fs, 'stat').callsArgWith(1, null, {isDirectory});
        });

        afterEach(() => {
          fs.stat.restore();
        });

        describe('non-javascript', () => {

          beforeEach(() => {
            cmp.beTraverse('/path/to/the/input/file.css', '/path/to/the/output/file.css', callback);
          });

          it('calls isDirectory', () => {
            expect(isDirectory).called;
          });

          it('does not call beDir', () => {
            expect(cmp.beDir).not.called;
          });

          it('does not call beFile', () => {
            expect(cmp.beFile).not.called;
          });

          it('calls copyFile', () => {
            expect(cmp.copyFile).calledWith('/path/to/the/input/file.css', '/path/to/the/output/file.css', callback);
          });

        });

        describe('javascript', () => {

          beforeEach(() => {
            cmp.beTraverse('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
          });

          it('calls beFile', () => {
            expect(cmp.beFile).calledWith('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
          });

        });

      });

      describe('stat success directory', () => {

        beforeEach(() => {
          isDirectory = stub().returns(true);
          stub(fs, 'stat').callsArgWith(1, null, {isDirectory});
          cmp.beTraverse('/path/to/the/input/directory', '/path/to/the/output/directory', callback);
        });

        afterEach(() => {
          fs.stat.restore();
        });

        it('calls beDir', () => {
          expect(cmp.beDir).calledWith('/path/to/the/input/directory', '/path/to/the/output/directory', callback);
        });

      });

    });

    describe('be', () => {

      describe('not the last file', () => {

        beforeEach(() => {
          stub(cmp, 'beTraverse').callsFake((inPath, outPath, cb) => {
            cmp.processing = files;
            cb();
          });
        });

        afterEach(() => {
          cmp.beTraverse.restore();
        });

        describe('processing', () => {

          beforeEach(() => {
            cmp.processing = 2;
            cmp.be('/path/to/the/input/file.js', '/path/to/the/output/file.js');
          });

          it('logs the error', () => {
            expect(logError).calledWith(match.instanceOf(Error));
          });

          it('does not call beTraverse', () => {
            expect(cmp.beTraverse).not.called;
          });

        });

        describe('not processing', () => {

          beforeEach(() => {
            cmp.processing = 0;
          });

          describe('emptyFn', () => {

            beforeEach(() => {
              cmp.be('/path/to/the/input/file.js', '/path/to/the/output/file.js');
            });

            it('calls beTraverse', () => {
              expect(cmp.beTraverse).calledWith('/path/to/the/input/file.js', '/path/to/the/output/file.js',
                                                match.func);
            });

          });

          describe('callback', () => {

            beforeEach(() => {
              cmp.be('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
            });

            it('decrements the processing counter', () => {
              expect(cmp.processing).equal(files - 1);
            });

            it('doe not call done', () => {
              expect(Compiler.done).not.called;
            });

          });

        });

      });

      describe('spy the last file', () => {

        beforeEach(() => {
          cmp.processing = 0;
          stub(cmp, 'beTraverse').callsFake((inPath, outPath, cb) => {
            cmp.processing = 1;
            cb();
          });
          cmp.be('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
        });

        afterEach(() => {
          cmp.beTraverse.restore();
        });

        it('decrements the processing counter', () => {
          expect(cmp.processing).equal(0);
        });

        it('calls done', () => {
          expect(Compiler.done).calledWith('/path/to/the/input/file.js', callback);
        });

      });

    });

  });

});
