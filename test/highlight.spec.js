/* @flow */

import chai, {expect} from 'chai';

import {spy} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import {getCheerio, getJSX, getCodemirror, dom, domLines, transformedChildren} from './mock';

chai.use(sinonChai);

/* eslint-disable require-jsdoc */

const highlight = proxyquire('../src/highlight', {
  cheerio: getCheerio(),
  './jsx': getJSX(),
  codemirror: getCodemirror(),
  'codemirror/mode/jsx/jsx': {}
});

describe('highlight', () => {

  before(() => {
    spy(highlight, 'highlight');
    highlight.highlight('function myScript(){return 100;}');
  });

  after(() => {
    highlight.highlight.restore();
  });

  it('returns result', () => {
    expect(highlight.highlight).returned({dom, lines: domLines});
  });

});

describe('highlightHTML', () => {

  beforeEach(() => {
    spy(highlight, 'highlightHTML');
  });

  afterEach(() => {
    highlight.highlightHTML.restore();
  });

  describe('no arg', () => {

    beforeEach(() => {
      highlight.highlightHTML();
    });

    it('returns result', () => {
      expect(highlight.highlightHTML).returned('');
    });

  });

  describe('arg', () => {

    beforeEach(() => {
      highlight.highlightHTML('function myScript(){return 100;}');
    });

    it('returns result', () => {
      expect(highlight.highlightHTML).returned('html string');
    });

  });

});

describe('highlightArray', () => {

  beforeEach(() => {
    spy(highlight, 'highlightArray');
  });

  afterEach(() => {
    highlight.highlightArray.restore();
  });

  describe('no arg', () => {

    beforeEach(() => {
      highlight.highlightArray();
    });

    it('returns result', () => {
      expect(highlight.highlightArray).returned([]);
    });

  });

  describe('arg', () => {

    beforeEach(() => {
      highlight.highlightArray('function myScript(){return 100;}');
    });

    it('returns result', () => {
      expect(highlight.highlightArray).returned(transformedChildren);
    });

  });

});

describe('highlightJSX', () => {

  beforeEach(() => {
    spy(highlight, 'highlightJSX');
  });

  afterEach(() => {
    highlight.highlightJSX.restore();
  });

  describe('no arg', () => {

    beforeEach(() => {
      highlight.highlightJSX();
    });

    it('returns result', () => {
      expect(highlight.highlightJSX).returned([[]]);
    });

  });

  describe('arg', () => {

    beforeEach(() => {
      highlight.highlightJSX('function myScript(){return 100;}');
    });

    it('returns result', () => {
      expect(highlight.highlightJSX).returned([transformedChildren]);
    });

  });

});
