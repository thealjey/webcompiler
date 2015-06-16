#!/bin/bash
./node_modules/.bin/babel --whitelist flow,es6.modules,es6.classes,es6.templateLiterals,es6.arrowFunctions lib --out-dir docs/lib
./node_modules/.bin/jsdoc docs/lib -c conf/jsdoc.json
