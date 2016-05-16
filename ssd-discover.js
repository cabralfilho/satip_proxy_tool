/**
 * Created by jordi on 30/03/15.
 */
var configu = require('./config_rtsp.json');

exports.createSsdp = function(options) {

    var Server = require('node-ssdp').Server
        , server = new Server({
            logLevel: 'INFO',
            ssdpSig: 'SAT>IP Emu, UPnP/1.0, sat2ip-emu/nodejs/linux/0.0.1\r\nDEVICEID.SES.COM: 17',
            ssdpTtl: 2,
            adInterval: 20000,
            udn: options.uuid,
            ttl: 120,
            location: 'http://'+options.myIP+':49152/DeviceDesc.xml'
        });

    server.addUSN('upnp:rootdevice');
    //server.addUSN('uuid:'+options.uuid); // Identificador de servidor únic, sisi últims parells MAC de la màquina
    server.addUSN('urn:ses-com:device:SatIPServer:1');

    server.on('advertise-alive', function (headers) {
//      console.log('advertise-alive', headers);
        // Expire old devices from your cache.
        // Register advertising device somewhere (as designated in http headers heads)
    });

    server.on('advertise-bye', function (headers) {
//      console.log('advertise-bye', headers);
        // Remove specified device from cache.
    });

// start the server
    server.start('0.0.0.0');

    process.on('exit', function () {
        server.stop() // advertise shutting down and stop listening
    })
}