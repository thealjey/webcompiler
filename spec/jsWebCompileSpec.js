/* @flow */
/*global describe, beforeEach, it, expect, jasmine*/

import proxyquire from 'proxyquire';

describe('jsWebCompile', function () {
  var spy;

  beforeEach(function () {
    spy = jasmine.createSpy('spy');
  });

  describe('should pass correct options to webpack', function () {

    /* @noflow */
    var jsWebCompile;

    beforeEach(function () {
      jsWebCompile = proxyquire('../lib/jsWebCompile', {webpack: spy});
    });

    it('configures for production', function () {
      jsWebCompile('/path/to/the/input/file.js', '/path/to/the/output/file.js', Function.prototype);
      expect(spy).toHaveBeenCalledWith({
        cache: {},
        debug: true,
        devtool: 'source-map',
        entry: '/path/to/the/input/file.js',
        output: {path: '/path/to/the/output', filename: 'file.js'},
        module: {
          loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {optional: 'runtime', loose: 'all', cacheDirectory: true}
          }]
        }
      }, jasmine.any(Function));
    });

    it('configures for development', function () {
      jsWebCompile('/path/to/the/input/file.js', '/path/to/the/output/file.js', Function.prototype, true);
      expect(spy).toHaveBeenCalledWith({
        cache: {},
        debug: true,
        devtool: 'eval-source-map',
        entry: '/path/to/the/input/file.js',
        output: {path: '/path/to/the/output', filename: 'file.js'},
        module: {
          loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {optional: 'runtime', loose: 'all', cacheDirectory: true}
          }]
        }
      }, jasmine.any(Function));
    });

  });

  it('on exception', function () {
    var webpack = function (options, callback) {
          callback('something bad happened');
        },
        jsWebCompile = proxyquire('../lib/jsWebCompile', {webpack});

    jsWebCompile('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy);
    expect(spy).toHaveBeenCalledWith(['something bad happened']);
  });

  it('on compilation errors', function () {
    var webpack = function (options, callback) {
          callback(null, {
            toJson() {
              return {
                errors: ['unable', 'to compile'],
                warnings: ['because', 'of a syntax', 'error']
              };
            }
          });
        },
        jsWebCompile = proxyquire('../lib/jsWebCompile', {webpack});

    jsWebCompile('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy);
    expect(spy).toHaveBeenCalledWith(['unable', 'to compile', 'because', 'of a syntax', 'error']);
  });

  it('on compilation success', function () {
    var webpack = function (options, callback) {
          callback(null, {
            toJson() {
              return {
                errors: [],
                warnings: []
              };
            }
          });
        },
        jsWebCompile = proxyquire('../lib/jsWebCompile', {webpack});

    jsWebCompile('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy);
    expect(spy).toHaveBeenCalledWith(null);
  });

});
