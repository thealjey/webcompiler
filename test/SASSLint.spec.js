/* @flow */

import chai, {expect} from 'chai';
import {spy, stub} from 'sinon';
import sinonChai from 'sinon-chai';
import {SASSLint} from '../src/SASSLint';
import {join} from 'path';
import stylelint from 'stylelint';
import * as logger from '../src/logger';

chai.use(sinonChai);

const configFile = join(__dirname, '..', '.stylelintrc.yaml'),
  error = new Error('something'),
  catchError = stub().callsArgWith(0, error);

let cmp, callback, then;

describe('SASSLint', () => {

  beforeEach(() => {
    callback = spy();
    stub(logger, 'logError');
  });

  afterEach(() => {
    /* @flowignore */
    logger.logError.restore();
  });

  describe('no errors or configOverrides', () => {

    beforeEach(() => {
      cmp = new SASSLint();
      then = stub().callsArgWith(0, {results: []}).returns({catch: catchError});
      stub(stylelint, 'lint').returns({then});
      cmp.run(['something', 'something else'], callback);
    });

    afterEach(() => {
      stylelint.lint.restore();
    });

    it('calls stylelint', () => {
      expect(stylelint.lint).calledWith({configFile, files: ['something', 'something else']});
    });

    it('calls callback', () => {
      expect(callback).calledWith(null);
    });

    it('calls logError', () => {
      expect(logger.logError).calledWith(error);
    });

  });

  describe('errors and configOverrides', () => {

    beforeEach(() => {
      cmp = new SASSLint('configuration file');
      then = stub().callsArgWith(0, {
        results: [{
          source: 'something',
          warnings: [{line: 1, column: 1, text: 'some problem (rule 1)', rule: 'rule 1'}]
        }, {
          source: 'something else',
          warnings: [{line: 2, column: 2, text: 'some other problem (rule 2)', rule: 'rule 2'}]
        }]
      }).returns({catch: catchError});
      stub(stylelint, 'lint').returns({then});
      cmp.run(['something', 'something else'], callback);
    });

    afterEach(() => {
      stylelint.lint.restore();
    });

    it('calls stylelint', () => {
      expect(stylelint.lint).calledWith({
        configFile: 'configuration file',
        files: ['something', 'something else']
      });
    });

    it('calls callback', () => {
      expect(callback).calledWith([
        {file: 'something', line: 1, column: 1, message: 'some problem', rule: 'rule 1'},
        {file: 'something else', line: 2, column: 2, message: 'some other problem', rule: 'rule 2'}
      ]);
    });

  });

});
