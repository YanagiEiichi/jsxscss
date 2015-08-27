#!/usr/bin/env node
var sass = require('node-sass/lib/index.js');
var buffers = [];
var uuid = function() {
  var s = '';
  for(var i = 0; i < 4; i++) {
    s += '0000000'.concat(Math.floor(Math.random() * 2821109907456).toString(36)).slice(-8);
  }
  return s;
};
process.stdin.on('data', function(raw) { buffers.push(raw); });
process.stdin.on('end', function() {
  var source = Buffer.concat(buffers) + '';
  source = source.replace(/<Scss(.*?)>([\s\S]*?)<\/Scss>/g, function($0, attrs, contents) {
    var templates = [];
    contents = contents.replace(/\$\{[\s\S]*?\}/g, function(template) {
      var id = uuid();
      templates.push({ template: template, id: id });
      return id;
    });
    var css = sass.renderSync({ data: contents }).css + '';
    css = templates.reduce(function(css, item) {
      return css.replace(new RegExp(item.id, 'g'), item.template);
    }, css);
    return '<Css' + attrs + '>{`' + css + '`}</Css>';
  });
  process.stdout.write(source);
  process.exit(0);
});
