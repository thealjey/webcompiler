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

    if (!comments) {
      e.source = source.replace(notN, '');

      return;
    }

    e.source = source.split(cmt).reduce((result, source, i) => result + source.replace(notN, '') + comments[i], '');
  }

};
