/* @flow */
/*global describe, beforeEach, it, expect, spyOn*/

import jsMin from '../lib/jsMin';
import UglifyJS from 'uglify-js';

describe('jsMin', function () {

  beforeEach(function () {
    spyOn(UglifyJS, 'minify').and.returnValue({code: 'doSomething()', map: 'something here'});
  });

  it('should find a map file with the same name', function () {
    jsMin('/path/to/a/file.js');
    expect(UglifyJS.minify).toHaveBeenCalledWith('/path/to/a/file.js', {
      mangle: false,

      /*eslint-disable camelcase*/
      output: {space_colon: false},

      /*eslint-enable camelcase*/
      inSourceMap: '/path/to/a/file.js.map', outSourceMap: 'file.js.map'
    });
  });

  it('should use the specified map file', function () {
    jsMin('/path/to/a/file.js', '/path/to/a/map/file.map');
    expect(UglifyJS.minify).toHaveBeenCalledWith('/path/to/a/file.js', {
      mangle: false,

      /*eslint-disable camelcase*/
      output: {space_colon: false},

      /*eslint-enable camelcase*/
      inSourceMap: '/path/to/a/map/file.map', outSourceMap: 'file.map'
    });
  });

  it('should return the proper value', function () {
    expect(jsMin('/path/to/a/file.js')).toEqual({code: 'doSomething()', map: 'something here'});
  });

});
