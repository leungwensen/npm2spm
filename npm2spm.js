#!/usr/bin/env node
/* jshint strict: false, undef: true, unused: true */
/* global require */

var path = require('path');
var fs = require('fs');
var exec = require( 'child_process' ).exec;
var json = require('zero-encoding-json');
var sprintf = require('zero-fmt-sprintf');

var argv = require('minimist')(process.argv.slice(2), {
    default: {
        encoding: 'utf8',
        module: process.cwd(),
        publish: false,
    },
    alias: {
        m: 'module',
    }
});

var packageJsonFilename = path.join(argv.module, 'package.json');

function publish(moduleName) {
    var commands = [];
    commands.push(sprintf('cd %s', argv.module));
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

fs.readFile(packageJsonFilename, argv.encoding, function(err, data) {
    if (err) throw err;
    data = json.parse(data) || {};
    var moduleName = data.name || '';
    if (data.spm) {
        console.log(sprintf('%s is already a spm module', moduleName));
        if (argv.publish) {
            publish(moduleName);
        }
    } else {
        if (!data.main) {
            throw 'main file not found';
        }
        data.spm = {
            main: data.main,
            dependencies: data.dependencies || [],
        };
        var newContent = json.stringify(data, null, '\t');
        fs.writeFile(packageJsonFilename, newContent, argv.encoding, function(err) {
            if (err) throw err;
            console.log(sprintf('module %s is successfully converted', moduleName));
            if (argv.publish) {
                publish(moduleName);
            }
        });
    }
});

