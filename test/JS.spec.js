/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import {JS} from '../src/JS';
import {JSCompiler} from '../src/JSCompiler';
import {JSLint} from '../src/JSLint';
import * as logger from '../src/logger';
import * as binaryFinder from '../src/findBinary';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */

const error = new Error('something happened');

let cmp, callback, run;

describe('JS', () => {

  beforeEach(() => {
    callback = spy();
    stub(logger, 'logError');
    stub(logger, 'logLintingErrors');
  });

  afterEach(() => {
    /* @flowignore */
    logger.logError.restore();

    /* @flowignore */
    logger.logLintingErrors.restore();
  });

  describe('no overrides', () => {

    beforeEach(() => {
      cmp = new JS();
    });

    it('instantiates a compiler', () => {
      expect(cmp.compiler).instanceof(JSCompiler);
    });

    it('instantiates a linter', () => {
      expect(cmp.linter).instanceof(JSLint);
    });

    describe('typecheck', () => {

      describe('findBinary error', () => {

        beforeEach(() => {
          stub(binaryFinder, 'findBinary').callsArgWith(1, error);
          JS.typecheck(callback);
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

        describe('run success', () => {

          describe('typecheck failed', () => {

            beforeEach(() => {
              run = stub().callsArgWith(0, null, '{"passed": false}');
              stub(binaryFinder, 'findBinary').callsArgWith(1, null, {run});
              JS.typecheck(callback);
            });

            afterEach(() => {
              /* @flowignore */
              binaryFinder.findBinary.restore();
            });

            it('no error', () => {
              expect(logger.logError).not.called;
            });

            it('calls run', () => {
              expect(run).calledWith(match.func, [], {stdio: 'inherit'});
            });

          });

          describe('typecheck passed', () => {

            beforeEach(() => {
              run = stub().callsArgWith(0, null, '{"passed": true}');
              stub(binaryFinder, 'findBinary').callsArgWith(1, null, {run});
              JS.typecheck(callback);
            });

            afterEach(() => {
              /* @flowignore */
              binaryFinder.findBinary.restore();
            });

            it('calls callback', () => {
              expect(callback).called;
            });

          });

        });

      });

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

    describe('validate', () => {

      beforeEach(() => {
        stub(JS, 'typecheck').callsArg(0);
        stub(cmp, 'lint');
        cmp.validate('lint', ['stuff', 'to'], callback);
      });

      afterEach(() => {
        JS.typecheck.restore();
        cmp.lint.restore();
      });

      it('calls typecheck', () => {
        expect(JS.typecheck).calledWith(match.func);
      });

      it('calls lint', () => {
        expect(cmp.lint).calledWith(['stuff', 'to', 'lint'], callback);
      });

    });

    describe('be', () => {

      beforeEach(() => {
        stub(cmp.compiler, 'be');
        stub(cmp, 'validate').callsArg(2);
      });

      afterEach(() => {
        cmp.compiler.be.restore();
        cmp.validate.restore();
      });

      describe('no lint paths or callback', () => {

        beforeEach(() => {
          cmp.be('input', 'output');
        });

        it('calls validate', () => {
          expect(cmp.validate).calledWith('input', [], match.func);
        });

        it('calls compiler be', () => {
          expect(cmp.compiler.be).calledWith('input', 'output', match.func);
        });

      });

      describe('lint paths', () => {

        beforeEach(() => {
          cmp.be('input', 'output', ['lint', 'this']);
        });

        it('calls validate', () => {
          expect(cmp.validate).calledWith('input', ['lint', 'this'], match.func);
        });

      });

      describe('callback', () => {

        beforeEach(() => {
          cmp.be('input', 'output', ['lint', 'this'], callback);
        });

        it('calls compiler be', () => {
          expect(cmp.compiler.be).calledWith('input', 'output', callback);
        });

      });

    });

    describe('fe', () => {

      beforeEach(() => {
        stub(cmp.compiler, 'fe');
        stub(cmp, 'validate').callsArg(2);
      });

      afterEach(() => {
        cmp.compiler.fe.restore();
        cmp.validate.restore();
      });

      describe('no lint paths or callback', () => {

        beforeEach(() => {
          cmp.fe('input', 'output');
        });

        it('calls validate', () => {
          expect(cmp.validate).calledWith('input', [], match.func);
        });

        it('calls compiler fe', () => {
          expect(cmp.compiler.fe).calledWith('input', 'output', match.func);
        });

      });

      describe('lint paths', () => {

        beforeEach(() => {
          cmp.fe('input', 'output', ['lint', 'this']);
        });

        it('calls validate', () => {
          expect(cmp.validate).calledWith('input', ['lint', 'this'], match.func);
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

  describe('babel overrides', () => {

    beforeEach(() => {
      cmp = new JS({compress: false});
    });

    it('has the compress flag set to false', () => {
      expect(cmp.compiler.options.compress).false;
    });

  });

  describe('all overrides', () => {

    beforeEach(() => {
      cmp = new JS({compress: true}, 'configuration file');
    });

    it('instantiates a linter', () => {
      expect(cmp.linter.linter.options.configFile).eql('configuration file');
    });

  });

});
