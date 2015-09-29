/* @flow */

import proxyquire from 'proxyquire';

describe('jsNodeCompileFile', function () {
  let spy;

  beforeEach(function () {
    spy = jasmine.createSpy('spy');
  });

  it('calls the babel.transformFile function with the proper parameters', function () {
    const jsNodeCompileFile = proxyquire('../lib/jsNodeCompileFile', {babel: {transformFile: spy}});

    jsNodeCompileFile('/path/to/a/script/file.js', Function.prototype);
    expect(spy).toHaveBeenCalledWith('/path/to/a/script/file.js', {loose: 'all', optional: ['runtime']},
                                     jasmine.any(Function));
  });

  it('responds with an error', function () {
    const jsNodeCompileFile = proxyquire('../lib/jsNodeCompileFile', {babel: {
      transformFile(scriptFile, options, callback) {
        callback('something bad has happened');
      }
    }});

    jsNodeCompileFile('/path/to/a/script/file.js', spy);
    expect(spy).toHaveBeenCalledWith('something bad has happened');
  });

  it('returns processed output properly', function () {
    const jsNodeCompileFile = proxyquire('../lib/jsNodeCompileFile', {babel: {
      transformFile(scriptFile, options, callback) {
        callback(null, {code: `/* @flow */

doSomething();`});
      }
    }});

    jsNodeCompileFile('/path/to/a/script/file.js', spy);
    expect(spy).toHaveBeenCalledWith(null, 'doSomething();');
  });

});
