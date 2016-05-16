var httpserver = require('./http_s.js');
var stdio = require('stdio');
var fs = require('fs');
var configuration = require('./config_rtsp.json');


var builder = require('xmlbuilder').create('root');
var parameterConflictive1 = "satip:X_SATIPCAP xmlns:satip=";
var initializer = function(config) {
    console.log(config.uuid);

    var proxyPort = configuration.localproxy.serverPort; // Port on es connecta el client SAT>IP

    var defaults = {
        device: {
            deviceType: "urn:ses-com:device:SatIPServer:1" ,
            friendlyName: config.friendlyName ||"Sat>IP Proxy ",
            manufacturer: config.manufacturer ||"JFv",
            manufacturerURL: config.manufacturerURL ||"http://www.alitech.com",
            modelDescription: config.modelDescription ||"Sat>IP proxy",
            modelURL: config.modelURL ||"http://www.alitech.com",
            modelName: config.modelName ||"SAT>IP PROXY TEST",
            modelNumber: config.modelNumber ||"0.0.0.1",
            serialNumber: config.serialNumber ||"PCSATIP-1JFVSAT",
            UDN: "uuid:"+config.uuid,// Generate and return a RFC4122 v1 (timestamp-based)
            presentationURL: "http://"+httpserver.getIPAddress()+":"+ proxyPort

    //UPC: config.UPC ||"Psat",
            //"satip": "urn:ses-com:satip>DVBT-1",
            //a: config.satipX_SATIPCAP ||"DVBT-1,DVBS-2", // ERROR EN EL DOCUMENT HA DE SER: "satip:X_SATIPCAP", falten els ":"
            //DiscoviServiceDescriptionURL: config.path ||"/DeviceDesc.xml"
        }
    };
    //defaults[auxString] = config.satipX_SATIPCAP ||"DVBT-1,DVBS-2";
    //delete defaults['a'];



    var Xml1 = {
        specVersion: {
            major: 1,
            minor: 0
        }
    };

    builder.ele(Xml1);
    builder.ele(defaults).ele('satip:X_SATIPCAP', {'xmlns:satip': 'urn:ses-com:satip'}, config.satipX_SATIPCAP ||'DVBT-1,DVBS-2')
        .up().ele('satip:X_SATIPM3U', {'xmlns:satip': 'urn:ses-com:satip'}, '/playlist/satip/channels');
    fs.writeFile(
        "./http-docs/SAT2IP/DeviceDesc.xml",
        builder,
        function (error) {
            if (error) {
                console.log(error);
            } else {
                console.log("The file was saved!");
            }
        }
    );
}

exports.initialize = function(options) {
    return new initializer(options);
}


//console.log(options);


