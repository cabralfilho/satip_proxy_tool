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
    cb(uuid.v4());
};


// ############### NAT Port Forward ##################
/*
exports.natPortForward = function() {
    var natpmp = require('nat-pmp');
    var network = require('network');
    var config = require('./config.json');

    //network.get_public_ip(function(err,ip){
        var client = natpmp.connect('192.168.1.1');

        client.externalIp(function (err,info){
            if(err) throw err;
            console.log('Current ecternal IP address: %s', info.ip.join('.'));
      //  });

        for(var i = config.localproxy.minPort ; i< config.localproxy.maxPort ; i++ ){

            client.portMapping({type: udp, private: i, public: i, ttl: 3600}, function(err,info){
                if(err) throw err;
                console.log(info);
            });

        }

    });
}*/