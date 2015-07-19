/* @flow */
/*global describe, beforeEach, it, expect, jasmine, spyOn*/

import proxyquire from 'proxyquire';
import SASSLint from '../lib/SASSLint';
import SASSCompile from '../lib/SASSCompile';
import zlib from 'zlib';
import fs from 'fs';

describe('SASS', function () {
  var cssMin;

  beforeEach(function () {
    cssMin = jasmine.createSpy('cssMin').and.returnValue({code: 'minified code', map: 'source map'});
  });

  describe('overrides', function () {

    /* @noflow */
    var cmp, SASS;

    beforeEach(function () {
      SASS = require('../lib/SASS');

      /* @noflow */
      cmp = new SASS(['QualifyingElement', 'PlaceholderInExtend'], {bower: true}, ['/path/to/scss/files']);
    });

    it('configures SASSLint', function () {
      expect(cmp.linter).toEqual(jasmine.any(SASSLint));
      expect(cmp.linter.excludeLinter).toBe('QualifyingElement,PlaceholderInExtend');
    });

    it('configures SASSCompile', function () {
      expect(cmp.compiler).toEqual(jasmine.any(SASSCompile));
      expect(cmp.compiler.importOnce).toEqual({index: true, css: false, bower: true});
      expect(cmp.compiler.includePaths).toEqual(['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules',
                                                 '/path/to/scss/files']);
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
      var SASS, cmp;

      beforeEach(function () {
        SASS = require('../lib/SASS');

        /* @noflow */
        cmp = new SASS();
      });

      describe('validate linter error', function () {

        beforeEach(function () {
          spyOn(cmp.linter, 'run').and.callFake(function (paths, callback) {
            callback('something bad happened');
          });
          cmp.validate('/path/to/a/file.scss', ['/lint/this/directory/too'], spy);
        });

        it('runs the linter', function () {
          expect(cmp.linter.run).toHaveBeenCalledWith(['/lint/this/directory/too', '/path/to/a/file.scss'],
                                                        jasmine.any(Function));
        });

        it('prints the exception on screen', function () {
          expect(console.error).toHaveBeenCalledWith('something bad happened');
        });

        it('does not invoke the callback', function () {
          expect(spy).not.toHaveBeenCalled();
        });

      });

      describe('validate linter success', function () {

        beforeEach(function () {
          spyOn(cmp.linter, 'run').and.callFake(function (paths, callback) {
            callback();
          });
          cmp.validate('/path/to/a/file.scss', ['/lint/this/directory/too'], spy);
        });

        it('invokes the callback', function () {
          expect(spy).toHaveBeenCalled();
        });

      });

      describe('webCompile', function () {

        beforeEach(function () {
          spyOn(cmp, 'validate').and.callFake(function (inPath, lintPaths, callback) {
            callback();
          });
        });

        describe('compiler failure', function () {

          beforeEach(function () {
            spyOn(cmp.compiler, 'run').and.callFake(function (inPath, outPath, callback) {
              callback({message: 'could not compile', file: 'some file', line: 12, column: 8});
            });
            cmp.webCompile('/path/to/the/input/file.scss', '/path/to/the/output/file.css', spy,
                           '/lint/this/directory/too');
          });

          it('calls validate', function () {
            expect(cmp.validate).toHaveBeenCalledWith('/path/to/the/input/file.scss', ['/lint/this/directory/too'],
                                                      jasmine.any(Function));
          });

          it('runs the compiler', function () {
            expect(cmp.compiler.run).toHaveBeenCalledWith('/path/to/the/input/file.scss', '/path/to/the/output/file.css',
                                                          jasmine.any(Function));
          });

          it('prints the error', function () {
            expect(console.log).toHaveBeenCalledWith(
              '\x1b[41mSASS error\x1b[0m "\x1b[33m%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
              'could not compile', 'some file', 12, 8);
          });

          it('does not call the spy', function () {
            expect(spy).not.toHaveBeenCalled();
          });

        });

        describe('compiler success', function () {

          beforeEach(function () {
            spyOn(cmp.compiler, 'run').and.callFake(function (inPath, outPath, callback) {
              callback(null, {code: 'some css rules', map: 'source map contents'});
            });
            cmp.webCompile('/path/to/the/input/file.scss', '/path/to/the/output/file.css', spy,
                           '/lint/this/directory/too');
          });

          it('does not print anything on screen', function () {
            expect(console.log).not.toHaveBeenCalled();
          });

          it('invokes the callback', function () {
            expect(spy).toHaveBeenCalledWith({code: 'some css rules', map: 'source map contents'});
          });

        });

      });

      describe('feDev', function () {

        beforeEach(function () {
          spyOn(cmp, 'webCompile').and.callFake(function (inPath, outPath, callback) {
            callback({code: 'compiled code', map: 'source map'});
          });
          spyOn(cmp, 'fsWrite').and.callFake(function (inPath, outPath, data, callback) {
            callback();
          });
          cmp.feDev('/path/to/the/input/file.scss', '/path/to/the/output/file.css', spy, '/lint/this/directory/too');
        });

        it('calls webCompile', function () {
          expect(cmp.webCompile).toHaveBeenCalledWith('/path/to/the/input/file.scss', '/path/to/the/output/file.css',
                                                      jasmine.any(Function), '/lint/this/directory/too');
        });

        it('calls fsWrite', function () {
          expect(cmp.fsWrite).toHaveBeenCalledWith('/path/to/the/input/file.scss', '/path/to/the/output/file.css',
                                                   {code: 'compiled code', map: 'source map'}, spy);
        });

      });

    });

    describe('cssAutoprefix errors', function () {

      /* @noflow */
      var cmp, SASS, cssAutoprefix, errors = ['something', 'bad', 'happened'];

      beforeEach(function () {
        spyOn(errors, 'forEach').and.callThrough();
        cssAutoprefix = jasmine.createSpy('cssAutoprefix').and.callFake(function (result, outPath, callback) {
          callback(errors);
        });
        SASS = proxyquire('../lib/SASS', {'./cssAutoprefix': cssAutoprefix, './cssMin': cssMin});
        cmp = new SASS();
        spyOn(cmp, 'webCompile').and.callFake(function (inPath, lintPaths, callback) {
          callback({code: 'compiled code', map: 'source map'});
        });
        cmp.feProd('/path/to/the/input/file.scss', '/path/to/the/output/file.css', Function.prototype,
                   '/lint/this/directory/too');
      });

      it('calls webCompile', function () {
        expect(cmp.webCompile).toHaveBeenCalledWith('/path/to/the/input/file.scss', '/path/to/the/output/file.css',
                                                    jasmine.any(Function), '/lint/this/directory/too');
      });

      it('calls cssAutoprefix', function () {
        expect(cssAutoprefix).toHaveBeenCalledWith({code: 'compiled code', map: 'source map'},
                                                   '/path/to/the/output/file.css', jasmine.any(Function));
      });

      it('does not call cssMin', function () {
        expect(cssMin).not.toHaveBeenCalled();
      });

    });

    describe('cssAutoprefix success', function () {

      /* @noflow */
      var cmp, SASS, cssAutoprefix;

      beforeEach(function () {
        cssAutoprefix = jasmine.createSpy('cssAutoprefix').and.callFake(function (result, outPath, callback) {
          callback(null, {code: 'prefixed code', map: 'source map contents'});
        });
        SASS = proxyquire('../lib/SASS', {'./cssAutoprefix': cssAutoprefix, './cssMin': cssMin});
        cmp = new SASS();
        spyOn(cmp, 'webCompile').and.callFake(function (inPath, lintPaths, callback) {
          callback({code: 'compiled code', map: 'source map'});
        });
        spyOn(cmp, 'fsWrite').and.callFake(function (inPath, outPath, data, callback) {
          callback();
        });
      });

      describe('GZIP failure', function () {

        beforeEach(function () {
          spyOn(zlib, 'gzip').and.callFake(function (input, callback) {
            callback('GZIP exception');
          });
          cmp.feProd('/path/to/the/input/file.scss', '/path/to/the/output/file.css', Function.prototype,
                     '/lint/this/directory/too');
        });

        it('calls cssMin', function () {
          expect(cssMin).toHaveBeenCalledWith({code: 'prefixed code', map: 'source map contents'});
        });

        it('calls zlib.gzip', function () {
          expect(zlib.gzip).toHaveBeenCalledWith('minified code', jasmine.any(Function));
        });

        it('prints the exception on screen', function () {
          expect(console.error).toHaveBeenCalledWith('GZIP exception');
        });

        it('does not call fsWrite', function () {
          expect(cmp.fsWrite).not.toHaveBeenCalled();
        });

      });

      describe('GZIP success', function () {

        beforeEach(function () {
          spyOn(zlib, 'gzip').and.callFake(function (input, callback) {
            callback(null, 'GZIPed program');
          });
          cmp.feProd('/path/to/the/input/file.scss', '/path/to/the/output/file.css', spy, '/lint/this/directory/too');
        });

        it('calls fsWrite', function () {
          expect(cmp.fsWrite).toHaveBeenCalledWith('/path/to/the/input/file.scss', '/path/to/the/output/file.css',
                                                   {code: 'GZIPed program', map: 'source map'}, spy);
        });

      });

    });

    describe('mkdirp errors', function () {
      var cmp, SASS, mkdirp;

      beforeEach(function () {
        spyOn(fs, 'writeFile');
        mkdirp = jasmine.createSpy('mkdirp').and.callFake(function (path, callback) {
          callback('could not create a directory');
        });
        SASS = proxyquire('../lib/SASS', {mkdirp});
        cmp = new SASS();
        cmp.fsWrite('/path/to/the/input/file.scss', '/path/to/the/output/file.css',
                    {code: 'compiled code', map: 'source map'}, Function.prototype);
      });

      it('calls mkdirp', function () {
        expect(mkdirp).toHaveBeenCalledWith('/path/to/the/output', jasmine.any(Function));
      });

      it('prints the exception on screen', function () {
        expect(console.error).toHaveBeenCalledWith('could not create a directory');
      });

      it('does not write anything to disk', function () {
        expect(fs.writeFile).not.toHaveBeenCalled();
      });

    });

    describe('mkdirp success', function () {

      /* @noflow */
      var cmp, SASS, mkdirp;

      beforeEach(function () {
        mkdirp = jasmine.createSpy('mkdirp').and.callFake(function (path, callback) {
          callback();
        });
        SASS = proxyquire('../lib/SASS', {mkdirp});
        cmp = new SASS();
      });

      describe('styles writeFile failure', function () {

        beforeEach(function () {
          spyOn(fs, 'writeFile').and.callFake(function (name, content, callback) {
            callback('failed to write to disk');
          });
          cmp.fsWrite('/path/to/the/input/file.scss', '/path/to/the/output/file.css',
                      {code: 'compiled code', map: 'source map'}, Function.prototype);
        });

        it('writes the styles to disk', function () {
          expect(fs.writeFile).toHaveBeenCalledWith('/path/to/the/output/file.css', 'compiled code',
                                                    jasmine.any(Function));
        });

        it('prints the exception on screen', function () {
          expect(console.error).toHaveBeenCalledWith('failed to write to disk');
        });

        it('does not write the map file', function () {
          expect(fs.writeFile).not.toHaveBeenCalledWith('/path/to/the/output/file.css.map', 'source map',
                                                        jasmine.any(Function));
        });

      });

      describe('map writeFile failure', function () {

        beforeEach(function () {
          spyOn(fs, 'writeFile').and.callFake(function (name, content, callback) {
            callback('/path/to/the/output/file.css' === name ? null : 'failed to write the map to disk');
          });
          cmp.fsWrite('/path/to/the/input/file.scss', '/path/to/the/output/file.css',
                      {code: 'compiled code', map: 'source map'}, spy);
        });

        it('writes the map to disk', function () {
          expect(fs.writeFile).toHaveBeenCalledWith('/path/to/the/output/file.css.map', 'source map',
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
          cmp.fsWrite('/path/to/the/input/file.scss', '/path/to/the/output/file.css',
                      {code: 'compiled code', map: 'source map'}, spy);
        });

        it('logs successful message', function () {
          expect(console.log).toHaveBeenCalledWith('\x1b[32m%s. Compiled %s\x1b[0m', 1,
                                                   '/path/to/the/input/file.scss');
        });

        it('invokes the callback', function () {
          expect(spy).toHaveBeenCalled();
        });

      });

    });

  });

});
