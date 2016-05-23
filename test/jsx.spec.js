/* @flow */

import chai, {expect} from 'chai';
import {spy} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import {getCheerio, getReact, dom, domChildren, transformedChildren, domElement, transformedElement,
  reactElement} from './mock';

chai.use(sinonChai);

/* eslint-disable require-jsdoc */

const cheerio = getCheerio(),
  react = getReact(),
  jsx = proxyquire('../src/jsx', {cheerio, react});

let object;

describe('parseHTML', () => {

  before(() => {
    spy(jsx, 'parseHTML');
    jsx.parseHTML('something here');
  });

  after(() => {
    jsx.parseHTML.restore();
  });

  it('passes the html on to cheerio', () => {
    expect(cheerio.load).calledWith('something here');
  });

  it('returns the result', () => {
    expect(jsx.parseHTML).returned({dom, children: domChildren});
  });

});

describe('toJSXKey', () => {

  beforeEach(() => {
    spy(jsx, 'toJSXKey');
  });

  afterEach(() => {
    jsx.toJSXKey.restore();
  });

  describe('ms', () => {

    beforeEach(() => {
      jsx.toJSXKey('-ms-something');
    });

    it('does not capitalize the prefix', () => {
      expect(jsx.toJSXKey).returned('msSomething');
    });

  });

  describe('webkit', () => {

    beforeEach(() => {
      jsx.toJSXKey('-webkit-something');
    });

    it('capitalizes the prefix', () => {
      expect(jsx.toJSXKey).returned('WebkitSomething');
    });

  });

});

describe('transformStyle', () => {

  describe('does not have', () => {

    before(() => {
      object = {unknown: 'value'};
      jsx.transformStyle(object);
    });

    it('does not modify the object', () => {
      expect(object).eql({unknown: 'value'});
    });

  });

  describe('has', () => {

    before(() => {
      object = {unknown: 'value', style: 'min-width:50px; : blah'};
      jsx.transformStyle(object);
    });

    it('modifies the object', () => {
      expect(object).eql({unknown: 'value', style: {minWidth: '50px'}});
    });

  });

});

describe('rename', () => {

  describe('does not have', () => {

    before(() => {
      object = {unknown: 'value'};
      jsx.rename(object, 'oldKey', 'newKey');
    });

    it('does not modify the object', () => {
      expect(object).eql({unknown: 'value'});
    });

  });

  describe('has', () => {

    before(() => {
      object = {unknown: 'value', oldKey: 'something'};
      jsx.rename(object, 'oldKey', 'newKey');
    });

    it('modifies the object', () => {
      expect(object).eql({unknown: 'value', newKey: 'something'});
    });

  });

});

describe('transformElement', () => {

  before(() => {
    spy(jsx, 'transformElement');
    jsx.transformElement(domElement);
  });

  after(() => {
    jsx.transformElement.restore();
  });

  it('returns result', () => {
    expect(jsx.transformElement).returned(transformedElement);
  });

});

describe('transformElements', () => {

  beforeEach(() => {
    spy(jsx, 'transformElements');
  });

  afterEach(() => {
    jsx.transformElements.restore();
  });

  describe('args', () => {

    beforeEach(() => {
      jsx.transformElements(domChildren);
    });

    it('returns result', () => {
      expect(jsx.transformElements).returned(transformedChildren);
    });

  });

  describe('no args', () => {

    beforeEach(() => {
      jsx.transformElements();
    });

    it('returns result', () => {
      expect(jsx.transformElements).returned([]);
    });

  });

});

describe('flatten', () => {

  before(() => {
    spy(jsx, 'flatten');
    jsx.flatten('something ', ['here', null, {value: 2, other: [true]}]);
  });

  after(() => {
    jsx.flatten.restore();
  });

  it('returns result', () => {
    expect(jsx.flatten).returned(['something here', {value: 2, other: [true]}]);
  });

});

describe('arrayToJSX', () => {

  beforeEach(() => {
    spy(jsx, 'arrayToJSX');
  });

  afterEach(() => {
    jsx.arrayToJSX.restore();
  });

  describe('args', () => {

    beforeEach(() => {
      jsx.arrayToJSX([transformedElement]);
    });

    it('returns result', () => {
      expect(jsx.arrayToJSX).returned([reactElement]);
    });

  });

  describe('no args', () => {

    beforeEach(() => {
      jsx.arrayToJSX();
    });

    it('returns result', () => {
      expect(jsx.arrayToJSX).returned([]);
    });

  });

});

describe('htmlToArray', () => {

  beforeEach(() => {
    spy(jsx, 'htmlToArray');
  });

  afterEach(() => {
    jsx.htmlToArray.restore();
  });

  describe('args', () => {

    beforeEach(() => {
      jsx.htmlToArray('<h1>Hello world!</h1>');
    });

    it('returns result', () => {
      expect(jsx.htmlToArray).returned(transformedChildren);
    });

  });

  describe('no args', () => {

    beforeEach(() => {
      jsx.htmlToArray();
    });

    it('returns result', () => {
      expect(jsx.htmlToArray).returned([]);
    });

  });

});

describe('htmlToJSX', () => {

  beforeEach(() => {
    spy(jsx, 'htmlToJSX');
  });

  afterEach(() => {
    jsx.htmlToJSX.restore();
  });

  describe('args', () => {

    beforeEach(() => {
      jsx.htmlToJSX('<h1>Hello world!</h1>');
    });

    it('returns result', () => {
      expect(jsx.htmlToJSX).returned([reactElement, 'text node']);
    });

  });

  describe('no args', () => {

    beforeEach(() => {
      jsx.htmlToJSX();
    });

    it('returns result', () => {
      expect(jsx.htmlToJSX).returned([]);
    });

  });

});
