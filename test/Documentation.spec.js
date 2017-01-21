/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import {Documentation} from '../src/Documentation';
import {NativeProcess} from '../src/NativeProcess';
import {join} from 'path';
import fs from 'fs';
import * as logger from '../src/logger';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */

const rootDir = join(__dirname, '..'),
  cwd = process.cwd(),
  error = new Error('something happened'),
  defaultOptions = {
    inputDir: join(cwd, 'src'),
    outputDir: join(cwd, 'docs'),
    readMe: join(cwd, 'README.md'),
    template: join(cwd, 'node_modules', 'docdash'),
    jsdocConfig: join(rootDir, 'config', 'jsdoc.json')
  };

let cmp, callback, jsdoc;

describe('Documentation', () => {

  beforeEach(() => {
    callback = spy();
    stub(logger, 'logError');
  });

  afterEach(() => {
    /* @flowignore */
    logger.logError.restore();
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
        stub(jsdoc, 'run').callsArgWith(0, error);
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
        expect(logger.logError).calledWith(error);
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

    describe('findExecutable npm error', () => {

      beforeEach(() => {
        stub(NativeProcess.prototype, 'run').callsArgWith(0, error);
        stub(fs, 'stat');
        Documentation.findExecutable(callback);
      });

      afterEach(() => {
        NativeProcess.prototype.run.restore();
        fs.stat.restore();
      });

      it('calls the run method', () => {
        expect(NativeProcess.prototype.run).calledWith(match.func, ['bin']);
      });

      it('prints an error on screen', () => {
        expect(logger.logError).calledWith(error);
      });

      it('does not stat', () => {
        expect(fs.stat).not.called;
      });

    });

    describe('findExecutable npm success', () => {

      beforeEach(() => {
        stub(NativeProcess.prototype, 'run').callsArgWith(0, null, '/path/to');
      });

      afterEach(() => {
        NativeProcess.prototype.run.restore();
      });

      describe('stat error', () => {

        beforeEach(() => {
          stub(fs, 'stat').callsArgWith(1, error);
          Documentation.findExecutable(callback);
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

        it('prints an error on screen', () => {
          expect(logger.logError).calledWith(error);
        });

        it('does not call the callback', () => {
          expect(callback).not.called;
        });

      });

      describe('stat success', () => {

        beforeEach(() => {
          stub(fs, 'stat').callsArg(1);
          Documentation.findExecutable(callback);
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
