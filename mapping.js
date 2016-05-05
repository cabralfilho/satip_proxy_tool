/**
 * Created by jordi on 28/03/15.
 */
var fs = require('fs');
var readline = require('readline');
var VerEx = require('verbal-expressions');
var maps = require('./maps.json');


process.on("uncaughtException",function(e){
    console.log(e);

});


//var sourcere = /source: (\/)*(\S*\/)*(\S*)*/;
//var targetre = /target: (\/)*(\S*\/)*(\S*)*/;


exports.toFreq = function (frequ, cb) {// function tested!!
    //console.log("toFreq method: "+JSON.stringify(tofreq));
    var tofreq = [];
    var searchfield = "from";
    for(var i= 0; i< maps.frequencies.length ; i++){
        if(maps.frequencies[i][searchfield] == frequ){
            tofreq = maps.frequencies[i];
            cb(tofreq)
        }
    }
};