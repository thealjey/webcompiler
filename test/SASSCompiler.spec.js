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
/* eslint-disable require-jsdoc */

const precision = 8;

let SASSCompiler, postcss, process, then, cmp, callback, logError, logPostCSSWarnings, logSASSError;

function req(options: Object) {
  return proxyquire('../src/SASSCompiler', options).SASSCompiler;
}

describe('SASSCompiler', () => {

  beforeEach(() => {
    callback = spy();
    logError = stub();
    logPostCSSWarnings = stub();
    logSASSError = stub();
  });

  describe('postcss error', () => {

    beforeEach(() => {
      then = stub().callsArgWith(0, {warnings: () => ['something', 'bad', 'happened']});
      process = stub().returns({then});
      postcss = stub().returns({process});
      SASSCompiler = req({postcss, './logger': {logError, logPostCSSWarnings, logSASSError}});
      cmp = new SASSCompiler({compress: false, includePaths: ['/path/to/a/directory'], importOnce: {bower: true}});
    });

    it('has the compress flag set to false', () => {
      expect(cmp.options.compress).false;
    });

    it('extends Compiler', () => {
      expect(cmp).instanceof(Compiler);
    });

    it('initializes includePaths', () => {
      expect(cmp.options.includePaths).eql([
        'node_modules/bootstrap-sass/assets/stylesheets',
        'node_modules/font-awesome/scss',
        'node_modules',
        'node_modules/bootswatch',
        '/path/to/a/directory'
      ]);
    });

    it('initializes importOnce', () => {
      expect(cmp.options.importOnce).eql({index: true, css: false, bower: true});
    });

    describe('postcss', () => {

      beforeEach(() => {
        cmp.postcss('/path/to/the/output/file.css', {code: 'source code', map: 'source map'}, callback);
      });

      it('calls postcss', () => {
        expect(postcss).calledWith([autoprefixer]);
      });

      it('calls process', () => {
        expect(process).calledWith('source code', {from: '/path/to/the/output/file.css',
          to: '/path/to/the/output/file.css', map: {prev: 'source map'}});
      });

      it('calls then', () => {
        expect(then).calledWith(match.func, logError);
      });

      it('prints errors on screen', () => {
        expect(logPostCSSWarnings).calledWith(['something', 'bad', 'happened']);
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
      SASSCompiler = req({postcss, './logger': {logError, logPostCSSWarnings, logSASSError}});
      cmp = new SASSCompiler();
    });

    it('initializes includePaths', () => {
      expect(cmp.options.includePaths).eql([
        'node_modules/bootstrap-sass/assets/stylesheets',
        'node_modules/font-awesome/scss',
        'node_modules',
        'node_modules/bootswatch'
      ]);
    });

    it('initializes importOnce', () => {
      expect(cmp.options.importOnce).eql({index: true, css: false, bower: false});
    });

    describe('postcss', () => {

      beforeEach(() => {
        cmp.postcss('/path/to/the/output/file.css', {code: 'source code', map: 'source map'}, callback);
      });

      it('calls callback', () => {
        expect(callback).calledWith({code: 'css rules', map: '{"source":["map","contents"]}'});
      });

    });

    describe('fe', () => {

      beforeEach(() => {
        stub(cmp, 'postcss').callsArgWith(2, 'autoprefixed data');
        stub(cmp, 'save');
      });

      afterEach(() => {
        cmp.postcss.restore();
        cmp.save.restore();
      });

      describe('render error', () => {

        beforeEach(() => {
          stub(sass, 'render').callsArgWith(1, 'something bad happened');
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
            importOnce: cmp.options.importOnce,
            includePaths: cmp.options.includePaths,
            precision,
            sourceMap: true,
            sourceMapContents: true,
            outputStyle: 'compressed'
          }, match.func);
        });

        it('prints the error on screen', () => {
          expect(logSASSError).calledWith('something bad happened');
        });

        it('does not call postcss', () => {
          expect(cmp.postcss).not.called;
        });

      });

      describe('render success', () => {

        beforeEach(() => {
          stub(sass, 'render').callsArgWith(1, null, {css: 'css rules', map: 'source map'});
          cmp.fe('/path/to/the/input/file.scss', '/path/to/the/output/file.css', callback);
        });

        afterEach(() => {
          sass.render.restore();
        });

        it('calls postcss', () => {
          expect(cmp.postcss).calledWith('/path/to/the/output/file.css',
                                                     {code: 'css rules', map: 'source map'}, match.func);
        });

        it('calls save', () => {
          expect(cmp.save).calledWith('/path/to/the/input/file.scss', '/path/to/the/output/file.css',
                                      'autoprefixed data', callback);
        });

      });

      describe('addPostcssPlugins', () => {

        beforeEach(() => {
          spy(cmp, 'addPostcssPlugins');
          cmp.addPostcssPlugins('something', 'something else');
        });

        afterEach(() => {
          cmp.addPostcssPlugins.restore();
        });

        it('add plugins to the list', () => {
          expect(cmp.postcssPlugins).eql([autoprefixer, 'something', 'something else']);
        });

        it('returns self', () => {
          expect(cmp.addPostcssPlugins).returned(cmp);
        });

      });

    });

  });

});
