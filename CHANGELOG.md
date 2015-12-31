v3.0.4 - Thu, 31 Dec 2015 01:15:12 GMT
--------------------------------------

- [4299688](../../commit/4299688) [removed] redundant Number conversion in `watch`
- [6da6e97](../../commit/6da6e97) [changed] the markdown JSDoc plugin is now included by default; added a broader description of the default plugin to the Documentation class
- [111046e](../../commit/111046e) [removed] obsolete "babel" package dependency



v3.0.3 - Wed, 30 Dec 2015 16:49:16 GMT
--------------------------------------

- [b174e99](../../commit/b174e99) [fixed] read the babel config options from under the "env" key
- [20cc69e](../../commit/20cc69e) [fixed] updated autoprefixer



v3.0.2 - Tue, 29 Dec 2015 10:10:46 GMT
--------------------------------------

- [cfc0d4a](../../commit/cfc0d4a) [fixed] added a codeclimate config



v3.0.1 - Mon, 28 Dec 2015 17:43:13 GMT
--------------------------------------

- [44908e7](../../commit/44908e7) [fixed] added back the coveralls dev dependency



v3.0.0 - Mon, 28 Dec 2015 17:15:00 GMT
--------------------------------------

- [4d4c980](../../commit/4d4c980) [changed] everything :) There were too many interconnected changes in this release for any kind of meaningful changelog. Just visit the all new API docs to get started!
- [7daa43f](../../commit/7daa43f) [added] documentation generation as a separate script
- [5f1f1f3](../../commit/5f1f1f3) [fixed] documentation
- [5097059](../../commit/5097059) [changed] updated flow ignore list and created interface files for all of the project dependencies
- [bcda000](../../commit/bcda000) [fixed] updated to ESLint v1.8.0
- [fd40706](../../commit/fd40706) [fixed] removed peerDependencies and added a requirement for the NodeJS version (>=4.1.1) as well as NPM (>=3.0.0)
- [6acff11](../../commit/6acff11) [fixed] travis caching enabled
- [22770c4](../../commit/22770c4) [removed] specific c++ compier version dependency from the travis config



v2.0.10 - Thu, 29 Oct 2015 23:00:47 GMT
---------------------------------------

- [79e984b](../../commit/79e984b) [fixed] updated the c++ compiler in travis



v2.0.9 - Thu, 29 Oct 2015 22:56:59 GMT
--------------------------------------

- [eaa06da](../../commit/eaa06da) [fixed] updated the c++ compiler in travis



v2.0.8 - Thu, 29 Oct 2015 22:23:47 GMT
--------------------------------------

- [0f30afe](../../commit/0f30afe) [fixed] updated dependencies
- [a6414b4](../../commit/a6414b4) [changed] switched from Slack to Discord
- [129b423](../../commit/129b423) [fixed] webpack noParse in jsWebCompile for any file a path for which contains the word "browser"



v2.0.7 - Tue, 27 Oct 2015 12:52:49 GMT
--------------------------------------

- [86f48d9](../../commit/86f48d9) [changed] API docs theme



v2.0.6 - Mon, 26 Oct 2015 15:41:34 GMT
--------------------------------------

- [e30aed3](../../commit/e30aed3) [fixed] updated dependencies



v2.0.5 - Wed, 14 Oct 2015 15:49:07 GMT
--------------------------------------

- [9d09fd1](../../commit/9d09fd1) [fixed] updated readme



v2.0.4 - Fri, 09 Oct 2015 22:44:03 GMT
--------------------------------------

- [e463cd8](../../commit/e463cd8) [fixed] updated README



v2.0.3 - Fri, 09 Oct 2015 22:37:20 GMT
--------------------------------------

- [64e683d](../../commit/64e683d) [changed] README.docs.md -> doc_readme.md



v2.0.2 - Fri, 09 Oct 2015 21:47:28 GMT
--------------------------------------

- [43a8c85](../../commit/43a8c85) [fixed] force push the correct docs folder :) [ci skip]



v2.0.1 - Fri, 09 Oct 2015 21:45:10 GMT
--------------------------------------

- [f5f46aa](../../commit/f5f46aa) [fixed] force push the docs [ci skip]



v2.0.0 - Fri, 09 Oct 2015 21:37:12 GMT
--------------------------------------

