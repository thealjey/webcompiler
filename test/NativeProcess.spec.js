/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import {NativeProcess} from '../src/NativeProcess';
import proc from 'child_process';
import constant from 'lodash/constant';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */

let cmp, callback, on, kill, stdoutOn, stderrOn, errorResult;

describe('NativeProcess', () => {

  beforeEach(() => {
    callback = spy();
    cmp = new NativeProcess('script');
  });

  it('sets the task prop', () => {
    expect(cmp.task).equal('script');
  });

  describe('stderrToError plain error message', () => {

    beforeEach(() => {
      errorResult = NativeProcess.stderrToError('something is wrong');
    });

    it('returns result', () => {
      expect(errorResult.name).equal('Error');
      expect(errorResult.message).equal('something is wrong');
    });

  });

  describe('stderrToError matches format of `Error.prototype.toString()`', () => {

    beforeEach(() => {
      errorResult = NativeProcess.stderrToError(`Something unusable SyntaxError: something is wrong again
    at <anonymous>:1:1`);
    });

    it('returns result', () => {
      expect(errorResult.name).equal('SyntaxError');
      expect(errorResult.message).equal('something is wrong again');
      expect(errorResult.stack).equal(`SyntaxError: something is wrong again
    at <anonymous>:1:1`);
    });

  });

  describe('run', () => {

    describe('already running', () => {

      beforeEach(() => {
        cmp.proc = 'something';
        cmp.run(callback);
      });

      it('returns an error', () => {
        expect(callback).calledWith(match.instanceOf(Error));
      });

    });

    describe('no std', () => {

      describe('close error', () => {

        beforeEach(() => {
          on = spy((event, cb) => {
            cb('close' === event ? 1 : {toString: constant('something bad happened')});
          });
          stub(proc, 'spawn').returns({on});
          cmp.run(callback);
        });

        afterEach(() => {
          proc.spawn.restore();
        });

        it('calls spawn', () => {
          expect(proc.spawn).calledWith(cmp.task, [], {});
        });

        it('calls on', () => {
          expect(on).calledWith('error', match.func);
          expect(on).calledWith('close', match.func);
        });

        it('clears the proc prop', () => {
          expect(cmp.proc).null;
        });

        it('calls callback', () => {
          expect(callback).calledWith(match.instanceOf(Error), '');
        });

      });

      describe('close success', () => {

        beforeEach(() => {
          on = spy((event, cb) => {
            cb('close' === event ? 0 : {toString: constant('something bad happened')});
          });
          stub(proc, 'spawn').returns({on});
          cmp.run(callback);
        });

        afterEach(() => {
          proc.spawn.restore();
        });

        it('calls callback', () => {
          expect(callback).calledWith(null, '');
        });

      });

    });

    describe('std', () => {

      beforeEach(() => {
        stdoutOn = stub().callsArgWith(1, 'the standard output');
        stderrOn = stub().callsArgWith(1, 'something is wrong');
        on = spy((event, cb) => {
          cb('close' === event ? 1 : {toString: constant('something bad happened')});
        });
        stub(proc, 'spawn').returns({on, stdout: {on: stdoutOn}, stderr: {on: stderrOn}});
        cmp.run();
      });

      afterEach(() => {
        proc.spawn.restore();
      });

      it('calls stdout.on', () => {
        expect(stdoutOn).calledWith('data', match.func);
      });

      it('calls stderr.on', () => {
        expect(stderrOn).calledWith('data', match.func);
      });

      describe('arguments', () => {

        beforeEach(() => {
          cmp.run(callback, ['params', 'here'], {some: 'options'});
        });

        it('calls spawn', () => {
          expect(proc.spawn).calledWith(cmp.task, ['params', 'here'], {some: 'options'});
        });

        it('calls callback', () => {
          expect(callback).calledWith(match.instanceOf(Error), 'the standard output');
        });

      });

    });

  });

  describe('kill', () => {

    beforeEach(() => {
      kill = spy();
      cmp.proc = {kill};
      cmp.kill();
    });

    it('calls kill', () => {
      expect(kill).called;
    });

    it('clears proc', () => {
      expect(cmp.proc).null;
    });

    describe('second invocation will have no effect', () => {

      beforeEach(() => {
        cmp.kill();
      });

      it('does not call kill', () => {
        expect(kill).calledOnce;
      });

    });

  });

});
