/* @flow */

import proxyquire from 'proxyquire';
import autoprefixer from 'autoprefixer';

describe('cssAutoprefix', function () {

  it('invokes postcss properly', function () {
    const thenSpy = jasmine.createSpy('thenSpy'),
        processSpy = jasmine.createSpy('processSpy').and.returnValue({then: thenSpy}),
        spy = jasmine.createSpy('spy').and.returnValue({process: processSpy}),
        cssAutoprefix = proxyquire('../lib/cssAutoprefix', {postcss: spy});

    cssAutoprefix({code: 'some css rules', map: 'source map contents'}, '/path/to/a/file.css', Function.prototype);
    expect(spy).toHaveBeenCalledWith([autoprefixer]);
    expect(processSpy).toHaveBeenCalledWith('some css rules', {
      from: '/path/to/a/file.css',
      to: '/path/to/a/file.css',
      map: {prev: 'source map contents'}
    });
    expect(thenSpy).toHaveBeenCalledWith(jasmine.any(Function));
  });

  it('handles errors properly', function () {
    const thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
          callback({
            warnings() {
              return ['something bad happened'];
            }
          });
        }),
        processSpy = jasmine.createSpy('processSpy').and.returnValue({then: thenSpy}),
        spy = jasmine.createSpy('spy').and.returnValue({process: processSpy}),
        cssAutoprefix = proxyquire('../lib/cssAutoprefix', {postcss: spy}),
        callback = jasmine.createSpy('callback');

    cssAutoprefix({code: 'some css rules', map: 'source map contents'}, '/path/to/a/file.css', callback);
    expect(callback).toHaveBeenCalledWith(['something bad happened']);
  });

  it('handles success properly', function () {
    const thenSpy = jasmine.createSpy('thenSpy').and.callFake(function (callback) {
          callback({
            warnings() {
              return [];
            },
            css: 'some css rules',
            map: {something: 'here'}
          });
        }),
        processSpy = jasmine.createSpy('processSpy').and.returnValue({then: thenSpy}),
        spy = jasmine.createSpy('spy').and.returnValue({process: processSpy}),
        cssAutoprefix = proxyquire('../lib/cssAutoprefix', {postcss: spy}),
        callback = jasmine.createSpy('callback');

    cssAutoprefix({code: 'some css rules', map: 'source map contents'}, '/path/to/a/file.css', callback);
    expect(callback).toHaveBeenCalledWith(null, {code: 'some css rules', map: '{"something":"here"}'});
  });

});
