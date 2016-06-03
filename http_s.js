var http = require('http');
var Router = require('node-simple-router');
var logger = require('winston');

exports.iniciarHttp = function (options) { //incluir path ruta variable

    var router = Router({static_route: options.path || __dirname +"/DeviceDescription"});
    var server = http.createServer(router);
    server.listen(options.port);
}