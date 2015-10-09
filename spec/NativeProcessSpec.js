/* @flow */

import NativeProcess from '../lib/NativeProcess';
import proc from 'child_process';

describe('NativeProcess', function () {
  let np, on, stdoutOn, stderrOn, kill;

  beforeEach(function () {
    np = new NativeProcess('script');
    on = jasmine.createSpy('on');
    stdoutOn = jasmine.createSpy('on');
    stderrOn = jasmine.createSpy('on');
    kill = jasmine.createSpy('kill');
  });

  describe('no std', function () {

    beforeEach(function () {
      spyOn(proc, 'spawn').and.returnValue({on, kill});
    });

    it('kills the process leftover from the previous run', function () {
      if (!np) {
        return;
      }
      np.run(Function.prototype);
      expect(kill).not.toHaveBeenCalled();
      np.run(Function.prototype);
      expect(kill).toHaveBeenCalled();
    });

    describe('sample arguments', function () {

      beforeEach(function () {
        if (!np) {
          return;
        }
        np.run(Function.prototype, ['sample', 'arguments'], {something: 'here'});
      });

      it('calls into child_process.spawn with the correct params', function () {
        expect(proc.spawn).toHaveBeenCalledWith('script', ['sample', 'arguments'], {something: 'here'});
      });

      it('doesn\'t call stdoutOn', function () {
        expect(stdoutOn).not.toHaveBeenCalled();
      });

      it('doesn\'t call stderrOn', function () {
        expect(stderrOn).not.toHaveBeenCalled();
      });

      it('registers a close listener', function () {
        expect(on).toHaveBeenCalledWith('close', jasmine.any(Function));
      });

    });

    it('returns process response', function () {
      if (!on || !np) {
        return;
      }
      const callback = jasmine.createSpy('callback');

      np.run(callback);
      on.calls.argsFor(0)[1](1);
      expect(callback).toHaveBeenCalledWith('', '');
      on.calls.argsFor(0)[1](0);
      expect(callback).toHaveBeenCalledWith(null, '');
    });

  });

  describe('no stderr', function () {

    beforeEach(function () {
      spyOn(proc, 'spawn').and.returnValue({on, kill, stdout: {on: stdoutOn}});
    });

    it('calls stdoutOn', function () {
      if (!np) {
        return;
      }
      np.run(Function.prototype, ['sample', 'arguments'], {something: 'here'});
      expect(stdoutOn).toHaveBeenCalledWith('data', jasmine.any(Function));
    });

    it('returns process response', function () {
      if (!np || !stdoutOn || !on) {
        return;
      }
      const callback = jasmine.createSpy('callback');

      np.run(callback);
      stdoutOn.calls.argsFor(0)[1]('sample');

      /* eslint-disable quotes */
      stdoutOn.calls.argsFor(0)[1]("\n");
      stdoutOn.calls.argsFor(0)[1]('response');
      on.calls.argsFor(0)[1](1);
      expect(callback).toHaveBeenCalledWith('', "sample\nresponse");
      on.calls.argsFor(0)[1](0);
      expect(callback).toHaveBeenCalledWith(null, "sample\nresponse");

      /* eslint-enable quotes */
    });

  });

  describe('no stdout', function () {

    beforeEach(function () {
      spyOn(proc, 'spawn').and.returnValue({on, kill, stderr: {on: stderrOn}});
    });

    it('calls stderrOn', function () {
      if (!np) {
        return;
      }
      np.run(Function.prototype, ['sample', 'arguments'], {something: 'here'});
      expect(stderrOn).toHaveBeenCalledWith('data', jasmine.any(Function));
    });

    it('returns process response', function () {
      if (!stderrOn || !on || !np) {
        return;
      }
      const callback = jasmine.createSpy('callback');

      np.run(callback);
      stderrOn.calls.argsFor(0)[1]('something');
      stderrOn.calls.argsFor(0)[1](' bad ');
      stderrOn.calls.argsFor(0)[1]('happened');
      on.calls.argsFor(0)[1](1);
      expect(callback).toHaveBeenCalledWith('something bad happened', '');
      on.calls.argsFor(0)[1](0);
      expect(callback).toHaveBeenCalledWith(null, '');
    });

  });

});
