var sass = require('./node_modules/node-sass/lib/index.js');

module.exports = function(source) {
  source = source.replace(/<Scss(.*?)>([\s\S]*?)<\/Scss>/g, function($0, attrs, contents) {
    var css = sass.renderSync({ data: contents }).css;
    return '<Css' + attrs + '>{`' + css + '`}</Css>';
  });
  this.callback(null, source);
};
