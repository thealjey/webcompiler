/* @flow */

import {spy, stub} from 'sinon';
import noop from 'lodash/noop';
import constant from 'lodash/constant';
import {htmlToArray, parseHTML, transformElements} from '../src/jsx';

/* eslint-disable require-jsdoc */
/* eslint-disable class-methods-use-this */

export const domElement = {type: 'tag', name: 'input', attribs: {}, children: [
  {name: 'textarea', attribs: {}, children: [
    {type: 'text', data: 'Hello world!'}
  ]}
]};
export const transformedElement = {type: 'input', props: {}, children: [
  {type: 'textarea', props: {defaultValue: 'Hello world!'}, children: []}
]};
export const domChildren = [
  {type: 'comment'},
  domElement,
  {type: 'text', data: 'text node'}
];
export const transformedChildren = [
  transformedElement,
  'text node'
];
export const reactElement = ['input', {key: 0}, ['textarea', {defaultValue: 'Hello world!', key: 0}]];
export const domLines = {find: constant({removeAttr: noop}), toArray: constant(domChildren)};
export const dom = constant(domLines);

dom.root = constant({toArray: constant([{children: domChildren}])});
dom.html = constant('html string');

const cheerioLoad = constant(dom);

function createElement(...args: any[]) {
  return args;
}

export function getCheerio() {
  return {load: spy(cheerioLoad)};
}

export function getReact() {
  return {createElement: spy(createElement)};
}

export function getJSX() {
  return {htmlToArray, parseHTML, transformElements, arrayToJSX: createElement, htmlToJSX: createElement};
}

export function getCodemirror() {
  return spy();
}

export class WebpackDevServer {

  webpackInstance: any;

  config: Object;

  app: Object = {webpack: 'Application'};

  listen = stub();

  use = stub();

  constructor(webpackInstance: any, config: Object) {
    this.webpackInstance = webpackInstance;
    this.config = config;
  }

}

export class Server {
  changed = stub();
  listen = stub();
}

export class HotModuleReplacementPlugin {}

export class DefinePlugin {}

export class OccurrenceOrderPlugin {}

export class DedupePlugin {}

export class UglifyJsPlugin {}

export function getWebpack(c: any) {
  const wp = stub().returns(c);

  wp.optimize = {OccurrenceOrderPlugin, DedupePlugin, UglifyJsPlugin};
  wp.DefinePlugin = DefinePlugin;
  wp.HotModuleReplacementPlugin = HotModuleReplacementPlugin;

  return wp;
}

export class Client {
  capabilityCheck: () => void;
  command: () => void;
  on: () => void;
  end: () => void;
}
Client.prototype.capabilityCheck = noop;
Client.prototype.command = noop;
Client.prototype.on = noop;
Client.prototype.end = noop;
