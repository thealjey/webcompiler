/* @flow */

import chai, {expect} from 'chai';
import {spy} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import {getJSX} from './mock';

chai.use(sinonChai);

/* eslint-disable require-jsdoc */

const markdown = proxyquire('../src/markdown', {'./jsx': getJSX()});

describe('markdownToUnwrappedHTML', () => {

  beforeEach(() => {
    spy(markdown, 'markdownToUnwrappedHTML');
  });

  afterEach(() => {
    markdown.markdownToUnwrappedHTML.restore();
  });

  describe('unwrap', () => {

    beforeEach(() => {
      markdown.markdownToUnwrappedHTML('something');
    });

    it('returns result', () => {
      expect(markdown.markdownToUnwrappedHTML).returned('something');
    });

  });

  describe('do not unwrap', () => {

    beforeEach(() => {
      markdown.markdownToUnwrappedHTML('# something');
    });

    it('returns result', () => {
      expect(markdown.markdownToUnwrappedHTML).returned('<h1>something</h1>');
    });

  });

  describe('more than 1', () => {

    beforeEach(() => {
      markdown.markdownToUnwrappedHTML(`something
# something`);
    });

    it('returns result', () => {
      expect(markdown.markdownToUnwrappedHTML).returned(`<p>something</p>
<h1>something</h1>`);
    });

  });

});

describe('markdownToArray', () => {

  beforeEach(() => {
    spy(markdown, 'markdownToArray');
  });

  afterEach(() => {
    markdown.markdownToArray.restore();
  });

  describe('no arg', () => {

    beforeEach(() => {
      markdown.markdownToArray();
    });

    it('returns result', () => {
      expect(markdown.markdownToArray).returned([]);
    });

  });

  describe('arg', () => {

    beforeEach(() => {
      markdown.markdownToArray('# Hello world!');
    });

    it('returns result', () => {
      expect(markdown.markdownToArray).returned([{type: 'h1', props: {}, children: ['Hello world!']}]);
    });

  });

});

describe('markdownToJSX', () => {

  beforeEach(() => {
    spy(markdown, 'markdownToJSX');
  });

  afterEach(() => {
    markdown.markdownToJSX.restore();
  });

  describe('no arg', () => {

    beforeEach(() => {
      markdown.markdownToJSX();
    });

    it('returns result', () => {
      expect(markdown.markdownToJSX).returned([]);
    });

  });

  describe('arg', () => {

    beforeEach(() => {
      markdown.markdownToJSX('# Hello world!');
    });

    it('returns result', () => {
      expect(markdown.markdownToJSX).returned(['<h1>Hello world!</h1>']);
    });

  });

});

describe('markdownToHTML', () => {

  beforeEach(() => {
    spy(markdown, 'markdownToHTML');
  });

  afterEach(() => {
    markdown.markdownToHTML.restore();
  });

  describe('no arg', () => {

    beforeEach(() => {
      markdown.markdownToHTML();
    });

    it('returns result', () => {
      expect(markdown.markdownToHTML).returned('');
    });

  });

  describe('arg', () => {

    beforeEach(() => {
      markdown.markdownToHTML('# Hello world!');
    });

    it('returns html', () => {
      expect(markdown.markdownToHTML).returned('<h1>Hello world!</h1>');
    });

  });

});
