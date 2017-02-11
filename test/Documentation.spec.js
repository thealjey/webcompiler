/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import {join} from 'path';
import * as logger from '../src/logger';
import * as binaryFinder from '../src/findBinary';
import proxyquire from 'proxyquire';
import {Server} from './mock';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */
/* eslint-disable require-jsdoc */

function req(options: Object = {}) {
  return proxyquire('../src/Documentation', options).Documentation;
}

const rootDir = join(__dirname, '..'),
  cwd = process.cwd(),
  LIVERELOAD_PORT = 35729,
  error = new Error('something happened'),
  defaultOptions = {
    inputDir: join(cwd, 'src'),
    outputDir: join(cwd, 'docs'),
    readMe: join(cwd, 'README.md'),
    template: join(cwd, 'node_modules', 'docdash'),
    jsdocConfig: join(rootDir, 'jsdoc.json')
  },
  options = {
    inputDir: '/path/to/the/input/directory',
    outputDir: '/path/to/the/output/directory',
    readMe: '/path/to/README.md',
    template: '/path/to/a/template/directory',
    jsdocConfig: '/path/to/jsdoc.json'
  };

let cmp, callback, run,  Documentation, tinylr, srv, watch;

describe('Documentation', () => {

  beforeEach(() => {
    callback = spy();
    stub(logger, 'logError');
    stub(logger, 'logSequentialSuccessMessage');
  });

  afterEach(() => {
    /* @flowignore */
    logger.logError.restore();

    /* @flowignore */
    logger.logSequentialSuccessMessage.restore();
  });

  describe('no options', () => {

    beforeEach(() => {
      Documentation = req();
      cmp = new Documentation();
    });

    it('sets the default options', () => {
      expect(cmp.options).eql(defaultOptions);
    });

  });

  describe('options', () => {

    beforeEach(() => {
      Documentation = req();
      cmp = new Documentation(options);
    });

    it('sets jsdocConfig', () => {
      expect(cmp.options).eql(options);
    });

  });

  describe('findBinary error', () => {

    beforeEach(() => {
      stub(binaryFinder, 'findBinary').callsArgWith(1, error);
      cmp.run(callback);
    });

    afterEach(() => {
      /* @flowignore */
      binaryFinder.findBinary.restore();
    });

    it('logs error', () => {
      expect(logger.logError).calledWith(error);
    });

  });

  describe('findBinary success', () => {

    describe('run error', () => {

      beforeEach(() => {
        run = stub().callsArgWith(0, error);
        stub(binaryFinder, 'findBinary').callsArgWith(1, null, {run});
        cmp.run(callback);
      });

      afterEach(() => {
        /* @flowignore */
        binaryFinder.findBinary.restore();
      });

      it('calls run', () => {
        const {inputDir, outputDir, readMe, template, jsdocConfig} = cmp.options;

        expect(run).calledWith(match.func,
          [inputDir, '-d', outputDir, '-R', readMe, '-c', jsdocConfig, '-t', template]);
      });

      it('logs error', () => {
        expect(logger.logError).calledWith(error);
      });

      it('does not call callback', () => {
        expect(callback).not.called;
      });

    });

    describe('run success', () => {

      beforeEach(() => {
        run = stub().callsArg(0);
        stub(binaryFinder, 'findBinary').callsArgWith(1, null, {run});
        cmp.run(callback);
      });

      afterEach(() => {
        /* @flowignore */
        binaryFinder.findBinary.restore();
      });

      it('no error', () => {
        expect(logger.logError).not.called;
      });

      it('calls callback', () => {
        expect(callback).called;
      });

    });

  });

  describe('watch', () => {

    beforeEach(() => {
      watch = stub().callsArg(2);
      srv = new Server();
      tinylr = stub().returns(srv);
      Documentation = req({'tiny-lr': tinylr, './watch': {watch}});
      cmp = new Documentation();
      stub(cmp, 'run').callsArg(0);
      cmp.watch(callback);
    });

    afterEach(() => {
      cmp.run.restore();
    });

    it('starts up LiveReload', () => {
      expect(srv.listen).calledWith(LIVERELOAD_PORT);
    });

    it('starts up the watcher', () => {
      expect(watch).calledWith(cmp.options.inputDir, 'js', match.func);
    });

    it('calls run', () => {
      expect(cmp.run).calledWith(match.func);
      expect(cmp.run).calledWith(callback);
    });

    it('calls callback', () => {
      expect(callback).calledTwice;
    });

    it('notifies LiveReload', () => {
      expect(srv.changed).calledWith({body: {files: '*'}});
    });

  });

});
