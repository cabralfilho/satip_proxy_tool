/**
 * Created by jordi on 29/03/15.
 */
var httpServer = require('./http_s.js');
var xmlConstructor = require('./xmlConstructor.js');
var stdio = require('stdio');
var ssdpDiscovery = require('./ssd-discover.js');
var FinalProxy = require('./Final_proxy.js');
var GeneralFunctions = require('./general_functions.js');

// ############### Initialize Proxy ###############

var options = stdio.getopt({
    'config': {
        key: 'c',
        description: 'Arxiu configuració SSDP',
        args: 1
    },
    'path': {
        key: 'p',
        description: "Path arxiu configuració",
        args: 1
    },
    'deviceType': {
        key: 'd',
        description: 'Especificar deviceType al XML',
        args: 1
    },
    'friendlyName': {
        key: 'n',
        description: 'Especificar friendlyName al XML',
        args: 1
    },
    'manufacturer': {
        key: 'm',
        description: 'Especificar manufacturer al XML',
        args: 1
    },
    'manufacturerURL': {
        key: 'U',
        description: 'Especificar manufacturerURL al XML',
        args: 1
    },
    'modelDescription': {
        key: 'r',
        description: 'Especificar modelDescription al XML',
        args: 1
    },
    'modelURL': {
        key: 'u',
        description: 'Especificar modelURL al XML',
        args: 1
    },
    'modelName': {
        key: 'q',
        description: 'Especificar modelName al XML',
        args: 1
    },
    'udn': {
        key: 'v',
        description: 'Especificar udn al XML',
        args: 1
    },
    'modelNumber': {
        key: 'b',
        description: 'Especificar modelNumber al XML',
        args: 1
    },
    'serialNumber': {
        key: 's',
        description: 'Especificar serialNumber al XML',
        args: 1
    },
    'UPC': {
        key: 't',
        description: 'Especificar UPC al XML',
        args: 1
    },
    'satipX_SATIPCAP': {
        key: 'x',
        description: 'Especificar satipX_SATIPCAP al XML',
        args: 1
    }



});


GeneralFunctions.uuidGenerator( function (uuidP) {
    GeneralFunctions.myIP(function(myIP) {

        options.myIP = myIP;
        options.uuid = uuidP;

        xmlConstructor.initialize(options);

        httpServer.iniciarHttp(options.path);

        ssdpDiscovery.createSsdp(options);

        FinalProxy.CreateProxySatIP();
    });
});


