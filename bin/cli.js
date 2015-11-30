#!/usr/bin/env node
/* jshint esnext: true, node: true, loopfunc: true, undef: true, unused: true */

var commander = require('commander');
var path = require('path');

var pkg = require(path.resolve(__dirname, '../package.json'));

commander.version(pkg.version);

// 2spm
commander
  .command('2spm [root]')
  .description('convert package to spm-format')
  .option('-e, --encoding [encoding]', 'encoding of package.json file')
  .option('-p, --publish', 'publish to spmjs.io')
  .action(function(root, options) {
    require('../lib/2spm')(root, options);
  });

// dependencies
commander
  .command('dependencies [root]')
  .description('manage dependencies in package.json')
  .option('-l, --2latest', 'dependencies to latest version')
  .action(function(root, options) {
    require('../lib/dependencies')(root, options);
  });

commander.parse(process.argv);

if (process.argv.length === 2) {
  commander.outputHelp();
}

