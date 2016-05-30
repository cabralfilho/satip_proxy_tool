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
        description: 'SSDP config file',
        args: 1
    },
    'path': {
        key: 'p',
        description: "Path configuration file",
        args: 1
    },
    'deviceType': {
        key: 'd',
        description: 'Set deviceType in XML',
        args: 1
    },
    'friendlyName': {
        key: 'n',
        description: 'Set friendlyName in XML',
        args: 1
    },
    'manufacturer': {
        key: 'm',
        description: 'Set manufacturer in XML',
        args: 1
    },
    'manufacturerURL': {
        key: 'U',
        description: 'Set manufacturerURL in XML',
        args: 1
    },
    'modelDescription': {
        key: 'r',
        description: 'Set modelDescription in XML',
        args: 1
    },
    'modelURL': {
        key: 'u',
        description: 'Set modelURL in XML',
        args: 1
    },
    'modelName': {
        key: 'q',
        description: 'Set modelName in XML',
        args: 1
    },
    'udn': {
        key: 'v',
        description: 'Set udn in XML',
        args: 1
    },
    'modelNumber': {
        key: 'b',
        description: 'Set modelNumber in XML',
        args: 1
    },
    'serialNumber': {
        key: 's',
        description: 'Set serialNumber in XML',
        args: 1
    },
    'UPC': {
        key: 't',
        description: 'Set UPC in XML',
        args: 1
    },
    'satipX_SATIPCAP': {
        key: 'x',
        description: 'Set satipX_SATIPCAP in XML',
        args: 1
    },
    'verbose': {
        key: 'V',
        description: 'Enable Verbose',
        args: 0
    }
});

GeneralFunctions.uuidGenerator( function (uuidP) {

        options.myIP = GeneralFunctions.myIP();
        options.uuid = uuidP;

        xmlConstructor.initialize(options);

        httpServer.iniciarHttp(options.path);

        ssdpDiscovery.createSsdp(options);

        FinalProxy.CreateProxySatIP(options);

});


