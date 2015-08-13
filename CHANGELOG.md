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
