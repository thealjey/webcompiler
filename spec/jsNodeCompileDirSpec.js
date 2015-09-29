/* @flow */

import proxyquire from 'proxyquire';

let task;

class NativeProcess {

  run: Function;

  constructor(name: string) {
    task = name;
  }

}

describe('jsNodeCompileDir', function () {

  it('invokes NativeProcess.run with the proper parameters', function () {
    const spy = jasmine.createSpy('spy'), callback = function () {};

    let jsNodeCompileDir;

    NativeProcess.prototype.run = spy;
    jsNodeCompileDir = proxyquire('../lib/jsNodeCompileDir', {'./NativeProcess': NativeProcess});

    expect(task).toBe('babel');
    jsNodeCompileDir('/path/to/the/input/directory', '/path/to/the/output/directory', callback);
    expect(spy).toHaveBeenCalledWith(callback, ['/path/to/the/input/directory', '--out-dir',
                                     '/path/to/the/output/directory']);
  });

});
