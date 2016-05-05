var http = require('http');
var Router = require('node-simple-router');

exports.iniciarHttp = function (path) { //incluir path ruta variable

    var router = Router({static_route: path || __dirname +"/http-docs"});
    var server = http.createServer(router);
    server.listen('49152');

    console.log("Init HTTP server on port: 49152");
}

