/* @flow */

import NativeProcess from '../lib/NativeProcess';
import proc from 'child_process';

describe('NativeProcess', function () {

  /* @noflow */
  var np, on, stdoutOn, stderrOn, kill;

  beforeEach(function () {
    np = new NativeProcess('script');
    on = jasmine.createSpy('on');
    stdoutOn = jasmine.createSpy('on');
    stderrOn = jasmine.createSpy('on');
    kill = jasmine.createSpy('kill');
    spyOn(proc, 'spawn').and.returnValue({on, kill, stdout: {on: stdoutOn}, stderr: {on: stderrOn}});
  });

  it('calls into child_process.spawn with the correct params', function () {
    np.run(Function.prototype, ['sample', 'arguments'], {something: 'here'});
    expect(proc.spawn).toHaveBeenCalledWith('script', ['sample', 'arguments'], {something: 'here'});
  });

  it('kills the process leftover from the previous run', function () {
    np.run(Function.prototype);
    expect(kill).not.toHaveBeenCalled();
    np.run(Function.prototype);
    expect(kill).toHaveBeenCalled();
  });

  it('registers listeners', function () {
    np.run(Function.prototype);
    expect(stdoutOn).toHaveBeenCalledWith('data', jasmine.any(Function));
    expect(stderrOn).toHaveBeenCalledWith('data', jasmine.any(Function));
    expect(on).toHaveBeenCalledWith('close', jasmine.any(Function));
  });

  it('returns process response', function () {
    var callback = jasmine.createSpy('callback');

    np.run(callback);
    stdoutOn.calls.argsFor(0)[1]('sample');

    /* eslint-disable quotes */
    stdoutOn.calls.argsFor(0)[1]("\n");
    stdoutOn.calls.argsFor(0)[1]('response');
    stderrOn.calls.argsFor(0)[1]('something');
    stderrOn.calls.argsFor(0)[1](' bad ');
    stderrOn.calls.argsFor(0)[1]('happened');
    on.calls.argsFor(0)[1](1);
    expect(callback).toHaveBeenCalledWith('something bad happened', "sample\nresponse");
    on.calls.argsFor(0)[1](0);
    expect(callback).toHaveBeenCalledWith(null, "sample\nresponse");

    /* eslint-enable quotes */
  });

});
