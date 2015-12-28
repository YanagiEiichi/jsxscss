#!/usr/bin/env node

var Capacitance = require('capacitance');
var argollector = require('argollector');
var bfs = require('babel-fs');
var glob = require('glob');

var sass = require('node-sass');
var babel = require('babel');

var uuid = function() {
  var s = '';
  for(var i = 0; i < 4; i++) {
    s += '0000000'.concat(Math.floor(Math.random() * 2821109907456).toString(36)).slice(-8);
  }
  return s;
};

var verbose = !!(argollector['-v'] || argollector['--verbose']);

var compile = function(source) {
  // 从源码中取出所有 Scss 标签，替换成占位符并放入 scssTags
  var scssTags = [];
  source = String(source || '').replace(/<Scss(.*?)>([\s\S]*?)<\/Scss>/g, function($0, attrs, contents) {
    var id = uuid();
    var templates = [];
    // 保存 es6 template 的模板
    contents = contents.replace(/\$\{[\s\S]*?\}/g, function(template) {
      var id = uuid();
      templates.push({ template: template, id: id });
      return id;
    });
    scssTags.push({ id: id, attrs: attrs, contents: contents, templates });
    return id;
  });
  // 处理 scssTags 中的数据
  var tasks = scssTags.map(function(tag) {
    return new Promise(function(resolve, reject) {
      var done = function(error, result) {
        if(error) return reject(error);
        var css = String(result.css);
        css = tag.templates.reduce(function(css, item) {
          return css.replace(new RegExp(item.id, 'g'), item.template);
        }, css);
        tag.css = '<Css' + tag.attrs + '>{`' + css + '`}</Css>';
        resolve(tag);
      };
      tag.contents ? sass.render({ data: tag.contents }, done) : done(null, { css: '' });
    });
  });
  // 合并回源文件，替换占位符
  return Promise.all(tasks).then(function(list) {
    source = list.reduce(function(source, tag) {
      return source.replace(new RegExp(tag.id, 'g'), tag.css);
    }, source);
    return babel.transform(source, { stage: 0 }).code;
  });
};


// 读入参数中的文件列表，并做 glob 处理
Promise.all(
  argollector.map(function(path) {
    return new Promise(function(resolve, reject) {
      glob(path, function(error, list) {
        error ? reject(error) : resolve(list);
      });
    });
  })
)

// 根据参数选择不同的处理方式
.then(function(list) {
  list = [].concat.apply([], list);
  // 如果有传入参数就解析并处理
  if(list.length) {
    return Promise.all(
      list.map(function(path) {
        return bfs.readFile(path, 'utf-8').then(compile).then(function(data) {
          if(verbose) console.log(path + '\t' + data.length + 'bytes');
          return bfs.writeFile(path, data);
        });
      })
    );
  }
  // 如果参数列表为空就从 stdin 读入
  if(!list.length) {
    return process.stdin.pipe(new Capacitance).then(compile).then(function(data) {
      return new Promise(function(resolve) {
        if(process.stdout.write(data)) resolve();
        process.stdout.on('drain', resolve);
      });
    })
  }
})

// 退出码与异常处理
.then(function() {
  process.exit(0);
}).catch(function(error) {
  console.error('[31m' + (error.stack || error.message || JSON.stringify(error)) + '[0m');
  process.exit(1);
});
