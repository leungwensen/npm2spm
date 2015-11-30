/* jshint strict: false, undef: true, unused: true, node: true */

var path = require('path');
var fs = require('fs');
var rp = require('request-promise');
var lang = require('zero-lang');
var promise = require('zero-async/Promise');
var sprintf = require('zero-fmt/sprintf');
var json = require('zero-encoding/json');

var DEFAULT_OPTIONS = {
  encoding: 'utf8',
  publish: false
};

module.exports = function(root, options) {
  options = lang.extend({}, DEFAULT_OPTIONS, options);
  root = root || process.cwd();

  var packageJsonFilename = path.join(root, 'package.json');

  fs.readFile(packageJsonFilename, options.encoding, function(err, data) {
    if (err) throw err;
    data = json.parse(data) || {};

    var latestVersions = {};
    var promises = [];

    function isInvalidVersion(version) {
      return version === '*';
    }

    function createRequest(version, moduleName) {
      if (!isInvalidVersion(version)) {
        return;
      }
      console.log(sprintf('resolving module: %s', moduleName));
      promises.push(
        rp({
          uri: sprintf('http://r.cnpmjs.org/%s', moduleName),
          json: true
        }, moduleName).then(function(res) {
          console.log(sprintf("module %s's package info got!", moduleName));
          if (res && res['dist-tags'] && res['dist-tags'].latest) {
            latestVersions[res.name] = res['dist-tags'].latest;
          }
        }).catch(function() {
          console.log(sprintf("[ERROR]: module %s's package info is missing!", moduleName));
        })
      );
    }
    function fixVersions(versions) {
      lang.forIn(versions, function(version, name) {
        if (isInvalidVersion(version) && latestVersions[name]) {
          versions[name] = '^' + latestVersions[name];
        }
      });
    }

    lang.forIn(data.dependencies || [], createRequest);
    lang.forIn(data.devDependencies || [], createRequest);

    promise.all(promises).then(function() {
      fixVersions(data.dependencies);
      fixVersions(data.devDependencies);

      var newContent = json.stringify(data, null, '\t');
      fs.writeFile(packageJsonFilename, newContent, options.encoding, function(err) {
        if (err) throw err;
        console.log(sprintf("module %s's dependencies is updated to latest", data.name));
      });
    });
  });
};

