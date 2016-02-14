/* @flow */

import chai, {expect} from 'chai';
import {spy, stub} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import cheerio from 'cheerio';
import react from 'react';

chai.use(sinonChai);

/* eslint-disable prefer-const */

let marked, Markup, object, cmp, args, attribs;

describe('Markup', () => {

  beforeEach(() => {
    marked = stub().returnsArg(0);
    Markup = proxyquire('../src/Markup', {marked}).Markup;
  });

  describe('toJSXKey', () => {

    beforeEach(() => {
      spy(Markup, 'toJSXKey');
    });

    afterEach(() => {
      Markup.toJSXKey.restore();
    });

    describe('ms', () => {

      beforeEach(() => {
        Markup.toJSXKey('-ms-something');
      });

      it('does not capitalize the prefix', () => {
        expect(Markup.toJSXKey).returned('msSomething');
      });

    });

    describe('webkit', () => {

      beforeEach(() => {
        Markup.toJSXKey('-webkit-something');
      });

      it('capitalizes the prefix', () => {
        expect(Markup.toJSXKey).returned('WebkitSomething');
      });

    });

  });

  describe('rename does not have', () => {

    beforeEach(() => {
      object = {unknown: 'value'};
      Markup.rename(object, 'oldKey', 'newKey');
    });

    it('does not modify the object', () => {
      expect(object).eql({unknown: 'value'});
    });

  });

  describe('rename has', () => {

    beforeEach(() => {
      object = {unknown: 'value', oldKey: 'something'};
      Markup.rename(object, 'oldKey', 'newKey');
    });

    it('modifies the object', () => {
      expect(object).eql({unknown: 'value', newKey: 'something'});
    });

  });

  describe('transformStyle does not have', () => {

    beforeEach(() => {
      object = {unknown: 'value'};
      Markup.transformStyle(object);
    });

    it('does not modify the object', () => {
      expect(object).eql({unknown: 'value'});
    });

  });

  describe('transformStyle has', () => {

    beforeEach(() => {
      object = {unknown: 'value', style: 'min-width:50px; : gdgfd'};
      Markup.transformStyle(object);
    });

    it('modifies the object', () => {
      expect(object).eql({unknown: 'value', style: {minWidth: '50px'}});
    });

  });

  describe('childrenToJSX', () => {

    beforeEach(() => {
      spy(Markup, 'childrenToJSX');
      stub(Markup, 'childToJSX', (c, i) => ({...c, i}));
    });

    afterEach(() => {
      Markup.childrenToJSX.restore();
      Markup.childToJSX.restore();
    });

    describe('args', () => {

      beforeEach(() => {
        Markup.childrenToJSX([{type: 'comment'}, {type: 'text', data: 'text node'}, {type: 'tag'}]);
      });

      it('returns result', () => {
        expect(Markup.childrenToJSX).returned(['text node', {type: 'tag', i: 1}]);
      });

    });

    describe('no args', () => {

      beforeEach(() => {
        Markup.childrenToJSX();
      });

      it('returns result', () => {
        expect(Markup.childrenToJSX).returned([]);
      });

    });

  });

  describe('childToJSX', () => {

    beforeEach(() => {
      attribs = {};
      spy(Markup, 'childToJSX');
      stub(Markup, 'transformStyle');
      stub(Markup, 'rename');
      stub(Markup, 'childrenToJSX').returns(['child', 'components']);
      stub(react, 'createElement').returns('react component');
    });

    afterEach(() => {
      Markup.childToJSX.restore();
      Markup.transformStyle.restore();
      Markup.rename.restore();
      Markup.childrenToJSX.restore();
      react.createElement.restore();
    });

    describe('input', () => {

      beforeEach(() => {
        Markup.childToJSX({name: 'input', attribs, children: 'something'}, 2);
      });

      it('calls transformStyle', () => {
        expect(Markup.transformStyle).calledWith(attribs);
      });

      it('calls rename', () => {
        expect(Markup.rename).calledWith(attribs, 'for', 'htmlFor');
        expect(Markup.rename).calledWith(attribs, 'class', 'className');
        expect(Markup.rename).calledWith(attribs, 'checked', 'defaultChecked');
        expect(Markup.rename).calledWith(attribs, 'value', 'defaultValue');
      });

      it('calls childrenToJSX', () => {
        expect(Markup.childrenToJSX).calledWith('something');
      });

      it('calls createElement', () => {
        expect(react.createElement).calledWith('input', {key: 2, ...attribs}, 'child', 'components');
      });

      it('returns result', () => {
        expect(Markup.childToJSX).returned('react component');
      });

    });

    describe('textarea', () => {

      beforeEach(() => {
        Markup.childToJSX({name: 'textarea', attribs, children: 'something'}, 2);
      });

      it('calls createElement', () => {
        expect(react.createElement).calledWith('textarea', {key: 2, defaultValue: 'child', ...attribs});
      });

    });

  });

  describe('markdownToUnwrappedHTML', () => {

    beforeEach(() => {
      spy(Markup, 'markdownToUnwrappedHTML');
    });

    afterEach(() => {
      Markup.markdownToUnwrappedHTML.restore();
    });

    describe('unwrap', () => {

      beforeEach(() => {
        Markup.markdownToUnwrappedHTML(' <p>something</p> ');
      });

      it('returns result', () => {
        expect(Markup.markdownToUnwrappedHTML).returned('something');
      });

    });

    describe('do not unwrap', () => {

      beforeEach(() => {
        Markup.markdownToUnwrappedHTML('<h1>something</h1>');
      });

      it('returns result', () => {
        expect(Markup.markdownToUnwrappedHTML).returned('<h1>something</h1>');
      });

    });

  });

  describe('flatten', () => {

    beforeEach(() => {
      spy(Markup, 'flatten');
      Markup.flatten('something ', ['here', {value: 2, other: [true]}]);
    });

    afterEach(() => {
      Markup.flatten.restore();
    });

    it('returns result', () => {
      expect(Markup.flatten).returned(['something here', {value: 2, other: [true]}]);
    });

  });

  describe('assigns transformers', () => {

    beforeEach(() => {
      args = [str => `${str}-one`, str => `${str}-two`, str => `${str}-three`];
      cmp = new Markup(...args);
    });

    it('transformers', () => {
      expect(cmp.transformers).eql(args);
    });

    describe('transform', () => {

      beforeEach(() => {
        spy(cmp, 'transform');
        cmp.transform('zero');
      });

      afterEach(() => {
        cmp.transform.restore();
      });

      it('transforms the string', () => {
        expect(cmp.transform).returned('zero-one-two-three');
      });

    });

  });

  describe('no args', () => {

    beforeEach(() => {
      cmp = new Markup();
    });

    it('transformers', () => {
      expect(cmp.transformers).eql([]);
    });

    describe('markdownToHTML', () => {

      beforeEach(() => {
        spy(cmp, 'markdownToHTML');
        stub(cmp, 'transform').returnsArg(0);
      });

      afterEach(() => {
        cmp.markdownToHTML.restore();
        cmp.transform.restore();
      });

      describe('no arg', () => {

        beforeEach(() => {
          cmp.markdownToHTML();
        });

        it('returns result', () => {
          expect(cmp.markdownToHTML).returned('');
        });

      });

      describe('arg', () => {

        beforeEach(() => {
          cmp.markdownToHTML('<h1>Hello world!</h1>');
        });

        it('calls transform', () => {
          expect(cmp.transform).calledWith('<h1>Hello world!</h1>');
        });

        it('returns html', () => {
          expect(cmp.markdownToHTML).returned('<h1>Hello world!</h1>');
        });

      });

    });

    describe('markdownToJSX', () => {

      beforeEach(() => {
        spy(cmp, 'markdownToJSX');
        stub(cmp, 'htmlToJSX').returnsArg(0);
      });

      afterEach(() => {
        cmp.markdownToJSX.restore();
        cmp.htmlToJSX.restore();
      });

      describe('no arg', () => {

        beforeEach(() => {
          cmp.markdownToJSX();
        });

        it('returns result', () => {
          expect(cmp.markdownToJSX).returned([]);
        });

      });

      describe('arg', () => {

        beforeEach(() => {
          cmp.markdownToJSX('<h1>Hello world!</h1>');
        });

        it('calls htmlToJSX', () => {
          expect(cmp.htmlToJSX).calledWith('<h1>Hello world!</h1>');
        });

        it('returns result', () => {
          expect(cmp.markdownToJSX).returned('<h1>Hello world!</h1>');
        });

      });

    });

    describe('htmlToJSX', () => {

      beforeEach(() => {
        spy(cmp, 'htmlToJSX');
        stub(cmp, 'transform').returnsArg(0);
        stub(Markup, 'childrenToJSX').returnsArg(0);
        stub(cheerio, 'load').returns({root: () => ({toArray: () => [{children: ['child', 'components']}]})});
      });

      afterEach(() => {
        cmp.htmlToJSX.restore();
        cmp.transform.restore();
        Markup.childrenToJSX.restore();
        cheerio.load.restore();
      });

      describe('no arg', () => {

        beforeEach(() => {
          cmp.htmlToJSX();
        });

        it('returns result', () => {
          expect(cmp.htmlToJSX).returned([]);
        });

      });

      describe('arg', () => {

        beforeEach(() => {
          cmp.htmlToJSX('<h1>Hello world!</h1>');
        });

        it('calls transform', () => {
          expect(cmp.transform).calledWith('<h1>Hello world!</h1>');
        });

        it('calls load', () => {
          expect(cheerio.load).calledWith('<h1>Hello world!</h1>');
        });

        it('calls childrenToJSX', () => {
          expect(Markup.childrenToJSX).calledWith(['child', 'components']);
        });

        it('returns result', () => {
          expect(cmp.htmlToJSX).returned(['child', 'components']);
        });

      });

    });

  });

});
