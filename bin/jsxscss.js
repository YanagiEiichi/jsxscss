#!/usr/bin/env node
var sass = require('node-sass/lib/index.js');
var buffers = [];
process.stdin.on('data', function(raw) { buffers.push(raw); });
process.stdin.on('end', function() {
  var source = Buffer.concat(buffers) + '';
  source = source.replace(/<Scss(.*?)>([\s\S]*?)<\/Scss>/g, function($0, attrs, contents) {
    var css = sass.renderSync({ data: contents }).css;
    return '<Css' + attrs + '>{`' + css + '`}</Css>';
  });
  process.stdout.write(source);
  process.exit(0);
});
