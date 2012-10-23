#!/usr/bin/env node
'use strict';

var connect = require('connect');
var http    = require('http');
var fs      = require('fs');
var path    = require('path');

var dir  = path.resolve(process.argv[2] || '.');
var port = parseInt(process.argv[3], 10) || 4000;

var log_format = ':method :status :req[Host]:url';
var dir_view_options = { hidden: true, icons: true };

var app = connect()
app.use(connect.logger(log_format));

http.createServer(app).listen(port);

var known_vhosts = {};

function setup_vhost (dir_name) {
  if (!known_vhosts[dir_name]) {
    var domain = dir_name.replace(/ /g, '-') + ".local";
    var dir_path = path.join(dir, dir_name);

    fs.stat(dir_path, function (err, stat) {
      if (err) {
        console.error(err.stack || err);
        return;
      }

      if (stat.isDirectory()) {
        var local_app = connect();
        local_app.use(connect.static(dir_path));
        local_app.use(connect.directory(dir_path, dir_view_options));

        app.use(connect.vhost(domain, local_app));
        known_vhosts[dir_name] = true;

        console.log('Serving ' + dir_path + ' as http://' + domain + ':' + port);
      }
    });
  }
}

function refresh () {
  fs.readdir(dir, function (err, list) {

    if (err) {
      console.error(err.stack || err);
      process.exit(1);
    }

    list.forEach(setup_vhost);
  });
}

fs.watch(dir, refresh);

refresh();
