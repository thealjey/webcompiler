/* @flow */

const {extname} = require('path');

/* eslint-disable lodash/prefer-lodash-method */
/* eslint-disable flowtype/require-parameter-type */

const cmt = /\/\*\*[\s\S]+?\*\//g,
  notN = /[^\n]/g,
  ext = '.js';

exports.handlers = {

  /* @flowignore */
  beforeParse(e) {
    const {filename, source} = e;

    if (ext !== extname(filename)) {
      return;
    }
    const comments = source.match(cmt);

    e.source = comments
      ? source.split(cmt).reduce((res, src, i) => res + src.replace(notN, '') + comments[i], '')
      : source.replace(notN, '');
  }

};
