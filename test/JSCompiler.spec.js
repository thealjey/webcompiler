/* @flow */

/* @flowignore */
import config from '../config/babel';
import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import UglifyJS from 'uglify-js';
import MemoryFS from 'memory-fs';
import fs from 'fs';
import autoprefixer from 'autoprefixer';
import importer from 'node-sass-import-once';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */
/* eslint-disable no-sync */

const precision = 8,
    files = 10;

let cmp, transformFile, isDirectory, webpack, compiler, run, JSCompiler, callback, pipe;

function req(options) {
  return proxyquire('../src/JSCompiler', options).JSCompiler;
}

describe('JSCompiler', () => {

  beforeEach(() => {
    callback = spy();
    stub(console, 'error');
  });

  afterEach(() => {
    console.error.restore();
  });

  describe('webpack exception', () => {

    beforeEach(() => {
      run = stub().callsArgWith(0, 'failed to compile');
      compiler = {outputFileSystem: 'realFS', run};
      webpack = stub().returns(compiler);
      JSCompiler = req({webpack});
      process.env.NODE_ENV = 'production';
      cmp = new JSCompiler({something: 'here'});
      delete process.env.NODE_ENV;
    });

    it('inits options', () => {
      expect(cmp.options).eql(Object.assign({}, config.env.production, {something: 'here'}));
    });

    it('inits processing', () => {
      expect(cmp.processing).equal(0);
    });

    describe('fe', () => {

      beforeEach(() => {
        cmp.options = {some: 'options'};
      });

      describe('development', () => {

        beforeEach(() => {
          cmp.isProduction = false;
          cmp.fe('/path/to/the/input/file.js', '/path/to/the/output/file.js');
        });

        it('calls webpack', () => {
          expect(webpack).calledWith({
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
                query: {cacheDirectory: true, some: 'options'}
              }, {
                test: /\.scss$/,
                loaders: ['style?singleton', 'css?modules&minimize&importLoaders=1&sourceMap', 'postcss',
                  'sass&sourceMap']
              }]
            },
            postcss: match(value => value()[0] === autoprefixer),
            sassLoader: {
              importer,
              importOnce: {index: true, css: false, bower: false},
              includePaths: ['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules'],
              precision
            }
          });
        });

        it('does not override the compiler file system', () => {
          expect(compiler.outputFileSystem).equal('realFS');
        });

      });

      describe('production', () => {

        beforeEach(() => {
          cmp.isProduction = true;
          stub(cmp, 'done');
          stub(cmp, 'optimize');
          cmp.fe('/path/to/the/input/file.js', '/path/to/the/output/file.js');
        });

        afterEach(() => {
          cmp.done.restore();
          cmp.optimize.restore();
        });

        it('overrides the compiler file system', () => {
          expect(compiler.outputFileSystem).instanceof(MemoryFS);
        });

        it('calls compiler.run', () => {
          expect(run).calledWith(match.func);
        });

        it('prints the error on screen', () => {
          expect(console.error).calledWith('failed to compile');
        });

        it('does not call cmp.done', () => {
          expect(cmp.done).not.called;
        });

        it('does not call cmp.optimize', () => {
          expect(cmp.optimize).not.called;
        });

      });

    });

  });

  describe('webpack errors', () => {

    beforeEach(() => {
      run = stub().callsArgWith(0, null,
        {toJson: () => ({errors: ['something', 'bad', 'happened'], warnings: ['you', 'cannot', 'do', 'that']})});
      compiler = {outputFileSystem: 'realFS', run};
      webpack = stub().returns(compiler);
      JSCompiler = req({webpack});
      process.env.NODE_ENV = 'development';
      cmp = new JSCompiler();
      delete process.env.NODE_ENV;
      stub(cmp, 'done');
      stub(cmp, 'optimize');
      cmp.fe('/path/to/the/input/file.js', '/path/to/the/output/file.js');
    });

    afterEach(() => {
      cmp.done.restore();
      cmp.optimize.restore();
    });

    it('inits options', () => {
      expect(cmp.options).eql(Object.assign({}, config.env.development));
    });

    it('prints the error on screen', () => {
      expect(console.error).calledWith('something');
      expect(console.error).calledWith('bad');
      expect(console.error).calledWith('happened');
      expect(console.error).calledWith('you');
      expect(console.error).calledWith('cannot');
      expect(console.error).calledWith('do');
      expect(console.error).calledWith('that');
    });

    it('does not call cmp.done', () => {
      expect(cmp.done).not.called;
    });

    it('does not call cmp.optimize', () => {
      expect(cmp.optimize).not.called;
    });

  });

  describe('webpack success', () => {

    beforeEach(() => {
      run = stub().callsArgWith(0, null, {toJson: () => ({errors: [], warnings: []})});
      compiler = {outputFileSystem: 'realFS', run};
      webpack = stub().returns(compiler);
      JSCompiler = req({webpack});
      cmp = new JSCompiler();
      cmp.options = {some: 'options'};
      stub(cmp, 'done');
      stub(cmp, 'optimize');
    });

    afterEach(() => {
      cmp.done.restore();
      cmp.optimize.restore();
    });

    describe('development', () => {

      beforeEach(() => {
        cmp.isProduction = false;
      });

      describe('no callback', () => {

        beforeEach(() => {
          cmp.fe('/path/to/the/input/file.js', '/path/to/the/output/file.js');
        });

        it('calls done', () => {
          expect(cmp.done).calledWith('/path/to/the/input/file.js', match.func);
        });

        it('does not call optimize', () => {
          expect(cmp.optimize).not.called;
        });

      });

      describe('callback', () => {

        beforeEach(() => {
          cmp.fe('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
        });

        it('calls done', () => {
          expect(cmp.done).calledWith('/path/to/the/input/file.js', callback);
        });

      });

    });

    describe('production', () => {

      beforeEach(() => {
        cmp.isProduction = true;
        stub(MemoryFS.prototype, 'readFileSync').returnsArg(0);
      });

      afterEach(() => {
        MemoryFS.prototype.readFileSync.restore();
      });

      describe('no callback', () => {

        beforeEach(() => {
          cmp.fe('/path/to/the/input/file.js', '/path/to/the/output/file.js');
        });

        it('does not call done', () => {
          expect(cmp.done).not.called;
        });

        it('calls optimize', () => {
          expect(cmp.optimize).calledWith('/path/to/the/input/file.js', '/path/to/the/output/file.js',
            {code: '/path/to/the/output/file.js', map: '/path/to/the/output/file.js.map'}, match.func);
        });

      });

      describe('callback', () => {

        beforeEach(() => {
          cmp.fe('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
        });

        it('calls optimize', () => {
          expect(cmp.optimize).calledWith('/path/to/the/input/file.js', '/path/to/the/output/file.js',
            {code: '/path/to/the/output/file.js', map: '/path/to/the/output/file.js.map'}, callback);
        });

      });

    });

  });

  describe('transformFile error', () => {

    beforeEach(() => {
      transformFile = stub().callsArgWith(2, 'something bad happened');
      JSCompiler = req({'babel-core': {transformFile}});
      cmp = new JSCompiler();
      stub(cmp, 'fsWrite').callsArg(2);
      stub(cmp, 'done');
    });

    afterEach(() => {
      cmp.fsWrite.restore();
      cmp.done.restore();
    });

    describe('minify', () => {

      beforeEach(() => {
        stub(UglifyJS, 'minify').returns('minified javascript');
        spy(cmp, 'minify');
        cmp.minify('/path/to/a/script/file.js', {code: 'js code', map: '{"source": "map"}'});
      });

      afterEach(() => {
        UglifyJS.minify.restore();
        cmp.minify.restore();
      });

      it('calls UglifyJS.minify', () => {
        expect(UglifyJS.minify).calledWith('js code', {
          fromString: true,
          mangle: false,
          output: {space_colon: false},
          inSourceMap: {source: 'map'},
          outSourceMap: 'file.js.map'
        });
      });

      it('returns minified result', () => {
        expect(cmp.minify).returned('minified javascript');
      });

    });

    describe('beFile', () => {

      beforeEach(() => {
        cmp.beFile('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
      });

      it('increments processing', () => {
        expect(cmp.processing).equal(1);
      });

      it('calls transformFile', () => {
        expect(transformFile).calledWith('/path/to/the/input/file.js', cmp.options, match.func);
      });

      it('prints the error on screen', () => {
        expect(console.error).calledWith('something bad happened');
      });

      it('does not write anything to disk', () => {
        expect(cmp.fsWrite).not.called;
      });

    });

  });

  describe('transformFile success', () => {

    beforeEach(() => {
      transformFile = stub().callsArgWith(2, null, {code: 'compiled code', map: 'compiled source map'});
      JSCompiler = req({'babel-core': {transformFile}});
      cmp = new JSCompiler();
      stub(cmp, 'fsWrite').callsArg(2);
      stub(cmp, 'done');
    });

    afterEach(() => {
      cmp.fsWrite.restore();
      cmp.done.restore();
    });

    describe('beFile', () => {

      beforeEach(() => {
        cmp.processing = 0;
        cmp.beFile('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
      });

      it('increments the processing counter', () => {
        expect(cmp.processing).equal(1);
      });

      it('calls fsWrite', () => {
        expect(cmp.fsWrite).calledWith('/path/to/the/output/file.js',
                                       {code: 'compiled code', map: 'compiled source map'}, callback);
      });

    });

    describe('beDir', () => {

      beforeEach(() => {
        stub(cmp, 'beTraverse');
      });

      afterEach(() => {
        cmp.beTraverse.restore();
      });

      describe('readdir error', () => {

        beforeEach(() => {
          stub(fs, 'readdir').callsArgWith(1, 'failed to read the directory');
          cmp.beDir('/path/to/the/input/directory', '/path/to/the/output/directory', callback);
        });

        afterEach(() => {
          fs.readdir.restore();
        });

        it('calls readdir', () => {
          expect(fs.readdir).calledWith('/path/to/the/input/directory', match.func);
        });

        it('prints the error on screen', () => {
          expect(console.error).calledWith('failed to read the directory');
        });

        it('does not traverse the directory', () => {
          expect(cmp.beTraverse).not.called;
        });

      });

      describe('readdir success', () => {

        beforeEach(() => {
          stub(fs, 'readdir').callsArgWith(1, null, ['file1.js', 'file2.js']);
          cmp.beDir('/path/to/the/input/directory', '/path/to/the/output/directory', callback);
        });

        afterEach(() => {
          fs.readdir.restore();
        });

        it('traverses the directory', () => {
          expect(cmp.beTraverse).calledWith('/path/to/the/input/directory/file1.js',
                                            '/path/to/the/output/directory/file1.js', callback);
        });

      });

    });

    describe('copyFile', () => {

      beforeEach(() => {
        cmp.processing = 0;
        pipe = spy();
        stub(cmp, 'mkdir').callsArg(1);
        stub(fs, 'createReadStream').returns({pipe});
        stub(fs, 'createWriteStream').returns('write stream');
        cmp.copyFile('/path/to/the/input/file.css', '/path/to/the/output/file.css', callback);
      });

      afterEach(() => {
        cmp.mkdir.restore();
        fs.createReadStream.restore();
        fs.createWriteStream.restore();
      });

      it('increments the processing counter', () => {
        expect(cmp.processing).equal(1);
      });

      it('calls mkdir', () => {
        expect(cmp.mkdir).calledWith('/path/to/the/output/file.css', match.func);
      });

      it('calls createReadStream', () => {
        expect(fs.createReadStream).calledWith('/path/to/the/input/file.css');
      });

      it('calls createWriteStream', () => {
        expect(fs.createWriteStream).calledWith('/path/to/the/output/file.css');
      });

      it('calls pipe', () => {
        expect(pipe).calledWith('write stream');
      });

      it('calls the callback', () => {
        expect(callback).called;
      });

    });

    describe('beTraverse', () => {

      beforeEach(() => {
        stub(cmp, 'beDir');
        stub(cmp, 'beFile');
        stub(cmp, 'copyFile');
      });

      afterEach(() => {
        cmp.beDir.restore();
        cmp.beFile.restore();
        cmp.copyFile.restore();
      });

      describe('stat error', () => {

        beforeEach(() => {
          isDirectory = spy();
          stub(fs, 'stat').callsArgWith(1, 'failed to stat', {isDirectory});
          cmp.beTraverse('/path/to/the/input/directory', '/path/to/the/output/directory', callback);
        });

        afterEach(() => {
          fs.stat.restore();
        });

        it('calls stat', () => {
          expect(fs.stat).calledWith('/path/to/the/input/directory', match.func);
        });

        it('prints the error on screen', () => {
          expect(console.error).calledWith('failed to stat');
        });

        it('does not call isDirectory', () => {
          expect(isDirectory).not.called;
        });

      });

      describe('stat success file', () => {

        beforeEach(() => {
          isDirectory = stub().returns(false);
          stub(fs, 'stat').callsArgWith(1, null, {isDirectory});
        });

        afterEach(() => {
          fs.stat.restore();
        });

        describe('non-javascript', () => {

          beforeEach(() => {
            cmp.beTraverse('/path/to/the/input/file.css', '/path/to/the/output/file.css', callback);
          });

          it('calls isDirectory', () => {
            expect(isDirectory).called;
          });

          it('does not call beDir', () => {
            expect(cmp.beDir).not.called;
          });

          it('does not call beFile', () => {
            expect(cmp.beFile).not.called;
          });

          it('calls copyFile', () => {
            expect(cmp.copyFile).calledWith('/path/to/the/input/file.css', '/path/to/the/output/file.css', callback);
          });

        });

        describe('javascript', () => {

          beforeEach(() => {
            cmp.beTraverse('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
          });

          it('calls beFile', () => {
            expect(cmp.beFile).calledWith('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
          });

        });

      });

      describe('stat success directory', () => {

        beforeEach(() => {
          isDirectory = stub().returns(true);
          stub(fs, 'stat').callsArgWith(1, null, {isDirectory});
          cmp.beTraverse('/path/to/the/input/directory', '/path/to/the/output/directory', callback);
        });

        afterEach(() => {
          fs.stat.restore();
        });

        it('calls beDir', () => {
          expect(cmp.beDir).calledWith('/path/to/the/input/directory', '/path/to/the/output/directory', callback);
        });

      });

    });

    describe('be', () => {

      describe('not the last file', () => {

        beforeEach(() => {
          stub(cmp, 'beTraverse', (inPath, outPath, cb) => {
            cmp.processing = files;
            cb();
          });
        });

        afterEach(() => {
          cmp.beTraverse.restore();
        });

        describe('processing', () => {

          beforeEach(() => {
            cmp.processing = 2;
            cmp.be('/path/to/the/input/file.js', '/path/to/the/output/file.js');
          });

          it('prints the error on screen', () => {
            expect(console.error).calledWith('Still working...');
          });

          it('does not call beTraverse', () => {
            expect(cmp.beTraverse).not.called;
          });

        });

        describe('not processing', () => {

          beforeEach(() => {
            cmp.processing = 0;
          });

          describe('emptyFn', () => {

            beforeEach(() => {
              cmp.be('/path/to/the/input/file.js', '/path/to/the/output/file.js');
            });

            it('calls beTraverse', () => {
              expect(cmp.beTraverse).calledWith('/path/to/the/input/file.js', '/path/to/the/output/file.js',
                                                match.func);
            });

          });

          describe('callback', () => {

            beforeEach(() => {
              cmp.be('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
            });

            it('decrements the processing counter', () => {
              expect(cmp.processing).equal(files - 1);
            });

            it('doe not call done', () => {
              expect(cmp.done).not.called;
            });

          });

        });

      });

      describe('spy the last file', () => {

        beforeEach(() => {
          cmp.processing = 0;
          stub(cmp, 'beTraverse', (inPath, outPath, cb) => {
            cmp.processing = 1;
            cb();
          });
          cmp.be('/path/to/the/input/file.js', '/path/to/the/output/file.js', callback);
        });

        afterEach(() => {
          cmp.beTraverse.restore();
        });

        it('decrements the processing counter', () => {
          expect(cmp.processing).equal(0);
        });

        it('calls done', () => {
          expect(cmp.done).calledWith('/path/to/the/input/file.js', callback);
        });

      });

    });

  });

});
