/**
 * Created by jfont on 15/09/15.
 */

var os = require('os');
var uuid = require('uuid');

// ############### Obtain IP ###############

exports.myIP = function (cb) {
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    cb(addresses.toString())
};

// ############### Obtain a time based UUID ###############

exports.uuidGenerator = function uuidG(cb){
    cb(uuid.v1());
};