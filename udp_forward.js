/**
 * Created by jordi on 09/03/15.
 */
var logger = require('winston');

var UdProxy = function(toAddress, toPort, localPort) {
    this.toAddress = toAddress;
    this.toPort = toPort;
    this.localPort = localPort;

    var proxy = require('udp-proxy'),


        options = {
            address: this.toAddress,
            port: this.toPort,
            localaddress: '0.0.0.0',
            localport: this.localPort,
            timeOutTime: 2000
        };
// This is the function that creates the server, each connection is handled internally
    var server = proxy.createServer(options);


// this should be obvious
    server.on('listening', function (details) {
        logger.debug('udp-proxy-server ready on', details.server.family + '  ' + details.server.address + ':' + details.server.port);
        logger.debug('traffic is forwarded to ' + details.target.family + '  ' + details.target.address + ':' + details.target.port);

    });

// 'bound' means the connection to server has been made and the proxying is in action
    server.on('bound', function (details) {
        //console.log('proxy is bound to ' + details.route.address + ':' + details.route.port);
        //console.log('peer is bound to ' + details.peer.address + ':' + details.peer.port);
    });

// 'message' is emitted when the server gets a message
    server.on('message', function (message, sender) {
        //console.log('message from ' + sender.address + ':' + sender.port);
    });

// 'proxyMsg' is emitted when the bound socket gets a message and it's send back to the peer the socket was bound to
    server.on('proxyMsg', function (message, sender) {
        //console.log('answer from ' + sender.address + ':' + sender.port);
    });

// 'proxyClose' is emitted when the socket closes (from a timeout) without new messages
    server.on('proxyClose', function (peer) {
        logger.debug('Disconnecting socket from ' + peer.address);
    });

    server.on('proxyError', function (err) {
        console.log('ProxyError! ' + err);
        logger.error('ProxyError! ' + err);
    });

    server.on('error', function (err) {
        console.log('Error! ' + err);
        logger.error('Error! ' + err);

    });
}
exports.createUdpforward= function (toAddress, toPort, localPort) {
    return new UdProxy(toAddress, toPort, localPort);
};