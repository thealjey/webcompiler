/* @flow */

import proxyquire from 'proxyquire';

let options;

class CleanCSS {

  minify: Function;

  constructor(o: Object) {
    options = o;
  }

}

describe('cssMin', function () {

  it('uses CleanCSS', function () {
    const spy = jasmine.createSpy('spy').and.returnValue({styles: 'some styles', sourceMap: 'some sourceMap'}),
        cssMin = proxyquire('../lib/cssMin', {'clean-css': CleanCSS});

    let result;

    CleanCSS.prototype.minify = spy;

    /* eslint-disable quotes */
    result = cssMin({code: "some css rules\nlast line", map: 'source map contents'});
    expect(options).toEqual({
      keepSpecialComments: 0,
      roundingPrecision: -1,
      sourceMap: 'source map contents',
      sourceMapInlineSources: true
    });
    expect(spy).toHaveBeenCalledWith("some css rules\nlast line");
    expect(result).toEqual({code: "some styles\nlast line", map: 'some sourceMap'});

    /* eslint-enable quotes */
  });

});
