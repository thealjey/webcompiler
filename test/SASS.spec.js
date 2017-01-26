/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import {SASS} from '../src/SASS';
import {SASSCompiler} from '../src/SASSCompiler';
import {SASSLint} from '../src/SASSLint';
import * as logger from '../src/logger';
import {join} from 'path';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */

const configFile = join(__dirname, '..', '.stylelintrc.yaml');

let cmp, callback;

describe('SASS', () => {

  beforeEach(() => {
    callback = spy();
    stub(logger, 'logLintingErrors');
  });

  afterEach(() => {
    /* @flowignore */
    logger.logLintingErrors.restore();
  });

  describe('arguments', () => {

    beforeEach(() => {
      cmp = new SASS(false, ['/path/to/a/directory'], 'configuration file', {bower: true});
    });

    it('initializes compiler', () => {
      expect(cmp.compiler.compress).false;
      expect(cmp.compiler).instanceof(SASSCompiler);
      expect(cmp.compiler.includePaths).eql([
        'node_modules/bootstrap-sass/assets/stylesheets',
        'node_modules/font-awesome/scss',
        'node_modules',
        'node_modules/bootswatch',
        '/path/to/a/directory'
      ]);
      expect(cmp.compiler.importOnce).eql({index: true, css: false, bower: true});
    });

    it('initializes linter', () => {
      expect(cmp.linter).instanceof(SASSLint);
      expect(cmp.linter.configFile).eql('configuration file');
    });

  });

  describe('no arguments', () => {

    beforeEach(() => {
      cmp = new SASS();
    });

    it('initializes compiler', () => {
      expect(cmp.compiler.includePaths).eql([
        'node_modules/bootstrap-sass/assets/stylesheets',
        'node_modules/font-awesome/scss',
        'node_modules',
        'node_modules/bootswatch'
      ]);
      expect(cmp.compiler.importOnce).eql({index: true, css: false, bower: false});
    });

    it('initializes linter', () => {
      expect(cmp.linter.configFile).eql(configFile);
    });

    describe('lint success', () => {

      beforeEach(() => {
        stub(cmp.linter, 'run').callsArg(1);
        cmp.lint(['stuff', 'to', 'lint'], callback);
      });

      afterEach(() => {
        cmp.linter.run.restore();
      });

      it('executes the linter', () => {
        expect(cmp.linter.run).calledWith(['stuff', 'to', 'lint'], match.func);
      });

      it('calls the callback', () => {
        expect(callback).called;
      });

      it('does not print anything on screen', () => {
        expect(logger.logLintingErrors).not.called;
      });

    });

    describe('lint failure', () => {

      beforeEach(() => {
        stub(cmp.linter, 'run').callsArgWith(1, 'linting errors');
        cmp.lint(['stuff', 'to', 'lint'], callback);
      });

      afterEach(() => {
        cmp.linter.run.restore();
      });

      it('prints errors on screen', () => {
        expect(logger.logLintingErrors).calledWith('linting errors');
      });

    });

    describe('fe', () => {

      beforeEach(() => {
        stub(cmp.compiler, 'fe');
        stub(cmp, 'lint').callsArg(1);
      });

      afterEach(() => {
        cmp.compiler.fe.restore();
        cmp.lint.restore();
      });

      describe('no lint paths or callback', () => {

        beforeEach(() => {
          cmp.fe('input', 'output');
        });

        it('calls lint', () => {
          expect(cmp.lint).calledWith(['input'], match.func);
        });

        it('calls compiler fe', () => {
          expect(cmp.compiler.fe).calledWith('input', 'output', match.func);
        });

      });

      describe('lint paths', () => {

        beforeEach(() => {
          cmp.fe('input', 'output', ['lint', 'this']);
        });

        it('calls lint', () => {
          expect(cmp.lint).calledWith(['lint', 'this', 'input'], match.func);
        });

      });

      describe('callback', () => {

        beforeEach(() => {
          cmp.fe('input', 'output', ['lint', 'this'], callback);
        });

        it('calls compiler fe', () => {
          expect(cmp.compiler.fe).calledWith('input', 'output', callback);
        });

      });

    });

  });

});
