/* @flow */

import proxyquire from 'proxyquire';
import NativeProcess from '../lib/NativeProcess';
import JSLint from '../lib/JSLint';
import zlib from 'zlib';
import fs from 'fs';

describe('JS', function () {
  var jsMin;

  beforeEach(function () {
    jsMin = jasmine.createSpy('jsMin').and.returnValue({code: 'minified code', map: 'source map'});
  });

  describe('overrides', function () {

    /* @noflow */
    var cmp, JS;

    beforeEach(function () {
      JS = require('../lib/JS');

      /* @noflow */
      cmp = new JS({complexity: [2, 4]});
    });

    it('configures Flow', function () {
      expect(cmp.flow).toEqual(jasmine.any(NativeProcess));
      expect(cmp.flow.task).toBe('flow');
    });

    it('configures ESLint', function () {
      expect(cmp.linter).toEqual(jasmine.any(JSLint));
      expect(cmp.linter.linter.options.rules).toEqual(jasmine.objectContaining({
        complexity: [2, 4]
      }));
    });

  });

  describe('no overrides', function () {
    var spy;

    beforeEach(function () {
      spyOn(console, 'log');
      spyOn(console, 'error');
      spy = jasmine.createSpy('spy');
    });

    describe('original dependencies', function () {

      /* @noflow */
      var JS, cmp;

      beforeEach(function () {
        JS = require('../lib/JS');

        /* @noflow */
        cmp = new JS();
      });

      describe('flow errors', function () {

        beforeEach(function () {
          spyOn(cmp.linter, 'run');
        });

        describe('flow exception', function () {

          beforeEach(function () {
            spyOn(cmp.flow, 'run').and.callFake(function (callback) {
              callback('something bad happened');
            });
            cmp.validate('/path/to/a/file.js', ['/lint/this/directory/too'], Function.prototype);
          });

          it('runs the typechecker', function () {
            expect(cmp.flow.run).toHaveBeenCalledWith(jasmine.any(Function));
          });

          it('prints the exception on screen', function () {
            expect(console.error).toHaveBeenCalledWith('something bad happened');
          });

          it('does not run the linter', function () {
            expect(cmp.linter.run).not.toHaveBeenCalled();
          });

        });

        describe('flow failure to typecheck', function () {

          beforeEach(function () {
            spyOn(cmp.flow, 'run').and.callFake(function (callback) {
              callback(null, 'invalid code');
            });
            cmp.validate('/path/to/a/file.js', ['/lint/this/directory/too'], Function.prototype);
          });

          it('prints the exception on screen', function () {
            expect(console.error).toHaveBeenCalledWith('invalid code');
          });

          it('does not run the linter', function () {
            expect(cmp.linter.run).not.toHaveBeenCalled();
          });

        });

      });

      describe('flow success', function () {

        beforeEach(function () {
          spyOn(cmp.flow, 'run').and.callFake(function (callback) {
            callback(null, 'No errors!');
          });
        });

        describe('linter failure', function () {

          beforeEach(function () {
            spyOn(cmp.linter, 'run').and.callFake(function (paths, callback) {
              callback([
                {message: 'error message', ruleId: 'rule id', filePath: 'some file', line: 3, column: 2},
                {message: 'error other message', filePath: 'some other file', line: 12, column: 5}
              ]);
            });
            cmp.validate('/path/to/a/file.js', ['/lint/this/directory/too'], spy);
          });

          it('runs the linter', function () {
            expect(cmp.linter.run).toHaveBeenCalledWith(['/lint/this/directory/too', '/path/to/a/file.js'],
                                                        jasmine.any(Function));
          });

          it('logs the error to console', function () {
            expect(console.log).toHaveBeenCalledWith(
              '\x1b[41mESLint error\x1b[0m "\x1b[33m%s%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
              'error message', ' (rule id)', 'some file', 3, 2);
            expect(console.log).toHaveBeenCalledWith(
              '\x1b[41mESLint error\x1b[0m "\x1b[33m%s%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
              'error other message', '', 'some other file', 12, 5);
          });

          it('does not invoke the callback', function () {
            expect(spy).not.toHaveBeenCalled();
          });

        });

        describe('linter success', function () {

          beforeEach(function () {
            spyOn(cmp.linter, 'run').and.callFake(function (paths, callback) {
              callback();
            });
            cmp.validate('/path/to/a/file.js', ['/lint/this/directory/too'], spy);
          });

          it('invokes the callback', function () {
            expect(spy).toHaveBeenCalled();
          });

        });

      });

      describe('feDev', function () {

        beforeEach(function () {
          spyOn(cmp, 'webCompile');
          cmp.feDev('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy);
        });

        it('calls webCompile', function () {
          expect(cmp.webCompile).toHaveBeenCalledWith('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy,
                                                      true);
        });

      });

    });

    describe('jsWebCompile errors', function () {
      var cmp, jsWebCompile, JS, errors = ['something', 'bad', 'happened'];

      beforeEach(function () {
        spyOn(errors, 'forEach').and.callThrough();
        jsWebCompile = jasmine.createSpy('jsWebCompile').and.callFake(function (inPath, outPath, callback) {
          callback(errors);
        });
        JS = proxyquire('../lib/JS', {'./jsWebCompile': jsWebCompile});
        cmp = new JS();
        cmp.webCompile('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy, true);
      });

      it('invokes jsWebCompile', function () {
        expect(jsWebCompile).toHaveBeenCalledWith('/path/to/the/input/file.js', '/path/to/the/output/file.js',
                                                  jasmine.any(Function), true);
      });

      it('loops though errors', function () {
        expect(errors.forEach).toHaveBeenCalledWith(jasmine.any(Function));
        expect(console.error).toHaveBeenCalledWith('something');
        expect(console.error).toHaveBeenCalledWith('bad');
        expect(console.error).toHaveBeenCalledWith('happened');
      });

      it('does not log the successful message', function () {
        expect(console.log).toHaveBeenCalledWith('JavaScript compilation errors: %s', 3);
        expect(console.log).not.toHaveBeenCalledWith('\x1b[32m%s. Compiled %s\x1b[0m', 1, '/path/to/the/input/file.js');
      });

      it('does not invoke the callback', function () {
        expect(spy).not.toHaveBeenCalled();
      });

    });

    describe('jsWebCompile success', function () {
      var cmp, jsWebCompile, JS;

      beforeEach(function () {
        jsWebCompile = jasmine.createSpy('jsWebCompile').and.callFake(function (inPath, outPath, callback) {
          callback();
        });
        JS = proxyquire('../lib/JS', {'./jsWebCompile': jsWebCompile});
        cmp = new JS();
        cmp.webCompile('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy, '/lint/this/directory/too',
                       true);
      });

      it('logs successful message', function () {
        expect(console.log).toHaveBeenCalledWith('\x1b[32m%s. Compiled %s\x1b[0m', 1, '/path/to/the/input/file.js');
      });

      it('invokes the callback', function () {
        expect(spy).toHaveBeenCalled();
      });

    });

    describe('feProd', function () {

      /* @noflow */
      var cmp, JS;

      beforeEach(function () {
        JS = proxyquire('../lib/JS', {'./jsMin': jsMin});
        cmp = new JS();
        spyOn(cmp, 'validate').and.callFake(function (inPath, lintPaths, callback) {
          callback();
        });
        spyOn(cmp, 'webCompile').and.callFake(function (inPath, outPath, callback) {
          callback();
        });
      });

      describe('GZIP failure', function () {

        beforeEach(function () {
          spyOn(fs, 'writeFile');
          spyOn(zlib, 'gzip').and.callFake(function (input, callback) {
            callback('GZIP exception');
          });
          cmp.feProd('/path/to/the/input/file.js', '/path/to/the/output/file.js', Function.prototype,
                     '/lint/this/directory/too');
        });

        it('calls the validate method', function () {
          expect(cmp.validate).toHaveBeenCalledWith('/path/to/the/input/file.js', ['/lint/this/directory/too'],
                                                    jasmine.any(Function));
        });

        it('calls the webCompile method', function () {
          expect(cmp.webCompile).toHaveBeenCalledWith('/path/to/the/input/file.js', '/path/to/the/output/file.js',
                                                      jasmine.any(Function), false);
        });

        it('calls jsMin', function () {
          expect(jsMin).toHaveBeenCalledWith('/path/to/the/output/file.js');
        });

        it('calls zlib.gzip', function () {
          expect(zlib.gzip).toHaveBeenCalledWith('minified code', jasmine.any(Function));
        });

        it('prints the exception on screen', function () {
          expect(console.error).toHaveBeenCalledWith('GZIP exception');
        });

        it('does not write anything to disk', function () {
          expect(fs.writeFile).not.toHaveBeenCalled();
        });

      });

      describe('GZIP success', function () {

        beforeEach(function () {
          spyOn(zlib, 'gzip').and.callFake(function (input, callback) {
            callback(null, 'GZIPed program');
          });
        });

        describe('script writeFile failure', function () {

          beforeEach(function () {
            spyOn(fs, 'writeFile').and.callFake(function (name, content, callback) {
              callback('failed to write to disk');
            });
            cmp.feProd('/path/to/the/input/file.js', '/path/to/the/output/file.js', Function.prototype,
                       '/lint/this/directory/too');
          });

          it('writes the script to disk', function () {
            expect(fs.writeFile).toHaveBeenCalledWith('/path/to/the/output/file.js', 'GZIPed program',
                                                      jasmine.any(Function));
          });

          it('prints the exception on screen', function () {
            expect(console.error).toHaveBeenCalledWith('failed to write to disk');
          });

          it('does not write the map file', function () {
            expect(fs.writeFile).not.toHaveBeenCalledWith('/path/to/the/output/file.js.map', 'source map',
                                                          jasmine.any(Function));
          });

        });

        describe('map writeFile failure', function () {

          beforeEach(function () {
            spyOn(fs, 'writeFile').and.callFake(function (name, content, callback) {
              callback('/path/to/the/output/file.js' === name ? null : 'failed to write the map to disk');
            });
            cmp.feProd('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy, '/lint/this/directory/too');
          });

          it('writes the map to disk', function () {
            expect(fs.writeFile).toHaveBeenCalledWith('/path/to/the/output/file.js.map', 'source map',
                                                      jasmine.any(Function));
          });

          it('prints the exception on screen', function () {
            expect(console.error).toHaveBeenCalledWith('failed to write the map to disk');
          });

          it('does not invoke the callback', function () {
            expect(spy).not.toHaveBeenCalled();
          });

        });

        describe('writeFile success', function () {

          beforeEach(function () {
            spyOn(fs, 'writeFile').and.callFake(function (name, content, callback) {
              callback();
            });
            cmp.feProd('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy, '/lint/this/directory/too');
          });

          it('logs successful message', function () {
            expect(console.log).toHaveBeenCalledWith('\x1b[32m%s. Optimized for production %s\x1b[0m', 1,
                                                     '/path/to/the/input/file.js');
          });

          it('invokes the callback', function () {
            expect(spy).toHaveBeenCalled();
          });

        });

      });

    });

    describe('jsNodeCompileFile errors', function () {

      /* @noflow */
      var cmp, JS, jsNodeCompileFile, mkdirp;

      beforeEach(function () {
        mkdirp = jasmine.createSpy('mkdirp');
        jsNodeCompileFile = jasmine.createSpy('jsNodeCompileFile').and.callFake(function (inPath, callback) {
          callback('something bad happened');
        });
        JS = proxyquire('../lib/JS', {'./jsNodeCompileFile': jsNodeCompileFile, mkdirp});
        cmp = new JS();
        spyOn(cmp, 'validate').and.callFake(function (inPath, lintPaths, callback) {
          callback();
        });
        cmp.beFile('/path/to/the/input/file.js', '/path/to/the/output/file.js', Function.prototype,
                   '/lint/this/directory/too');
      });

      it('calls the validate method', function () {
        expect(cmp.validate).toHaveBeenCalledWith('/path/to/the/input/file.js', ['/lint/this/directory/too'],
                                                  jasmine.any(Function));
      });

      it('invokes jsNodeCompileFile', function () {
        expect(jsNodeCompileFile).toHaveBeenCalledWith('/path/to/the/input/file.js', jasmine.any(Function));
      });

      it('prints the exception on screen', function () {
        expect(console.error).toHaveBeenCalledWith('something bad happened');
      });

      it('does not call mkdirp', function () {
        expect(mkdirp).not.toHaveBeenCalled();
      });

    });

    describe('jsNodeCompileFile success', function () {
      var jsNodeCompileFile;

      beforeEach(function () {
        jsNodeCompileFile = jasmine.createSpy('jsNodeCompileFile').and.callFake(function (inPath, callback) {
          callback(null, 'compiled program code');
        });
      });

      describe('mkdirp failure', function () {
        var cmp, JS, mkdirp;

        beforeEach(function () {
          spyOn(fs, 'writeFile');
          mkdirp = jasmine.createSpy('mkdirp').and.callFake(function (path, callback) {
            callback('something bad happened');
          });
          JS = proxyquire('../lib/JS', {'./jsNodeCompileFile': jsNodeCompileFile, mkdirp});
          cmp = new JS();
          spyOn(cmp, 'validate').and.callFake(function (inPath, lintPaths, callback) {
            callback();
          });
          cmp.beFile('/path/to/the/input/file.js', '/path/to/the/output/file.js', Function.prototype,
                     '/lint/this/directory/too');
        });

        it('invokes mkdirp', function () {
          expect(mkdirp).toHaveBeenCalledWith('/path/to/the/output', jasmine.any(Function));
        });

        it('prints the exception on screen', function () {
          expect(console.error).toHaveBeenCalledWith('something bad happened');
        });

        it('does not write anything to disk', function () {
          expect(fs.writeFile).not.toHaveBeenCalled();
        });

      });

      describe('mkdirp success', function () {

        /* @noflow */
        var cmp, JS, mkdirp;

        beforeEach(function () {
          mkdirp = jasmine.createSpy('mkdirp').and.callFake(function (path, callback) {
            callback();
          });
          JS = proxyquire('../lib/JS', {'./jsNodeCompileFile': jsNodeCompileFile, mkdirp});
          cmp = new JS();
          spyOn(cmp, 'validate').and.callFake(function (inPath, lintPaths, callback) {
            callback();
          });
        });

        describe('writeFile failure', function () {

          beforeEach(function () {
            spyOn(fs, 'writeFile').and.callFake(function (name, content, callback) {
              callback('failed to write to disk');
            });
            cmp.beFile('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy, '/lint/this/directory/too');
          });

          it('invokes fs.writeFile', function () {
            expect(fs.writeFile).toHaveBeenCalledWith('/path/to/the/output/file.js', 'compiled program code',
                                                      jasmine.any(Function));
          });

          it('prints the exception on screen', function () {
            expect(console.error).toHaveBeenCalledWith('failed to write to disk');
          });

          it('does not invoke the callback', function () {
            expect(spy).not.toHaveBeenCalled();
          });

        });

        describe('writeFile success', function () {

          beforeEach(function () {
            spyOn(fs, 'writeFile').and.callFake(function (name, content, callback) {
              callback();
            });
            cmp.beFile('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy, '/lint/this/directory/too');
          });

          it('logs successful message', function () {
            expect(console.log).toHaveBeenCalledWith('\x1b[32m%s. Compiled %s\x1b[0m', 1, '/path/to/the/input/file.js');
          });

          it('invokes the callback', function () {
            expect(spy).toHaveBeenCalled();
          });

        });

      });

    });

    describe('jsNodeCompileDir errors', function () {

      /* @noflow */
      var cmp, JS, jsNodeCompileDir;

      beforeEach(function () {
        jsNodeCompileDir = jasmine.createSpy('jsNodeCompileDir').and.callFake(function (inPath, outPath, callback) {
          callback('something bad happened');
        });
        JS = proxyquire('../lib/JS', {'./jsNodeCompileDir': jsNodeCompileDir});
        cmp = new JS();
        spyOn(cmp, 'validate').and.callFake(function (inPath, lintPaths, callback) {
          callback();
        });
        cmp.beDir('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy, '/lint/this/directory/too');
      });

      it('calls the validate method', function () {
        expect(cmp.validate).toHaveBeenCalledWith('/path/to/the/input/file.js', ['/lint/this/directory/too'],
                                                  jasmine.any(Function));
      });

      it('invokes jsNodeCompileDir', function () {
        expect(jsNodeCompileDir).toHaveBeenCalledWith('/path/to/the/input/file.js', '/path/to/the/output/file.js',
                                                      jasmine.any(Function));
      });

      it('prints the exception on screen', function () {
        expect(console.error).toHaveBeenCalledWith('something bad happened');
      });

      it('does not invoke the callback', function () {
        expect(spy).not.toHaveBeenCalled();
      });

    });

    describe('jsNodeCompileDir success', function () {
      var cmp, JS, jsNodeCompileDir;

      beforeEach(function () {
        jsNodeCompileDir = jasmine.createSpy('jsNodeCompileDir').and.callFake(function (inPath, outPath, callback) {
          callback();
        });
        JS = proxyquire('../lib/JS', {'./jsNodeCompileDir': jsNodeCompileDir});
        cmp = new JS();
        spyOn(cmp, 'validate').and.callFake(function (inPath, lintPaths, callback) {
          callback();
        });
        cmp.beDir('/path/to/the/input/file.js', '/path/to/the/output/file.js', spy, '/lint/this/directory/too');
      });

      it('logs successful message', function () {
        expect(console.log).toHaveBeenCalledWith('\x1b[32m%s. Compiled %s\x1b[0m', 1, '/path/to/the/input/file.js');
      });

      it('invokes the callback', function () {
        expect(spy).toHaveBeenCalled();
      });

    });

  });

});
