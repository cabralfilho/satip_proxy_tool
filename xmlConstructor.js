var generalFunctions = require('./general_functions.js');
var fs = require('fs');
var configuration = require('./config_rtsp.json');
var builder = require('xmlbuilder').create('root');
var logger = require('winston');
var myIP = require('./general_functions.js');

var initializer = function(config) {

    var proxyPort = configuration.localproxy.serverPort; // Port on es connecta el client SAT>IP

    var defaults = {
        device: {
            deviceType: "urn:ses-com:device:SatIPServer:1" ,
            friendlyName: config.friendlyName ||"Sat>IP Proxy ",
            manufacturer: config.manufacturer ||"JFv",
            manufacturerURL: config.manufacturerURL ||"http://www.github.com/jfont555/satip_proxy_tool",
            modelDescription: config.modelDescription ||"Sat>IP proxy",
            modelURL: config.modelURL ||"http://www.github.com/jfont555/satip_proxy_tool",
            modelName: config.modelName ||"SAT>IP PROXY TEST",
            modelNumber: config.modelNumber ||"Release 18-05-16",
            serialNumber: config.serialNumber ||"PCSATIP-1JFVSAT",
            UDN: "uuid:"+config.uuid// Generate and return a RFC4122 v1 (timestamp-based)
        }
    };


    var Xml1 = {
        specVersion: {
            major: 1,
            minor: 1
        }
    };

    builder.ele(Xml1);
    builder.ele(defaults).ele('satip:X_SATIPCAP', {'xmlns:satip': 'urn:ses-com:satip'}, config.satipX_SATIPCAP ||'DVBS2-1,DVBT-1');

    if (!fs.existsSync('DeviceDescription')) {
// Crear si no E
        fs.mkdirSync('DeviceDescription');
    }

    fs.writeFile(
        "DeviceDescription/DeviceDesc.xml",
        builder,{mode: '666'},
        function (error) {
            if (error) {
                logger.error(error);
            } else {
                logger.debug("XML Created");
            }
        }
    );

    var location = '/DeviceDescription/DeviceDesc.xml';

    if(config.path !== undefined){
        location = options.path;
    }

    logger.info("SAT>IP values of XML at: "+myIP.myIP()+":"+configuration.localproxy.serverHttpPort+location+"\n\n     deviceType: 'SatIPServer:1'\n     firendlyName: "
    +defaults.device.friendlyName+"\n     manufacturer: "+defaults.device.manufacturer+"\n     manufacturerURL: "+defaults.device.manufacturerURL+"\n     modelDescription: "+defaults.device.modelDescription+
    "\n     modelURL: "+defaults.device.modelURL+"\n     modelName: "+defaults.device.modelName+"\n     modelNumber: "+defaults.device.modelNumber+"\n     serialNumber: "+defaults.device.serialNumber+
    "\n     UDN: "+defaults.device.UDN+"\n     satip:X_SATIPCAP: DVBS2-1,DVBT-1 (Default Parameter maybe not real)\n")
}
exports.initialize = function(options) {
    return new initializer(options);
}

