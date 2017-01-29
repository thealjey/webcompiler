/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import {Documentation} from '../src/Documentation';
import {join} from 'path';
import * as logger from '../src/logger';
import * as binaryFinder from '../src/findBinary';

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
    jsdocConfig: join(rootDir, 'jsdoc.json')
  },
  options = {
    inputDir: '/path/to/the/input/directory',
    outputDir: '/path/to/the/output/directory',
    readMe: '/path/to/README.md',
    template: '/path/to/a/template/directory',
    jsdocConfig: '/path/to/jsdoc.json'
  };

let cmp, callback, run;

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
    });

    it('sets the default options', () => {
      expect(cmp.options).eql(defaultOptions);
    });

  });

  describe('options', () => {

    beforeEach(() => {
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

});
