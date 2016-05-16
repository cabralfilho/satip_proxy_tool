/**
 * Created by jordi on 28/03/15.
 */
var maps = require('./maps.json');


process.on("uncaughtException",function(e){
    console.log(e);

});
exports.toFreq = function (frequ, cb) {
    var tofreq = [];
    var searchfield = "from";

    for(var i= 0; i< maps.frequencies.length ; i++){
        if(maps.frequencies[i][searchfield] == frequ){
            tofreq = maps.frequencies[i];
            return cb(tofreq)
        }
    }cb(undefined)
};