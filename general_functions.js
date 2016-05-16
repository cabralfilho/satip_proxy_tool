/**
 * Created by jfont on 15/09/15.
 */
var uuid = require('uuid');

// ############### Obtain IP ###############

exports.myIP = function() {
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

// ############### Obtain a time based UUID ###############

exports.uuidGenerator = function uuidG(cb){
    cb(uuid.v1());
};