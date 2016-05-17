/**
 * Created by jordi on 09/04/15.
 */


exports.optionsMessage = function(options,cb){

    var msgOut = new String();
    msgOut += "OPTIONS rtsp://"+options.serverAddress+":554/ RTSP/1.0\r\n";
    msgOut += options.nSeq+"\r\n";
    if(options.session !== undefined && options.session !== null){
        msgOut += options.session+"\r\n";
    }
    msgOut += "\r\n";
    cb(msgOut);
}
exports.optionsMessage2 = function(cseq,cb){

    var msgOut = new String();
    msgOut += "RTSP/1.0 200 OK\r\n";
    msgOut += cseq+"\r\n";
    msgOut += "Public: OPTIONS, DESCRIBE, SETUP, TEARDOWN, PLAY\r\n";
    msgOut += "\r\n";
    cb(msgOut);
}
exports.setupMessageDVBT = function(options,cb){

    var msgOut = new String();
    msgOut += "SETUP rtsp://"+options.serverAddress+":554/?freq="+options.freq+"&msys=dvbt&bw=8&"+options.pids;
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
    msgOut += "PLAY rtsp://"+options.serverAddress+":554/"+options.stream+"?"+options.freq;
    if(options.source !== undefined){
    msgOut += options.source;}
    msgOut += "&"+"&msys=dvbt&bw=6&"+options.pids;
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
    msgOut += "SETUP rtsp://"+options.serverAddress+":554/?src=1&freq="+options.freq+"&msys=dvbs&plts=off&fec="+options.fec+"&pol="+options.pol+"&ro=0.35&sr="+options.sr+"&mtype=&"+options.pids;
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
    if(options.stream !== undefined){msgOut +=options.stream;}
    msgOut +="?src=1&freq="+options.freq+"&msys=dvbs&plts=off&fec="+options.fec+"&pol="+options.pol+"&ro=0.35&sr="+options.sr+"&mtype=qpsk&"+options.pids;
    msgOut += " RTSP/1.0\r\n";
    msgOut += "CSeq: "+options.nSeq+"\r\n";
    msgOut += options.session+"\r\n";
    msgOut += "\r\n";
    cb(msgOut);
}