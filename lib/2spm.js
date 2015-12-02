/* jshint strict: false, undef: true, unused: true, node: true */

var path = require('path');
var fs = require('fs');
var exec = require('child_process' ).exec;
var lang = require('zero-lang');
var json = require('zero-encoding/json');
var sprintf = require('zero-fmt/sprintf');

var DEFAULT_OPTIONS = {
  encoding: 'utf8',
  publish: false
};

module.exports = function(root, options) {
  options = lang.extend({}, DEFAULT_OPTIONS, options);
  root = root || process.cwd();

  var packageJsonFilename = path.join(root, 'package.json');

  function publish(moduleName) {
    var commands = [];
    commands.push(sprintf('cd %s', root));
    commands.push('spm publish');
    exec(commands.join(' && '), function(err, stdout, stderr) {
      if (!err) {
        console.log(stdout);
        console.log(sprintf('module %s is successfully published', moduleName));
      } else {
        console.log(stderr);
        throw sprintf('failed to publish module %s', moduleName);
      }
    });
  }

  fs.readFile(packageJsonFilename, options.encoding, function(err, data) {
    if (err) throw err;
    data = json.parse(data) || {};
    var moduleName = data.name || '';
    if (!data.main) {
      throw 'main file field missing in package.json!';
    }
    if (data.spm) {
      console.log(sprintf('%s is already a spm module', moduleName));
    }
    if (!data.spm || options.force) {
      data.spm = {
        main: data.main,
        dependencies: data.dependencies || [],
      };
    }
    var newContent = json.stringify(data, null, '\t');
    fs.writeFile(packageJsonFilename, newContent, options.encoding, function(err) {
      if (err) throw err;
      console.log(sprintf('module %s is successfully converted', moduleName));
      if (options.publish) {
        publish(moduleName);
      }
    });
  });
};

