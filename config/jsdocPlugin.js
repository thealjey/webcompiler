var commentPattern = /\/\*\*[\s\S]+?\*\//g,
    notNewLinePattern = /[^\n]/g,
    extname = require('path').extname,
    extension = '.js',
    comments;

exports.handlers = {
  beforeParse: function (e) {
    if (extension === extname(e.filename)) {
      comments = e.source.match(commentPattern);
      e.source = comments ? e.source.split(commentPattern).reduce(function(result, source, i) {
        return result + source.replace(notNewLinePattern, '') + comments[i];
      }, '') : e.source.replace(notNewLinePattern, '');
    }
  }
};
