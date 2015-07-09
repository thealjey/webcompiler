/* @flow */
/*global describe, it, expect, jasmine*/

import proxyquire from 'proxyquire';

var task;

class NativeProcess {

  run: Function;

  constructor(name) {
    task = name;
  }

}

describe('jsNodeCompileDir', function () {

  it('invokes NativeProcess.run with the proper parameters', function () {
    var spy = jasmine.createSpy('spy'),
        jsNodeCompileDir,
        callback = function () {};

    NativeProcess.prototype.run = spy;
    jsNodeCompileDir = proxyquire('../lib/jsNodeCompileDir', {'./NativeProcess': NativeProcess});

    expect(task).toBe('babel');
    jsNodeCompileDir('/path/to/the/input/directory', '/path/to/the/output/directory', callback);
    expect(spy).toHaveBeenCalledWith(callback, ['/path/to/the/input/directory', '--out-dir',
                                     '/path/to/the/output/directory']);
  });

});
