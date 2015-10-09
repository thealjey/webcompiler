/* @flow */

import SASSCompile from '../lib/SASSCompile';
import sass from 'node-sass';
import importer from 'node-sass-import-once';

describe('SASSCompile', function () {

  describe('no overrides', function () {

    it('holds default options', function () {
      const cmp = new SASSCompile();

      expect(cmp.importOnce).toEqual({index: true, css: false, bower: false});
      expect(cmp.includePaths).toEqual(['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules']);
    });

  });

  describe('overrides', function () {
    let cmp;

    beforeEach(function () {
      cmp = new SASSCompile({something: 'here'}, ['/path/to/some/directory']);
    });

    it('holds overridden options', function () {
      if (!cmp) {
        return;
      }
      expect(cmp.importOnce).toEqual({index: true, css: false, bower: false, something: 'here'});
      expect(cmp.includePaths).toEqual(['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules',
                                        '/path/to/some/directory']);
    });

    describe('run invocation', function () {

      it('invokes sass.render', function () {
        if (!cmp) {
          return;
        }
        spyOn(sass, 'render');
        cmp.run('/path/to/the/input/file.scss', '/path/to/the/output/file.css', Function.prototype);
        expect(sass.render).toHaveBeenCalledWith({
          file: '/path/to/the/input/file.scss',
          outFile: '/path/to/the/output/file.css',
          importer,
          importOnce: {index: true, css: false, bower: false, something: 'here'},
          includePaths: ['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules', '/path/to/some/directory'],
          precision: 8,
          sourceMap: true,
          sourceMapContents: true
        }, jasmine.any(Function));
      });

      describe('run callback', function () {
        let spy;

        beforeEach(function () {
          spy = jasmine.createSpy('spy');
        });

        it('properly handles errors', function () {
          if (!cmp) {
            return;
          }
          spyOn(sass, 'render').and.callFake(function (options, callback) {
            callback('something bad happened');
          });
          cmp.run('/path/to/the/input/file.scss', '/path/to/the/output/file.css', spy);
          expect(spy).toHaveBeenCalledWith('something bad happened');
        });

        it('properly handles successful result', function () {
          if (!cmp) {
            return;
          }
          spyOn(sass, 'render').and.callFake(function (options, callback) {
            callback(null, {css: 'body{color:red}', map: {toString: () => 'some map content'}});
          });
          cmp.run('/path/to/the/input/file.scss', '/path/to/the/output/file.css', spy);
          expect(spy).toHaveBeenCalledWith(null, {code: 'body{color:red}', map: 'some map content'});
        });

      });

    });

  });

});
