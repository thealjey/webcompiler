/* @flow */
/*global describe, it, expect, jasmine*/

import proxyquire from 'proxyquire';

var options;

class CleanCSS {

  minify: Function;

  constructor(o) {
    options = o;
  }

}

describe('cssMin', function () {

  it('uses CleanCSS', function () {
    var spy = jasmine.createSpy('spy').and.returnValue({styles: 'some styles', sourceMap: 'some sourceMap'}),
        cssMin = proxyquire('../lib/cssMin', {'clean-css': CleanCSS}), result;

    CleanCSS.prototype.minify = spy;

    /*eslint-disable quotes*/
    result = cssMin({code: "some css rules\nlast line", map: 'source map contents'});

    /*eslint-enable quotes*/
    expect(options).toEqual({
      keepSpecialComments: 0,
      roundingPrecision: -1,
      sourceMap: 'source map contents',
      sourceMapInlineSources: true
    });

    /*eslint-disable quotes*/
    expect(spy).toHaveBeenCalledWith("some css rules\nlast line");
    expect(result).toEqual({code: "some styles\nlast line", map: 'some sourceMap'});

    /*eslint-enable quotes*/
  });

});
