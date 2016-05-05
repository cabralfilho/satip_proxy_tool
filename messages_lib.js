/**
 * Created by jordi on 09/04/15.
 */


exports.optionsMessage = function(cb){

    var msgOut = new String();
    msgOut += "RTSP/1.0 200 OK\r\n";
    msgOut += "CSeq: 1\r\n";
    //msgOut += "Date: Sat, Jun 07 2014 12:22:43 GMT\r\n";
    msgOut += "Public: OPTIONS, DESCRIBE, SETUP, TEARDOWN, PLAY\r\n";
    msgOut += "\r\n";
    cb(msgOut);
}

exports.optionsMessage2 = function(cseq,cb){

    var msgOut = new String();
    msgOut += "RTSP/1.0 200 OK\r\n";
    msgOut += cseq+"\r\n";
    //msgOut += "Date: Sat, Jun 07 2014 12:22:43 GMT\r\n";
    msgOut += "Public: OPTIONS, DESCRIBE, SETUP, TEARDOWN, PLAY\r\n";
    msgOut += "\r\n";
    cb(msgOut);
}
exports.setupMessageDVBT = function(options,cb){

    var msgOut = new String();
    msgOut += "SETUP rtsp://"+options.serverAddress+":554/?freq="+options.freq+"&msys=dvbt&bw=8&"+options.pids;
    msgOut += " RTSP/1.0\r\n";
    msgOut += "CSeq: "+options.nSeq+"\r\n";
    if(options.session !== null){
        msgOut += options.session+"\r\n";
    }
    //msgOut += "Date: Sat, Jun 07 2014 12:22:43 GMT\r\n";
    msgOut += "Transport: RTP/AVP;unicast;"+options.clientports+"\r\n";
    msgOut += "\r\n";
    cb(msgOut);
}
exports.playMessageDVBT = function(options,cb){

    var msgOut = new String();
    msgOut += "PLAY rtsp://"+options.serverAddress+":554/"+options.stream+"?"+options.source+"&"+options.freq+"&msys=dvbt"+"\r\n";
    msgOut += "CSeq: "+options.nSeq+"\r\n";
    //msgOut += "Date: Sat, Jun 07 2014 12:22:43 GMT\r\n";
    msgOut += "Session: " + options.session + "\r\n";
    cb(msgOut);
}

exports.freqNotFound = function(options,cb){
    var msgOut = new String();
    msgOut += "RTSP/1.0 404 Stream Not Found\r\n";
    msgOut += "Cseq: "+options.cseq+"\r\n";
    if(options.session !== null) {
        msgOut += "Session: " + options.session + ";timeout=20\r\n";
    }
    //msgOut += "Transport: RTP/AV;unicast;destination="+options.destination+";source="+options.source+";client_port="+options.clientport+";server_port="+options.serverport+"\r\n";
    msgOut += "Server: Satip proxy\r\n";
    cb(msgOut);
}
exports.setupMessageDVBS = function(options,cb){

    var msgOut = new String();
    msgOut += "SETUP rtsp://"+options.serverAddress+":554/?src=1&freq="+options.freq+"&pol="+options.pol+"&ro=0.35&msys=dvbs&mtype=qpsk&plts=off"+"sr="+options.sr+"fec="+options.fec+"&"+options.pids;
    msgOut += " RTSP/1.0\r\n";
    msgOut += "CSeq: "+options.nSeq+"\r\n";
    if(options.session !== null){
        msgOut += options.session+"\r\n";
    }
    //msgOut += "Date: Sat, Jun 07 2014 12:22:43 GMT\r\n";
    msgOut += "Transport: RTP/AVP;unicast;"+options.clientports+"\r\n";
    msgOut += "\r\n";
    cb(msgOut);
}
exports.playMessageDVBS = function(options,cb){

    var msgOut = new String();
    msgOut += "PLAY rtsp://"+options.serverAddress+":554/"+options.stream+"?"+options.source+"&"+options.freq+"&msys=dvbt"+"\r\n";
    msgOut += "CSeq: "+options.nSeq+"\r\n";
    //msgOut += "Date: Sat, Jun 07 2014 12:22:43 GMT\r\n";
    msgOut += "Session: " + options.session + "\r\n";
    cb(msgOut);
}