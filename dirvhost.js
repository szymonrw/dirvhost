#!/usr/bin/env node
'use strict';

var connect = require('connect');
var http    = require('http');
var fs      = require('fs');

var log_format = ':method :status :req[Host]:url'

var app = connect().use(connect.logger(log_format));

fs.readdir('.', function (err, list) {
  list.forEach(function (dir_name) {
    app.use(connect.vhost(dir_name + ".local", connect.static(dir_name)));
  });

  http.createServer(app).listen(4000);
});
