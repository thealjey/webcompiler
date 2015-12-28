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
/* eslint-disable quotes */

const precision = 8,
    roundingPrecision = -1;

let cleanCSSOptions, SASSCompiler, postcss, process, then, cmp, callback;

class CleanCSS {
  constructor(options) {
    cleanCSSOptions = options;
  }
  minify() {}
}

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
      cmp = new SASSCompiler(['/path/to/a/directory'], {bower: true});
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
        cmp.autoprefix('/path/to/the/output/file.css', {code: 'source code', map: 'source map'}, callback);
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
      SASSCompiler = req({postcss, 'clean-css': CleanCSS});
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
        cmp.autoprefix('/path/to/the/output/file.css', {code: 'source code', map: 'source map'}, callback);
      });

      it('calls callback', () => {
        expect(callback).calledWith({code: 'css rules', map: '{"source":["map","contents"]}'});
      });

    });

    describe('minify', () => {

      beforeEach(() => {
        spy(cmp, 'minify');
      });

      afterEach(() => {
        cmp.minify.restore();
      });

      describe('CleanCSS error', () => {

        beforeEach(() => {
          stub(CleanCSS.prototype, 'minify').returns({errors: ['something', 'bad'], warnings: ['happened']});
          cmp.minify('/path/to/the/output/file.css', {code: 'source code', map: 'source map'});
        });

        afterEach(() => {
          CleanCSS.prototype.minify.restore();
        });

        it('sets the options', () => {
          expect(cleanCSSOptions).eql({
            keepSpecialComments: 0,
            roundingPrecision,
            sourceMap: 'source map',
            sourceMapInlineSources: true
          });
        });

        it('prints errors on screen', () => {
          expect(console.error).calledWith('something');
          expect(console.error).calledWith('bad');
          expect(console.error).calledWith('happened');
        });

        it('returns null', () => {
          expect(cmp.minify).returned(null);
        });

      });

      describe('CleanCSS success', () => {

        beforeEach(() => {
          stub(CleanCSS.prototype, 'minify').returns({errors: [], warnings: [], styles: 'minified source code',
                                                     sourceMap: 'minified source map'});
        });

        afterEach(() => {
          CleanCSS.prototype.minify.restore();
        });

        describe('no sourceMappingURL', () => {

          beforeEach(() => {
            cmp.minify('/path/to/the/output/file.css', {code: 'source code', map: 'source map'});
          });

          it('returns the minified data', () => {
            expect(cmp.minify).returned({code: 'minified source code', map: 'minified source map'});
          });

        });

        describe('sourceMappingURL', () => {

          beforeEach(() => {
            cmp.minify('/path/to/the/output/file.css',
                       {code: "source code\n/*# sourceMappingURL=file.css.map */", map: 'source map'});
          });

          it('returns the minified data', () => {
            expect(cmp.minify).returned({code: "minified source code\n/*# sourceMappingURL=file.css.map */",
                                        map: 'minified source map'});
          });

        });

      });

    });

    describe('fe', () => {

      beforeEach(() => {
        stub(cmp, 'autoprefix').callsArgWith(2, 'autoprefixed data');
        stub(cmp, 'fsWrite').callsArg(2);
        stub(cmp, 'optimize');
        stub(cmp, 'done');
      });

      afterEach(() => {
        cmp.autoprefix.restore();
        cmp.fsWrite.restore();
        cmp.optimize.restore();
        cmp.done.restore();
      });

      describe('render error', () => {

        beforeEach(() => {
          stub(sass, 'render').callsArgWith(1, {message: 'something bad happened', file: '/path/to/a/file.css', line: 1,
                                            column: 2});
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
            sourceMapContents: true
          }, match.func);
        });

        it('prints the error on screen', () => {
          expect(console.log).calledWith(
            '\x1b[41mSASS error\x1b[0m "\x1b[33m%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
            'something bad happened', '/path/to/a/file.css', 1, 2);
        });

        it('does not call autoprefix', () => {
          expect(cmp.autoprefix).not.called;
        });

      });

      describe('render success', () => {

        beforeEach(() => {
          stub(sass, 'render').callsArgWith(1, null, {css: 'css rules', map: 'source map'});
        });

        afterEach(() => {
          sass.render.restore();
        });

        describe('production', () => {

          beforeEach(() => {
            cmp.isProduction = true;
            cmp.fe('/path/to/the/input/file.scss', '/path/to/the/output/file.css', callback);
          });

          it('calls autoprefix', () => {
            expect(cmp.autoprefix).calledWith('/path/to/the/output/file.css', {code: 'css rules', map: 'source map'},
                                              match.func);
          });

          it('calls optimize', () => {
            expect(cmp.optimize).calledWith('/path/to/the/input/file.scss', '/path/to/the/output/file.css',
                                            'autoprefixed data', callback);
          });

          it('does not call fsWrite', () => {
            expect(cmp.fsWrite).not.called;
          });

        });

        describe('development', () => {

          beforeEach(() => {
            cmp.isProduction = false;
            cmp.fe('/path/to/the/input/file.scss', '/path/to/the/output/file.css', callback);
          });

          it('calls fsWrite', () => {
            expect(cmp.fsWrite).calledWith('/path/to/the/output/file.css', 'autoprefixed data', match.func);
          });

          it('calls done', () => {
            expect(cmp.done).calledWith('/path/to/the/input/file.scss', callback);
          });

        });

      });

    });

  });

});
