/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import * as logger from '../src/logger';
import * as util from '../src/util';
import path from 'path';

chai.use(sinonChai);

/* eslint-disable require-jsdoc */
/* eslint-disable no-console */

const {Message, consoleStyles} = logger,
  {green} = consoleStyles;

let cmp;

describe('logger', () => {

  describe('Message', () => {

    beforeEach(() => {
      cmp = new Message({ansi: ['', ''], css: ''});
    });

    it('stores styles', () => {
      expect(cmp.style).eql({ansi: ['', ''], css: ''});
    });

    describe('addMessage', () => {

      it('node Message', () => {
        cmp.addMessage(green('hello'));
        expect(cmp.message).equal('\u001b[32mhello\u001b[39m');
      });

      it('node string', () => {
        cmp.addMessage('hello');
        expect(cmp.message).equal('hello');
      });

      describe('browser', () => {

        beforeEach(() => {
          /* @flowignore */
          util.isNode = false;
        });

        afterEach(() => {
          /* @flowignore */
          util.isNode = true;
        });

        it('Message', () => {
          cmp.addMessage(green('hello'));
          expect(cmp.message).equal('%chello');
          expect(cmp.styles).eql(['color: green;']);
        });

        it('string', () => {
          cmp.addMessage('hello');
          expect(cmp.message).equal('%chello');
          expect(cmp.styles).eql(['']);
        });

      });

    });

  });

  describe('formatLine', () => {

    beforeEach(() => {
      spy(logger, 'formatLine');
      logger.formatLine('message', 'file', 1, 2);
    });

    afterEach(() => {
      /* @flowignore */
      logger.formatLine.restore();
    });

    it('returns shape', () => {
      expect(logger.formatLine).returned(['"', match.instanceOf(Message), '" in ', match.instanceOf(Message), ' on ',
        match.instanceOf(Message), ':', match.instanceOf(Message)]);
    });

  });

  describe('formatErrorMarker', () => {

    beforeEach(() => {
      spy(logger, 'formatErrorMarker');
    });

    afterEach(() => {
      /* @flowignore */
      logger.formatErrorMarker.restore();
    });

    it('no message', () => {
      logger.formatErrorMarker();
      expect(logger.formatErrorMarker).returned(match.instanceOf(Message));
    });

    it('message', () => {
      logger.formatErrorMarker('message');
      expect(logger.formatErrorMarker).returned(match.instanceOf(Message));
    });

  });

  describe('logging', () => {

    beforeEach(() => {
      stub(console, 'log');
      stub(path, 'relative').returnsArg(1);
    });

    afterEach(() => {
      console.log.restore();
      path.relative.restore();
    });

    it('log', () => {
      logger.log('hello ', 'world');
      expect(console.log).calledWith('hello world');
    });

    it('logError', () => {
      /* @flowignore */
      logger.logError({
        message: 'something happened',
        stack: 'something happened\nat system.js:1:1\nat /some/local/file.js:1:1\nqwerty'
      });
      expect(console.log).calledWith(
        '\u001b[41m\u001b[1m\u001b[37mError\u001b[39m\u001b[22m\u001b[49m: something happened');
      expect(console.log).calledWith('  • "\u001b[33munknown\u001b[39m" in \u001b[36m/some/local/file.js\u001b[39m ' +
        'on \u001b[35m1\u001b[39m:\u001b[35m1\u001b[39m');
    });

    it('logSequentialSuccessMessage', () => {
      logger.logSequentialSuccessMessage('success');
      expect(console.log).calledWith('\u001b[32m1\u001b[39m\u001b[32m. \u001b[39m\u001b[32msuccess\u001b[39m');
    });

    it('logPostCSSWarnings', () => {
      logger.logPostCSSWarnings([
        {text: 'something happened', plugin: 'plugin', node: {source: {input: {file: 'file'}}}, line: 1, column: 1}
      ]);
      expect(console.log).calledWith('\u001b[41m\u001b[1m\u001b[37mWarning\u001b[39m\u001b[22m\u001b[49m: ' +
        '"\u001b[33msomething happened(plugin)\u001b[39m" in \u001b[36mfile\u001b[39m on ' +
        '\u001b[35m1\u001b[39m:\u001b[35m1\u001b[39m');
      expect(console.log).calledWith('PostCSS warnings: 1');
    });

    it('logSASSError', () => {
      logger.logSASSError({message: 'something happened', file: 'file', line: 1, column: 1});
      expect(console.log).calledWith('\u001b[41m\u001b[1m\u001b[37mSASS error\u001b[39m\u001b[22m\u001b[49m: ' +
        '"\u001b[33msomething happened\u001b[39m" in \u001b[36mfile\u001b[39m on ' +
        '\u001b[35m1\u001b[39m:\u001b[35m1\u001b[39m');
    });

    it('logLintingErrors no prefix', () => {
      logger.logLintingErrors([{message: 'something happened', rule: 'rule', file: 'file', line: 1, column: 1}]);
      expect(console.log).calledWith('\u001b[41m\u001b[1m\u001b[37mError\u001b[39m\u001b[22m\u001b[49m: ' +
        '"\u001b[33msomething happened (rule)\u001b[39m" in \u001b[36mfile\u001b[39m on ' +
        '\u001b[35m1\u001b[39m:\u001b[35m1\u001b[39m');
      expect(console.log).calledWith('Linting errors: 1');
    });

    it('logLintingErrors prefix', () => {
      logger.logLintingErrors([{message: 'something happened', file: 'file', line: 2, column: 2}], 'JS');
      expect(console.log).calledWith('\u001b[41m\u001b[1m\u001b[37mError\u001b[39m\u001b[22m\u001b[49m: ' +
        '"\u001b[33msomething happened\u001b[39m" in \u001b[36mfile\u001b[39m on ' +
        '\u001b[35m2\u001b[39m:\u001b[35m2\u001b[39m');
      expect(console.log).calledWith('JS linting errors: 1');
    });

  });

});
