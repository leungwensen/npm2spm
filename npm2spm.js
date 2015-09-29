#!/usr/bin/env node
/* jshint strict: false, undef: true, unused: true */
/* global require */

var path = require('path');
var fs = require('fs');
var json = require('zero-encoding-json');

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

fs.readFile(packageJsonFilename, argv.encoding, function(err, data) {
    if (err) throw err;
    data = json.parse(data);
    if (data.spm) {
        throw 'Already a spm module';
    }
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
        console.log('module ' + (data.name || '') + ' is successfully converted');
    });
});

