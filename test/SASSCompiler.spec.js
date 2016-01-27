/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import autoprefixer from 'autoprefixer';
import {Compiler} from '../src/Compiler';
import sass from 'node-sass';
import importer from 'node-sass-import-once';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */

const precision = 8;

let SASSCompiler, postcss, process, then, cmp, callback;

function req(options) {
  return proxyquire('../src/SASSCompiler', options).SASSCompiler;
}

describe('SASSCompiler', () => {

  beforeEach(() => {
    callback = spy();
    stub(console, 'log');
    stub(console, 'error');
  });

  afterEach(() => {
    console.log.restore();
    console.error.restore();
  });

  describe('postcss error', () => {

    beforeEach(() => {
      then = stub().callsArgWith(0, {warnings: () => ['something', 'bad', 'happened']});
      process = stub().returns({then});
      postcss = stub().returns({process});
      SASSCompiler = req({postcss});
      cmp = new SASSCompiler(false, ['/path/to/a/directory'], {bower: true});
    });

    it('has the compress flag set to false', () => {
      expect(cmp.compress).false;
    });

    it('extends Compiler', () => {
      expect(cmp).instanceof(Compiler);
    });

    it('initializes includePaths', () => {
      expect(cmp.includePaths).eql(['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules',
                                   '/path/to/a/directory']);
    });

    it('initializes importOnce', () => {
      expect(cmp.importOnce).eql({index: true, css: false, bower: true});
    });

    describe('autoprefix', () => {

      beforeEach(() => {
        SASSCompiler.autoprefix('/path/to/the/output/file.css', {code: 'source code', map: 'source map'}, callback);
      });

      it('calls postcss', () => {
        expect(postcss).calledWith([autoprefixer]);
      });

      it('calls process', () => {
        expect(process).calledWith('source code', {from: '/path/to/the/output/file.css',
                                   to: '/path/to/the/output/file.css', map: {prev: 'source map'}});
      });

      it('calls then', () => {
        expect(then).calledWith(match.func);
      });

      it('prints errors on screen', () => {
        expect(console.error).calledWith('something');
        expect(console.error).calledWith('bad');
        expect(console.error).calledWith('happened');
      });

      it('does not call callback', () => {
        expect(callback).not.called;
      });

    });

  });

  describe('postcss success', () => {

    beforeEach(() => {
      then = stub().callsArgWith(0, {warnings: () => [], css: 'css rules', map: {source: ['map', 'contents']}});
      process = stub().returns({then});
      postcss = stub().returns({process});
      SASSCompiler = req({postcss});
      cmp = new SASSCompiler();
    });

    it('initializes includePaths', () => {
      expect(cmp.includePaths).eql(['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules']);
    });

    it('initializes importOnce', () => {
      expect(cmp.importOnce).eql({index: true, css: false, bower: false});
    });

    describe('autoprefix', () => {

      beforeEach(() => {
        SASSCompiler.autoprefix('/path/to/the/output/file.css', {code: 'source code', map: 'source map'}, callback);
      });

      it('calls callback', () => {
        expect(callback).calledWith({code: 'css rules', map: '{"source":["map","contents"]}'});
      });

    });

    describe('fe', () => {

      beforeEach(() => {
        stub(SASSCompiler, 'autoprefix').callsArgWith(2, 'autoprefixed data');
        stub(cmp, 'optimize');
      });

      afterEach(() => {
        SASSCompiler.autoprefix.restore();
        cmp.optimize.restore();
      });

      describe('render error', () => {

        beforeEach(() => {
          stub(sass, 'render').callsArgWith(1, {message: 'something bad happened', file: '/path/to/a/file.css', line: 1,
                                            column: 2});
          cmp.isProduction = true;
          cmp.fe('/path/to/the/input/file.scss', '/path/to/the/output/file.css');
        });

        afterEach(() => {
          sass.render.restore();
        });

        it('calls render', () => {
          expect(sass.render).calledWith({
            file: '/path/to/the/input/file.scss',
            outFile: '/path/to/the/output/file.css',
            importer,
            importOnce: cmp.importOnce,
            includePaths: cmp.includePaths,
            precision,
            sourceMap: true,
            sourceMapContents: true,
            outputStyle: 'compressed'
          }, match.func);
        });

        it('prints the error on screen', () => {
          expect(console.log).calledWith(
            '\x1b[41mSASS error\x1b[0m "\x1b[33m%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
            'something bad happened', '/path/to/a/file.css', 1, 2);
        });

        it('does not call autoprefix', () => {
          expect(SASSCompiler.autoprefix).not.called;
        });

      });

      describe('render success', () => {

        beforeEach(() => {
          stub(sass, 'render').callsArgWith(1, null, {css: 'css rules', map: 'source map'});
          cmp.isProduction = false;
          cmp.fe('/path/to/the/input/file.scss', '/path/to/the/output/file.css', callback);
        });

        afterEach(() => {
          sass.render.restore();
        });

        it('calls render', () => {
          expect(sass.render).calledWith({
            file: '/path/to/the/input/file.scss',
            outFile: '/path/to/the/output/file.css',
            importer,
            importOnce: cmp.importOnce,
            includePaths: cmp.includePaths,
            precision,
            sourceMap: true,
            sourceMapContents: true,
            outputStyle: 'nested'
          }, match.func);
        });

        it('calls autoprefix', () => {
          expect(SASSCompiler.autoprefix).calledWith('/path/to/the/output/file.css',
                                                     {code: 'css rules', map: 'source map'}, match.func);
        });

        it('calls optimize', () => {
          expect(cmp.optimize).calledWith('/path/to/the/input/file.scss', '/path/to/the/output/file.css',
                                          'autoprefixed data', callback);
        });

      });

    });

  });

});
