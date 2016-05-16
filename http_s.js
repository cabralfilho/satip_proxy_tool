var http = require('http');
var Router = require('simple-router');

exports.iniciarHttp = function (path) { //incluir path ruta variable

    var router = Router({static_route: path || __dirname +"/http-docs/SAT2IP"});
    var server = http.createServer(router);
    server.listen('49152');

    console.log("Init HTTP server on port: 49152");
}