- [15d1079](../../commit/15d1079) [added] postpublish hook that automatically pushes the generated docs
- [9bee23b](../../commit/9bee23b) [added] updated readme to include a mention about the Watchman requirement
- [84fa46e](../../commit/84fa46e) [fixed] jsWebCompile improved performance in development mode, advanced optimizations in production
- [9d0ab0b](../../commit/9d0ab0b) [added] a watch method based on Facebook Watchman as a replacement for the soon to be deprecated simple-recursive-watch
- [9130266](../../commit/9130266) [added] gitignore rule for .idea



v1.5.4 - Wed, 07 Oct 2015 09:09:19 GMT
--------------------------------------

- [d4a8b1b](../../commit/d4a8b1b) [fixed] disabled the react/sort-comp rule



v1.5.3 - Sun, 04 Oct 2015 17:58:34 GMT
--------------------------------------

- [566d2db](../../commit/566d2db) [fixed] yaml indentation issue



v1.5.2 - Sun, 04 Oct 2015 17:41:38 GMT
--------------------------------------

- [0c90d71](../../commit/0c90d71) [fixed] updated eslint to v1.6.0 and enabled the no-negated-condition rule



v1.5.1 - Fri, 02 Oct 2015 01:02:36 GMT
--------------------------------------

- [829dee3](../../commit/829dee3) [fixed] minor linting problems



v1.5.0 - Tue, 29 Sep 2015 21:41:16 GMT
--------------------------------------

- [d4ad959](../../commit/d4ad959) [changed] inherit eslint-config-airbnb with some refined best practices
- [6a0a6eb](../../commit/6a0a6eb) [fixed] updated 3rd party dependencies
- [d6a7c07](../../commit/d6a7c07) [fixed] updated to Flow v0.16.0
- [1ecb8ab](../../commit/1ecb8ab) [fixed] jsdoc for optinal arguments contains the default value
- [111d8a9](../../commit/111d8a9) [fixed] updated to NodeJS v4.1.1
- [235dd29](../../commit/235dd29) [added] a port number argument into the DevServer constructor
- [0715999](../../commit/0715999) [fixed] only execute tests after a successful build
- [a25ba24](../../commit/a25ba24) [fixed] NativeProcess does not crash when inheriting stdio
- [a4b43a3](../../commit/a4b43a3) [fixed] do not include a "generated on" timestamp in the footer of the documentation files
- [735d9fa](../../commit/735d9fa) [fixed] made flow ignore all folders except for "lib" and "node_modules"



### v1.4.1

* moved away from the now deprecated "autoprefixer-core" to "autoprefixer"

### v1.4.0

* added a development server component designed specifically for very rapid and comfortable application development,
  built on top of the webpack development server + optionally, react hot loader
* updated ESLint to v1.2.0

### v1.3.2

* increased the maximum allowed number of arguments a JavaScript function can have to 10

### v1.3.0

* upgraded to ESLint 1.0!
* much improved default JavaScript linter rules

### v1.2.2

* updated to the latest babel-eslint

### v1.2.0

* classes JS and SASS - made "feDev" faster by removing all the validations, the point of this method is to provide as
  fast as possible recompilations for rapid development
* class SASS - "feDev" also adds the browser vendor prefixes, which degrades the compilation speed slightly, but allows
  the developer to immediately see the end result without worrying about browser incompatibilities

### v1.1.1

* class JS - faster source map generation on incremental rebuilds in development mode

### v1.1.0

* classes JS and SASS - renamed method "fe" to "feProd"
* classes JS and SASS - introduced a new method "feDev", much faster, but not optimized for production

### v1.0.2

* added a rule to .flowconfig to ignore "spec" directories of the vendor modules

### v1.0.0

* added sane default rules for the SASS linter
* added a rule for cyclomatic complexity checks of the JavaScript code
* removed a requirement for naming all functions
* exposed all of the internal APIs for easier composition and reuse
* added full test coverage

### v0.3.5

* JavaScript for Node now preserves all comments, excluding the flow pragma

### v0.3.2

* JavaScript for Node now preserves all comments, including JSDoc's, perfect for automatic API documentation generation
* Updated **".flowconfig"** (see README)
* `NativeProcess#run` now accepts an additional config object

### v0.3.0

* Introduced much stricter JavaScript linting rules
* Added automatic API documentation generation
