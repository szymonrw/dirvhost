#!/usr/bin/env node

var connect = require('connect');
var http    = require('http');
var fs      = require('fs');
var path    = require('path');

var dir  = path.resolve(process.argv[2] || '.');
var port = parseInt(process.argv[3], 10) || 4000;

var log_format = ':method :status :req[Host]:url';
var dir_view_options = { hidden: true, icons: true };

var app = connect();
app.use(connect.logger(log_format));
app.use(connect.compress());

http.createServer(app).listen(port);

var known_vhosts = {};

function client_query_reload () {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      location.reload();
    }
  };
  xhr.open('GET', '/__refresh', true);
  xhr.send();
}

function respond_on_change (dir_path, file_paths, res) {
  var valid = true;
  var watches = file_paths.map(function (file_path) {
    console.log(path.join(dir_path, file_path));
    return fs.watch(path.join(dir_path, file_path), function () {
      if (!valid) return;
      valid = false;
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      res.end();
    });
  });
}

function setup_vhost (dir_name) {
  if (!known_vhosts[dir_name]) {
    var domain = dir_name.replace(/ /g, '-') + ".local";
    var dir_path = path.join(dir, dir_name);

    fs.stat(dir_path, function (err, stat) {
      if (err) {
        console.error(err.stack || err);
        return;
      }

      var referers = {};

      if (stat.isDirectory()) {
        var local_app = connect();
        local_app.use(function (req, res, next) {
          var referer;
          if (req.headers.referer) {
            referer = req.headers.referer.replace(/http\:\/\/[^\/]+/, '');
          }
          console.log(referer, req.url);
          if (req.url === '/__refresh') {
            respond_on_change(dir_path, referers[referer], res);
          } else if (req.url === '/__refresh.js') {
            res.writeHead(200, {
              'Content-Type': 'text/javascript'
            });
            res.end('(' + client_query_reload + ')();');
          } else {
            if (referer) {
              if (!referers[referer]) {
                referers[referer] = [req.url];
              } else {
                referers[referer].push(req.url);
              }

              if (!referers[req.url]) {
                referers[req.url] = [req.url];
              } else {
                referers[req.url].push(req.url);
              }
            }
            next();
          }
        });
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
