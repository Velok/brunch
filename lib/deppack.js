'use strict';

const sysPath = require('path');
const fs = require('fs');
const mediator = require('./mediator');
const modules = require('./deppack/modules');
const explore = require('./deppack/explore');

const dir = sysPath.dirname(sysPath.dirname(require.resolve('.')));
const readFile = (path, callback) => fs.readFile(path, {encoding: 'utf8'}, callback);

const wrapInModule = (filePath, opts) => new Promise((resolve, reject) => {
  if (opts == null) opts = {};
  if (opts.paths == null) {
    const ref = process.env.NODE_PATH;
    opts.paths = (ref != null ? ref.split(':') : void 0) || [];
  }
  if (opts.basedir == null) opts.basedir = process.cwd();

  filePath = sysPath.resolve(opts.basedir, filePath);

  return readFile(filePath, (err, src) => {
    if (err) return reject(err);
    resolve(modules.generateModule(filePath, src));
  });
});

const brunchRe = /brunch/;

const needsProcessing = file => file.path.indexOf('node_modules') !== -1 &&
  file.path.indexOf('.js') !== -1 &&
  !brunchRe.test(file.path) ||
  exports.isNpm(file.path);

exports.exploreDeps = explore;
exports.wrapInModule = wrapInModule;
exports.loadInit = require('./deppack/init');
exports.needsProcessing = needsProcessing;
exports.processFiles = require('./deppack/process');

exports.isShim = path => path.indexOf(dir) === 0;
exports.isNpm = path => {
  if (!mediator.npmIsEnabled) return false;
  return path.indexOf('node_modules') >= 0 &&
    !brunchRe.test(path) && path.indexOf('.css') === -1 ||
    path.indexOf(dir) === 0;
};
