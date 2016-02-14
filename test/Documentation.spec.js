/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import {Documentation} from '../src/Documentation';
import {NativeProcess} from '../src/NativeProcess';
import {join} from 'path';
import fs from 'fs';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */

const rootDir = join(__dirname, '..'),
  cwd = process.cwd(),
  defaultOptions = {
    inputDir: join(cwd, 'src'),
    outputDir: join(cwd, 'docs'),
    readMe: join(cwd, 'README.md'),
    template: join(cwd, 'node_modules', 'ink-docstrap', 'template'),
    jsdocConfig: join(rootDir, 'config', 'jsdoc.json')
  };

let cmp, callback, jsdoc;

describe('Documentation', () => {

  beforeEach(() => {
    callback = spy();
    stub(console, 'error');
  });

  afterEach(() => {
    console.error.restore();
  });

  describe('no options', () => {

    beforeEach(() => {
      cmp = new Documentation();
      jsdoc = new NativeProcess('/path/to/jsdoc');
    });

    it('sets the default options', () => {
      expect(cmp.options).eql(defaultOptions);
    });

  });

  describe('inputDir specified', () => {

    beforeEach(() => {
      cmp = new Documentation({inputDir: '/path/to/the/input/directory'});
    });

    it('sets inputDir', () => {
      expect(cmp.options.inputDir).equal('/path/to/the/input/directory');
    });

  });

  describe('outputDir specified', () => {

    beforeEach(() => {
      cmp = new Documentation({outputDir: '/path/to/the/output/directory'});
    });

    it('sets outputDir', () => {
      expect(cmp.options.outputDir).equal('/path/to/the/output/directory');
    });

  });

  describe('readMe specified', () => {

    beforeEach(() => {
      cmp = new Documentation({readMe: '/path/to/README.md'});
    });

    it('sets readMe', () => {
      expect(cmp.options.readMe).equal('/path/to/README.md');
    });

  });

  describe('template specified', () => {

    beforeEach(() => {
      cmp = new Documentation({template: '/path/to/a/template/directory'});
    });

    it('sets the default options', () => {
      expect(cmp.options.template).equal('/path/to/a/template/directory');
    });

  });

  describe('all options specified', () => {

    beforeEach(() => {
      cmp = new Documentation({
        inputDir: '/path/to/the/input/directory',
        outputDir: '/path/to/the/output/directory',
        readMe: '/path/to/README.md',
        template: '/path/to/a/template/directory',
        jsdocConfig: '/path/to/jsdoc.json'
      });
    });

    it('sets jsdocConfig', () => {
      expect(cmp.options.jsdocConfig).equal('/path/to/jsdoc.json');
    });

    describe('run no executable', () => {

      beforeEach(() => {
        stub(Documentation, 'findExecutable').callsArgWith(0, '/path/to/jsdoc');
        stub(cmp, 'doRun');
        cmp.run();
      });

      afterEach(() => {
        Documentation.findExecutable.restore();
        cmp.doRun.restore();
      });

      it('calls findExecutable', () => {
        expect(Documentation.findExecutable).calledWith(match.func);
      });

      it('instantiates the jsdoc executable', () => {
        expect(cmp.jsdoc).instanceof(NativeProcess);

        /* @flowignore */
        expect(cmp.jsdoc.task).equal('/path/to/jsdoc');
      });

      it('calls doRun', () => {
        expect(cmp.doRun).calledOnce;
        expect(cmp.doRun).calledWith(cmp.jsdoc, match.func);
      });

      describe('executable available', () => {

        beforeEach(() => {
          cmp.run(callback);
        });

        it('calls doRun', () => {
          expect(cmp.doRun).calledTwice;
          expect(cmp.doRun).calledWith(cmp.jsdoc, callback);
        });

      });

    });

    describe('doDun error', () => {

      beforeEach(() => {
        stub(jsdoc, 'run').callsArgWith(0, 'failed to generate the documentation');
        cmp.doRun(jsdoc, callback);
      });

      afterEach(() => {
        jsdoc.run.restore();
      });

      it('runs the jsdoc task', () => {
        expect(jsdoc.run).calledWith(match.func, ['/path/to/the/input/directory', '-d', '/path/to/the/output/directory',
          '-R', '/path/to/README.md', '-c', cmp.options.jsdocConfig, '-t', cmp.options.template]);
      });

      it('prints the error on screen', () => {
        expect(console.error).calledWith('failed to generate the documentation');
      });

      it('does not call the callback', () => {
        expect(callback).not.called;
      });

    });

    describe('doRun success', () => {

      beforeEach(() => {
        stub(jsdoc, 'run').callsArg(0);
        cmp.doRun(jsdoc, callback);
      });

      afterEach(() => {
        jsdoc.run.restore();
      });

      it('invokes the callback', () => {
        expect(callback).called;
      });

    });

    describe('findExecutable local file found', () => {

      beforeEach(() => {
        stub(Documentation, 'checkBin').callsArgWith(0, '/path/to/local/jsdoc');
        Documentation.findExecutable(callback);
      });

      afterEach(() => {
        Documentation.checkBin.restore();
      });

      it('checks the local executable path', () => {
        expect(Documentation.checkBin).calledOnce;
        expect(Documentation.checkBin).calledWith(match.func);
      });

      it('calls the callback', () => {
        expect(callback).calledWith('/path/to/local/jsdoc');
      });

    });

    describe('findExecutable global file found', () => {

      beforeEach(() => {
        stub(Documentation, 'checkBin', (cb, globalPackage) => {
          cb(globalPackage ? '/path/to/global/jsdoc' : null);
        });
        Documentation.findExecutable(callback);
      });

      afterEach(() => {
        Documentation.checkBin.restore();
      });

      it('checks the local executable path', () => {
        expect(Documentation.checkBin).calledTwice;
        expect(Documentation.checkBin).calledWith(match.func, true);
      });

      it('calls the callback', () => {
        expect(callback).calledWith('/path/to/global/jsdoc');
      });

      it('does not print any errors on screen', () => {
        expect(console.error).not.called;
      });

    });

    describe('findExecutable nothing found', () => {

      beforeEach(() => {
        stub(Documentation, 'checkBin').callsArg(0);
        Documentation.findExecutable(callback);
      });

      afterEach(() => {
        Documentation.checkBin.restore();
      });

      it('prints an error on screen', () => {
        expect(console.error).calledWith('Failed to locate the jsdoc executable');
      });

    });

    describe('checkBin npm error', () => {

      beforeEach(() => {
        stub(NativeProcess.prototype, 'run').callsArgWith(0, 'something bad happened');
        stub(fs, 'stat');
        Documentation.checkBin(callback, true);
      });

      afterEach(() => {
        NativeProcess.prototype.run.restore();
        fs.stat.restore();
      });

      it('calls the run method', () => {
        expect(NativeProcess.prototype.run).calledWith(match.func, ['bin', '-g']);
      });

      it('prints an error on screen', () => {
        expect(console.error).calledWith('something bad happened');
      });

      it('calls callback', () => {
        expect(callback).calledWith(null);
      });

      it('does not stat', () => {
        expect(fs.stat).not.called;
      });

    });

    describe('checkBin npm success', () => {

      beforeEach(() => {
        stub(NativeProcess.prototype, 'run').callsArgWith(0, null, '/path/to');
      });

      afterEach(() => {
        NativeProcess.prototype.run.restore();
      });

      describe('stat error', () => {

        beforeEach(() => {
          stub(fs, 'stat').callsArgWith(1, 'cannot read the file');
          Documentation.checkBin(callback);
        });

        afterEach(() => {
          fs.stat.restore();
        });

        it('calls the run method', () => {
          expect(NativeProcess.prototype.run).calledWith(match.func, ['bin']);
        });

        it('calls stat', () => {
          expect(fs.stat).calledWith('/path/to/jsdoc', match.func);
        });

        it('calls callback', () => {
          expect(callback).calledWith(null);
        });

      });

      describe('stat success', () => {

        beforeEach(() => {
          stub(fs, 'stat').callsArg(1);
          Documentation.checkBin(callback);
        });

        afterEach(() => {
          fs.stat.restore();
        });

        it('calls callback', () => {
          expect(callback).calledWith('/path/to/jsdoc');
        });

      });

    });

  });

});
