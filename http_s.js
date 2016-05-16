var http = require('http');
var Router = require('node-simple-router');

exports.iniciarHttp = function (path) { //incluir path ruta variable

    var router = Router({static_route: path || __dirname +"/http-docs/SAT2IP"});
    var server = http.createServer(router);
    server.listen('49152');

    console.log("Init HTTP server on port: 49152");
}

exports.getIPAddress = function() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];

        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                return alias.address;
        }
    }

    return '0.0.0.0';
}