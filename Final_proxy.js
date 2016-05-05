/**
 * Created by jordi on 12/04/15.
 */
var util = require('util');
var net = require('net');
var VerEx = require('verbal-expressions');
var config = require('./config_rtsp.json'); //només es llegeix una vegada, la resta es tira de caché. (eliminar require si es vol canviar)
var udpf = require('./udp_forward');
var logger = require('./logger.js');
var messages = require('./messages_lib.js');
var list = require('linkedlist');
var mapping = require('./mapping.js');
var regularUtils = require('./regularExpforProxy.js').regularExp;
var Client = require('./client.js');

//process.on("uncaughtException", function (e) {
//  console.log(e);
//});

//var serverHost = config.localproxy.serverHost;
var proxyPort = config.localproxy.serverPort; // Port on es connecta el client SAT>IP
var serviceHost = config.Server.externServer; // Adreça servidor SAT>IP extern
var servicePort = config.Server.externPort; // Port Servidor Sat>IP extern
var proxy = config.localproxy.localIP; //Adreça proxy sat>ip


console.log("\nInit SAT>IP RTSP-Server Proxy\n\n\n");
logger.debug({timestamp: Date.now()}, "Init SAT>IP RTSP-Server Proxy");
var clientsList = new list();


var ProxySatIP = function () {
    net.createServer(function (proxySocket) {
            var serviceSocket = new net.Socket();
            serviceSocket.connect(parseInt(servicePort), serviceHost, function () {
                logger.debug({timestamp: Date.now()}, ' New connection to proxy: ' + proxySocket.getRemoteAddress());
            });


            proxySocket.on("data", function (data) {
                console.log(data.toString());
                if (regularUtils.isRTSP(data) !== null) {


                    if ((regularUtils.isOptions(data) !== null)) {

                        serviceSocket.write(data);
                    }
                    else if ((regularUtils.isSetup(data) !== null)) {
                        //if (regularUtils.SessionCheck(data) !== null) {
                        //ionMatch(regularUtils.SessionCheck(data), function (exists) {
                        //  if (exists) {
                        //console.log("SETUP\n ");

                        //logger.debug({timestamp: Date.now()}, 'SETUP message with an existing session');
                        //}
                        //else {
                        //}
                        //}//);

                        //else {
                        if (regularUtils.Ports(data) !== null) {

                            //console.log("FREQ " + regularUtils.Freq(data) + ",  " + regularUtils.Ports(data));
                            //mapping.mapFrequency(null, (regularUtils.Freq(data)).toString().slice(5), function (freqacanviar) {
                            mapping.toFreq((regularUtils.Freq(data)).toString().slice(5), function (freqacanviar) {

                                if (freqacanviar.type == "DVB-T") { //SETUP pel cas DVB-T

                                    console.log("toFREQ: " + freqacanviar.freq);

                                    regularUtils.individualPorts(data, function (port) {
                                        //var carros = "";
                                        var session = null;
                                        /*if (regularUtils.afterTnr(data) !== null) {
                                         carros = regularUtils.afterTnr(data).toString().slice(12);
                                         }*/
                                        if (regularUtils.SessionCheck(data) !== null) {
                                            session = regularUtils.SessionCheck(data);
                                        }
                                        if (freqacanviar.freq == null) {
                                            freqacanviar.freq = 012;
                                        }

                                        var options = {
                                            serverAddress: serviceHost,
                                            freq: freqacanviar.freq,
                                            pids: regularUtils.pids(data).toString(),
                                            session: session,
                                            nSeq: regularUtils.SeqNum(data).toString().slice(6),
                                            clientports: regularUtils.Ports(data).toString()
                                        };


                                        logger.debug({timestamp: Date.now()}, 'ServiceSocket connect to server: ' + freqacanviar.freq[5]);
                                        messages.setupMessageDVBT(options, function (setupMess) {//FALTA reservar ports server per udp, Iniciar udp amb client
                                            console.log("SETUP MESS" + setupMess);
                                            serviceSocket.write(setupMess);
                                            logger.debug({timestamp: Date.now()}, 'Iniciant UDP-Proxy per client' + proxySocket.remoteAddress + 'ports: ' + port[0] + '-' + port[1]);
                                            console.log("SESSION: " + session);
                                            if (session === null) { // Si ja tenim sessió ja tenim proxy udp de ports
                                                console.log("\nPORT OPEN proxy \n")
                                                var udp1 = udpf.createUdpforward(proxySocket.remoteAddress, port[0], port[0]);//Modificar ports a els reservats pel servidor
                                                var udp2 = udpf.createUdpforward(proxySocket.remoteAddress, port[1], port[1]);
                                            }
                                        });

                                    });
                                    //}
                                    // }
                                    //else {
                                    //messages.freqNotFound(function (ErrorfreqNotFoundMess) {
                                    //      proxySocket.write(ErrorfreqNotFoundMess); //Evita error:: (node) warning: possible EventEmitter memory leak detected.
                                    //  });
                                    //}

                                    //var client = new Client(proxySocket.remoteAddress, port[0], port[1], 0, serviceSocket);
                                    //clientsList.push(client);
                                    //si no existeix la sessió CREAR DADES CLIENT
                                }
                                else {

                                }
                            });
                            //  }
                        }

                    }
                    else if (regularUtils.isPlay(data) !== null) {

                        if (regularUtils.Freq(data) !== null) {
                            console.log("PLAY\n ");
                            if (regularUtils.isDvbt(data) === null) {// cas de dvbs
                                mapping.mapFrequency(null, (regularUtils.Freq(data)).toString().slice(5), function (freqacanviar) {

                                    var options = {
                                        serverAddress: serviceHost,
                                        freq: regularUtils.Freq(data),//.toString().slice(5),
                                        stream: regularUtils.Stream(data),//.toString().slice(7),
                                        source: regularUtpandorails.Src(data),//.toString().slice(4),
                                        nSeq: regularUtils.SeqNum(data),//.toString().slice(6),
                                        session: regularUtils.SessionCheck(data)//s.toString().slice(9)
                                    };
                                    messages.playMessageDVBT(options, function (playMess) {//FALTA reservar ports server per udp, Iniciar udp amb client
                                        console.log(options);
                                        console.log("\n" + playMess);
                                        serviceSocket.write(playMess);
                                    });
                                });
                            }
                            else { // Cas dvbt
                                var changeipPlay = VerEx().find(proxy).replace(data, serviceHost);
                                serviceSocket.write(changeipPlay);
                            }
                        }
                        else {
                            var changeipPlay = VerEx().find(proxy).replace(data, serviceHost);
                            changeipPlay = VerEx().find(proxyPort).replace(changeipPlay, servicePort);
                            console.log("\nMESSAGE PLAY\n" + changeipPlay);
                            serviceSocket.write(changeipPlay);
                        }
                    }
                    else if (regularUtils.isTeardown(data) !== null) {
                        var changeipTeardown = VerEx().find(proxy).replace(data, serviceHost);
                        changeipTeardown = VerEx().find(proxyPort).replace(changeipTeardown, servicePort);
                        serviceSocket.write(changeipTeardown);
                    }
                    else if (regularUtils.isOptions(data) !== null && regularUtils.isCseq(data) === null) {
                        var changeipOptions = VerEx().find(proxy).replace(data, options.myIP);
                        serviceSocket.write(changeipOptions);
                    }
                }
                else if (regularUtils.isHTTP(data) !== null) {
                    console.log("HTTP requests not implemented!!!")
                }
                else {
                    proxySocket.end();
                    serviceSocket.end();
                }

            });


            serviceSocket.on("data", function (data) {
                console.log("PROXYS " + data.toString());
                var changeipOptions = VerEx().find(options.myIP).replace(data, proxySocket.remoteAddress.toString());
                changeipOptions = VerEx().find(serviceHost).replace(changeipOptions, options.myIP);
                console.log("PROX MODIFIED " + changeipOptions.toString());

                proxySocket.write(changeipOptions);
            });


            proxySocket.on("error", function (e) {
                serviceSocket.end();
            });
            serviceSocket.on("error", function (e) {
                console.log("Could not connect to service at host "
                + serviceHost + ', port ' + servicePort);
                proxySocket.end();
            });

            proxySocket.on("close", function (had_error) {
                serviceSocket.end();
            });
            serviceSocket.on("close", function (had_error) {
                proxySocket.end();
            });

        }
    ).listen(proxyPort)
//}
}
exports.CreateProxySatIP = function () {
    return new ProxySatIP();
};

/*function sessionMatch(testSession, cb) {
 var exists = false;
 while (list.next()) {
 if (list.current.id == testSession) {
 exists = true;
 cb(exists);
 }
 }
 cb(exists);
 };

 function sessionDestroy(testSession, cb) {
 var exists = false;
 while (list.next()) {
 if (list.current.id == testSession) {
 exists = true;
 list.removeCurrent();
 cb(exists);
 }
 }
 cb(exists);
 };*/