/* @flow */

import proxyquire from 'proxyquire';

describe('jsWebCompile', function () {
  let spy;

  beforeEach(function () {
    spy = jasmine.createSpy('spy');
  });

  describe('should pass correct options to webpack', function () {
    let jsWebCompile;

    beforeEach(function () {
      jsWebCompile = proxyquire('../lib/jsWebCompile', {webpack: spy});
    });

    it('configures for production', function () {
      if (!jsWebCompile) {
        return;
      }
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
            query: {
              optional: ['runtime', 'minification.deadCodeElimination', 'minification.constantFolding',
                'minification.memberExpressionLiterals', 'minification.propertyLiterals',
                'optimisation.react.inlineElements', 'optimisation.react.constantElements'],
              loose: 'all',
              cacheDirectory: true
            }
          }]
        }
      }, jasmine.any(Function));
    });

    it('configures for development', function () {
      if (!jsWebCompile) {
        return;
      }
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
            query: {optional: [], loose: 'all', cacheDirectory: true}
          }]
        }
      }, jasmine.any(Function));
    });

  });

  it('on exception', function () {
    const webpack = function (options, callback) {
          callback('something bad happened');
        },
        jsWebCompile = proxyquire('../lib/jsWebCompile', {webpack});

    jsWebCompile('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy);
    expect(spy).toHaveBeenCalledWith(['something bad happened']);
  });

  it('on compilation errors', function () {
    const webpack = function (options, callback) {
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
    const webpack = function (options, callback) {
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
