/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import {SASS} from '../src/SASS';
import {SASSCompiler} from '../src/SASSCompiler';
import {SASSLint} from '../src/SASSLint';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */

let cmp, callback;

describe('SASS', () => {

  beforeEach(() => {
    callback = spy();
    stub(console, 'error');
  });

  afterEach(() => {
    console.error.restore();
  });

  describe('arguments', () => {

    beforeEach(() => {
      cmp = new SASS(false, ['/path/to/a/directory'], ['QualifyingElement', 'PlaceholderInExtend'], {bower: true});
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
      expect(cmp.linter.excludeLinter).equal('QualifyingElement,PlaceholderInExtend');
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
      expect(cmp.linter.excludeLinter).equal('');
    });

    describe('fe', () => {

      beforeEach(() => {
        stub(cmp.compiler, 'fe');
        stub(cmp.linter, 'run').callsArg(1);
      });

      afterEach(() => {
        cmp.compiler.fe.restore();
        cmp.linter.run.restore();
      });

      describe('no lint paths or callback', () => {

        beforeEach(() => {
          cmp.fe('input', 'output');
        });

        it('calls lint', () => {
          expect(cmp.linter.run).calledWith(['input'], match.func);
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
          expect(cmp.linter.run).calledWith(['lint', 'this', 'input'], match.func);
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
