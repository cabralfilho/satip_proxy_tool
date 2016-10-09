/**
 * Created by jordi on 09/04/15.
 */


exports.optionsMessage = function(options,cb){

    var msgOut = new String();
    msgOut += "OPTIONS rtsp://"+options.serverAddress+":554/ RTSP/1.0\r\n";
    if(options.nSeq !== null){
        msgOut += options.nSeq+"\r\n";
    }
    if(options.session !== undefined && options.session !== null){
        msgOut += options.session+"\r\n";
    }
    msgOut += "\r\n";
    cb(msgOut);
}
exports.setupMessageDVBT = function(options,cb){

    var msgOut = new String();
    msgOut += "SETUP rtsp://"+options.serverAddress+":554/?freq="+options.freq;
    if(options.source !== undefined){
        msgOut += options.source;}
    msgOut += "&msys="+options.msys+"&bw=8&";
    if(options.pids !== null && options.pids !== undefined) {
        msgOut += options.pids;
    }else{
        msgOut += "pids=0";
    }
    msgOut += " RTSP/1.0\r\n";
    msgOut += "CSeq: "+options.nSeq+"\r\n";
    if(options.session !== undefined){
        msgOut += options.session+"\r\n";
    }
    msgOut += "Transport: RTP/AVP;unicast;"
    if(options.clientports !== undefined){msgOut+=options.clientports;}
    msgOut += "\r\n";
    msgOut += "\r\n";
    cb(msgOut);
}
exports.playMessageDVBT = function(options,cb){

    var msgOut = new String();
    msgOut += "PLAY rtsp://"+options.serverAddress+":554/"+options.stream+"?freq="+options.freq;
    if(options.source !== undefined){
    msgOut += "&"+options.source;}
    msgOut += "&msys=dvbt&bw=6";
    if(options.pids !== null && options.pids !== undefined){
        msgOut += "&"+options.pids;
    }else{
        msgOut += "&pids=0";
    }
    msgOut += " RTSP/1.0\r\n";

    msgOut += "CSeq: "+options.nSeq+"\r\n";
    msgOut += options.session+"\r\n";
    msgOut += "\r\n";
    cb(msgOut);
}

exports.freqNotFound = function(options,cb){

    var msgOut = new String();
    msgOut += "RTSP/1.0 404 Stream Not Found\r\n";
    msgOut += "Cseq: "+options.nSeq+"\r\n";
    if(options.session !== undefined) {
        msgOut += "Session: " + options.session+"\r\n";
    }
    msgOut += "Server: Satip proxy\r\n";
    msgOut += "\r\n";
    cb(msgOut);
}
exports.setupMessageDVBS = function(options,cb){

    var msgOut = new String();
    msgOut += "SETUP rtsp://"+options.serverAddress+":554/?src=1&freq="+options.freq;
    if(options.source !== undefined){
        msgOut += options.source;}
    msgOut += "&msys="+options.msys;
    msgOut += "&plts=off&fec="+options.fec+"&pol="+options.pol+"&ro=0.35&sr="+options.sr+"&mtype=&";
    if(options.pids !== null && options.pids !== undefined) {
        msgOut += options.pids;
    }else{
        msgOut += "pids=0";
    }
    msgOut += " RTSP/1.0\r\n";
    msgOut += "CSeq: "+options.nSeq+"\r\n";
    if(options.session !== undefined){
        msgOut += options.session+"\r\n";
    }
    msgOut += "Transport: RTP/AVP;unicast;";
    if(options.clientports !== undefined){msgOut+=options.clientports;}
    msgOut += "\r\n";
    msgOut += "\r\n";
    cb(msgOut);
}
exports.playMessageDVBS = function(options,cb){

    var msgOut = new String();
    msgOut += "PLAY rtsp://"+options.serverAddress+":554/";
    if (options.stream !== undefined){msgOut += options.stream;}
    msgOut +="?src=1&freq="+options.freq+"&msys=dvbs&plts=off&fec="+options.fec+"&pol="+options.pol+"&ro=0.35&sr="+options.sr+"&mtype=&";
    if (options.pids !== null && options.pids !== undefined){
        msgOut += options.pids;
    }else {
        msgOut += "pids=0";
    }
    msgOut += " RTSP/1.0\r\n";
    msgOut += "CSeq: "+options.nSeq+"\r\n";
    msgOut += options.session+"\r\n";
    msgOut += "\r\n";
    cb(msgOut);
}

exports.playMessageDVBC = function(options,cb) {
    var msgOut = new String();
    msgOut += "PLAY rtsp://" + options.serverAddress + ":554/";
    if (options.bw !== undefined) 
        msgOut += "&bw=" + options.bw;
    if (options.msys !== undefined)
        msgOut += "&msys=" + options.msys;
    if (options.tunningFrequType !== undefined) 
        msgOut += "&c2tft=" + options.tunningFrequType;
    if (options.mtype !== undefined)
        msgOut += "&mtype" + options.mtype;
    if (options.sr !== undefined)
        msgOut += "&sr=" + options.sr;
    if (options.ds !== undefined)
        msgOut += "&ds=" + options.ds;
    if (options.plp !== undefined)
        msgOut += "&plp=" +options.plp;
    if (options.specinv !== undefined)
        msgOut += "&specinv" + options.specinv;
    if (options.pids !== null && options.pids !== undefined){
        msgOut += options.pids;
    }else {
        msgOut += "pids=0";
    }
    msgOut += " RTSP/1.0\r\n";
    msgOut += "CSeq: "+options.nSeq+"\r\n";
    msgOut += options.session+"\r\n";
    msgOut += "\r\n";
    cb(msgOut);
}

exports.setupMessageDVBC = function (options,cb) {
    var msgOut = new String();
    msgOut +="SETUP rtsp://" + options.serverAddress + ":554/?freq=" + options.freq;
    if (options.bw !== undefined) 
        msgOut += "&bw=" + options.bw;
    if (options.tunningFrequType !== undefined) 
        msgOut += "&c2tft=" + options.tunningFrequType;
    if (options.msys !== undefined)
        msgOut += "&msys=" + options.msys;
    if (options.mtype !== undefined)
        msgOut += "&mtype" + options.mtype;
    if (options.sr !== undefined)
        msgOut += "&sr=" + options.sr;
    if (options.ds !== undefined)
        msgOut += "&ds=" + options.ds;
    if (options.plp !== undefined)
        msgOut += "&plp=" +options.plp;
    if (options.specinv !== undefined)
        msgOut += "&specinv" + options.specinv;
    if (options.pids !== null && options.pids !== undefined){
        msgOut += options.pids;
    }else {
        msgOut += "pids=0";
    }
    msgOut += " RTSP/1.0\r\n";
    msgOut += "CSeq: "+options.nSeq+"\r\n";
    if(options.session !== undefined){
        msgOut += options.session+"\r\n";
    }
    msgOut += "Transport: RTP/AVP;unicast;";
    if(options.clientports !== undefined){msgOut+=options.clientports;}
    msgOut += "\r\n";
    msgOut += "\r\n";
    cb(msgOut);
}