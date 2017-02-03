/**
 * Создаёт из gif файлов элементы `<iron-iconset-svg>` с наборами смайлов 
 * 
 */

'use strict';

global.api = {};

api.fs = require('fs');
api.vfs = require('vinyl-fs');
api.path = require('path');
api.rename = require('gulp-rename');
api.replace = require('gulp-replace');
api.inject = require('gulp-inject');
api.base64 = require('gulp-base64-inline');
api.imageSize = require('image-size');

api.transform = {};

api.transform.toImageTag = (path, file) => {
  let imageSize = api.imageSize(__dirname + path);
  return `<image id="${file.stem}" viewBox="0 0 ${imageSize.width} ${imageSize.height}" width="${imageSize.width}" height="${imageSize.height}" xlink:href="inline('../${path}')" />`
};

api.getFolders = dir => api.fs.readdirSync(dir)
    .filter(file => api.fs.statSync(api.path.join(dir, file)).isDirectory());

api.generateIconset = (pack, template, destination) => api.vfs.src(template)
    .pipe(api.rename( path => path.basename = `kolobok-${pack}-smile`))
    .pipe(api.replace('{{pack}}', pack))
    .pipe(api.inject(api.vfs.src(`./images/${pack}/*`, {read: false}), {
        starttag: '<!-- kolobki:start -->',
        endtag:   '<!-- kolobki:end -->', 
        removeTags: true,
        transform: api.transform.toImageTag
    }))
    .pipe(api.base64()) 
    .pipe(api.replace('"url(data:image/gif;', '"data:image/gif;'))
    .pipe(api.replace(')" />', '" />'))
    .pipe(api.vfs.dest(destination));

let template = './template/kolobok-iconset-template.html';
let destination = './iconset';

api.getFolders('images').forEach(pack => api.generateIconset(pack, template, destination));
