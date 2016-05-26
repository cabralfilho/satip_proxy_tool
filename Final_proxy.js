/**
 * Created by jordi on 12/04/15.
 */
var net = require('net');
var VerEx = require('verbal-expressions');
var config = require('./config_rtsp.json');
var udpf = require('./udp_forward');
var logger = require('./logger.js');
var messages = require('./messages_lib.js');
var mapping = require('./mapping.js');
var regularUtils = require('./regularExpforProxy.js').regularExp;
var GeneralFunctions = require('./general_functions.js');


var proxyPort = config.localproxy.serverPort; // Port on es connecta el client SAT>IP
var serviceHost = config.Server.externServer; // Adreça servidor SAT>IP extern
var servicePort = config.Server.externPort; // Port Servidor Sat>IP extern
var proxy = GeneralFunctions.myIP(); //Adreça proxy sat>ip

var minPort = config.localproxy.minPort;
var maxPort = config.localproxy.maxPort;

console.log("\nInit SAT>IP RTSP-Server Proxy\n\n\n");
logger.debug({timestamp: Date.now()}, "Init SAT>IP RTSP-Server Proxy");

var portsUsed = {};
var availablePorts = [];
for (var i = parseInt(minPort); i < parseInt(maxPort); i = i + 2) {
    availablePorts.push(i);
}

var ProxySatIP = function (initOptions) {
    net.createServer(function (proxySocket) {
            var proxyClientID = undefined;
            var serviceSocket = new net.Socket();
            serviceSocket.connect(parseInt(servicePort), serviceHost, function () {
                logger.debug({timestamp: Date.now()}, ' New connection to proxy: ' + proxySocket.remoteAddress);
                GeneralFunctions.uuidGenerator(function (proxySessID) {
                    proxyClientID = proxySessID;
                    if (initOptions.verbose) {
                        console.log("Proxy_id: " + proxyClientID+"\n");
                    }
                    logger.debug({timestamp: Date.now()}, "Proxy_id: " + proxyClientID);
                });
            });

            var session = undefined;

            proxySocket.on("data", function (data) {
                if (regularUtils.isRTSP(data) !== null) {
                    var ActualMessageSession = regularUtils.SessionCheck(data);
                    var freqacanviar = undefined;

                    if (ActualMessageSession !== null && session === undefined) {
                        session = ActualMessageSession;
                        if (initOptions.verbose) {
                            console.log(session +"\n");
                        }
                        logger.debug({timestamp: Date.now()}, session);
                    }

                    if ((regularUtils.isSetup(data) !== null)) {
                        if (regularUtils.Ports(data) !== null) {

                            mapping.toFreq(((regularUtils.Freq(data)).toString().slice(5)), function (freqCanviada) {

                                if (freqCanviada !== undefined) {
                                    freqacanviar = freqCanviada;

                                    //Si és el primer SETUP, assignem sessió
                                    if (ActualMessageSession !== null && session === undefined) {
                                        session = ActualMessageSession;
                                    } else if (ActualMessageSession !== null && session !== ActualMessageSession) { //Si la sessió ha canviat
                                        //TO BE implemented if necessary
                                    }
                                    regularUtils.individualPorts(data, function (port) {
                                        if (portsUsed[proxyClientID] !== undefined) {
                                            //availablePorts.push(portsUsed[proxyClientID]);
                                            //delete portsUsed[proxyClientID];
                                        }
                                        portsUsed[proxyClientID] = availablePorts.pop();
                                        //console.log(portsUsed[proxyClientID]);

                                        if (freqacanviar.type == "DVB-T") { //SETUP pel cas DVB-T

                                            var auxClientPorts = "client_port=" + portsUsed[proxyClientID] + "-" + (portsUsed[proxyClientID] + 1);

                                            var options = {
                                                serverAddress: serviceHost,
                                                freq: freqacanviar.freq,
                                                pids: regularUtils.pids(data).toString(),
                                                session: session,
                                                nSeq: regularUtils.SeqNum(data).toString().slice(6),
                                                clientports: auxClientPorts.toString(),
                                                msys: 'dvbt'
                                            };

                                            //logger.debug({timestamp: Date.now()}, 'ServiceSocket connect to server: ' + freqacanviar.freq[5]);
                                            messages.setupMessageDVBT(options, function (setupMessDVBT) {//FALTA reservar ports server per udp, Iniciar udp amb client
                                                logger.debug({timestamp: Date.now()}, "SETUP MESS:" + setupMessDVBT);
                                                if (initOptions.verbose) {
                                                    console.log("SETUP MESS:\n" + setupMessDVBT);
                                                }
                                                serviceSocket.write(setupMessDVBT);
                                            });
                                        }
                                        else if (freqacanviar.type == "DVB-S" || freqacanviar.type == "DVB-S2") {//SETUP pel cas DVB-S
                                            var auxClientPorts = "client_port=" + portsUsed[proxyClientID] + "-" + (portsUsed[proxyClientID] + 1);
                                            var msysT;
                                            if(freqacanviar.type == "DVB-S"){
                                                msysT = 'dvbs'}else{
                                                msysT = 'dvbs2'
                                            }
                                            var options = {
                                                serverAddress: serviceHost,
                                                freq: freqacanviar.freq,
                                                pids: regularUtils.pids(data).toString(),
                                                session: session,
                                                nSeq: regularUtils.SeqNum(data).toString().slice(6),
                                                clientports: auxClientPorts.toString(),
                                                msys: regularUtils.msys(data),
                                                fec: freqacanviar.fec,
                                                pol: freqacanviar.pol,
                                                sr: freqacanviar.sr,
                                                msys: msysT
                                            };

                                            logger.debug({timestamp: Date.now()}, 'ServiceSocket connect to server: ' + freqacanviar.freq[5]);
                                            messages.setupMessageDVBS(options, function (setupMessDVBS) {//FALTA reservar ports server per udp, Iniciar udp amb client
                                                logger.debug({timestamp: Date.now()}, "SETUP MESS:" + setupMessDVBS);
                                                if (initOptions.verbose) {
                                                    console.log("SETUP MESS:\n" + setupMessDVBS);
                                                }
                                                serviceSocket.write(setupMessDVBS);
                                            });

                                        } else {
                                        }//Cas per no DVB-S i no DVB-T TO BE implemented

                                        if (session === undefined) { // Si ja tenim sessió ja tenim proxy udp de ports
                                            if(proxySocket.remoteAddress.length > 12) {logger.debug({timestamp: Date.now()}, 'Iniciant UDP-Proxy per client' + proxySocket.remoteAddress.toString().slice(7) + 'ports: ' + port[0] + '-' + port[1]);}
                                            if (initOptions.verbose) {
                                                if(proxySocket.remoteAddress.length > 12) {
                                                    console.log("Iniciant UDP-Proxy per client:\n" + proxySocket.remoteAddress.toString().slice(7) + 'ports: ' + port[0] + '-' + port[1]);
                                                }else{
                                                    console.log("Iniciant UDP-Proxy per client:\n" + proxySocket.remoteAddress + 'ports: ' + port[0] + '-' + port[1]);
                                                }
                                                console.log("\n Remaining unused proxy Ports = "+availablePorts.length)
                                            }
                                            if(proxySocket.remoteAddress.length > 12){
                                            udpf.createUdpforward(proxySocket.remoteAddress.toString().slice(7), port[0], portsUsed[proxyClientID]);//Modificar ports a els reservats pel servidor
                                            udpf.createUdpforward(proxySocket.remoteAddress.toString().slice(7), port[1], (portsUsed[proxyClientID] + 1));}
                                            else{
                                                udpf.createUdpforward(proxySocket.remoteAddress, port[0], portsUsed[proxyClientID]);//Modificar ports a els reservats pel servidor
                                                udpf.createUdpforward(proxySocket.remoteAddress, port[1], (portsUsed[proxyClientID] + 1));
                                            }
                                        }
                                    });
                                }
                                // Si la freq no està a la llista de traduccions, i és el primer SETUP, el proxy retorna automàticament Not found
                                else {
                                    var options = {
                                        nSeq: regularUtils.SeqNum(data).toString().slice(6)
                                    }
                                    messages.freqNotFound(options, function (notFoundMessage) {
                                        proxySocket.write(notFoundMessage);
                                        logger.debug({timestamp: Date.now()}, "NOT FOUND:" + notFoundMessage);
                                        if (initOptions.verbose) {
                                            console.log("NOT FOUND:\n" + notFoundMessage);
                                        }
                                    });
                                }

                            });
                        } else {
                            mapping.toFreq(((regularUtils.Freq(data)).toString().slice(5)), function (freqCanviada) {

                                if (freqCanviada !== undefined) {
                                    freqacanviar = freqCanviada;

                                    if (freqacanviar.type == "DVB-T") { //SETUP pel cas DVB-T

                                        var options = {
                                            serverAddress: serviceHost,
                                            freq: freqacanviar.freq,
                                            pids: regularUtils.pids(data).toString(),
                                            session: session,
                                            nSeq: regularUtils.SeqNum(data).toString().slice(6)
                                        };

                                        messages.setupMessageDVBT(options, function (setupMessDVBT) {
                                            logger.debug({timestamp: Date.now()}, "SETUP Message without freq:" + setupMessDVBT);
                                            if (initOptions.verbose) {
                                                console.log("SETUP Message without freq:\n" + setupMessDVBT);
                                            }
                                            serviceSocket.write(setupMessDVBT);
                                        });
                                    }
                                    else if (freqacanviar.type == "DVB-S") {//SETUP pel cas DVB-S

                                        var options = {
                                            serverAddress: serviceHost,
                                            freq: freqacanviar.freq,
                                            pids: regularUtils.pids(data).toString(),
                                            session: session,
                                            nSeq: regularUtils.SeqNum(data).toString().slice(6),
                                            fec: freqacanviar.fec,
                                            pol: freqacanviar.pol,
                                            sr: freqacanviar.sr
                                        };
                                        messages.setupMessageDVBS(options, function (setupMessDVBS) {
                                            logger.debug({timestamp: Date.now()}, "SETUP Message without freq:" + setupMessDVBS);
                                            if (initOptions.verbose) {
                                                console.log("SETUP Message without freq:\n" + setupMessDVBS);
                                            }
                                            serviceSocket.write(setupMessDVBS);
                                        });
                                    } else {
                                    }//Cas per no DVB-S i no DVB-T TO BE implemented
                                }

                            });
                        }
                    }
                    else if (regularUtils.isPlay(data) !== null) {

                        if (regularUtils.Freq(data) !== null) { // Ens passen una freq al PLAY
                            if (regularUtils.isDvbt(data) === null) {// cas de dvbs Es comproba diferent ja que la comanda es realitza en la mateixa sessió!
                                mapping.toFreq(((regularUtils.Freq(data)).toString().slice(5)), function (freqCanviada) {

                                    if (freqCanviada !== undefined) {
                                        freqacanviar = freqCanviada;
                                    } else {
                                        freqacanviar = {
                                            freq: 0000
                                        }
                                    }

                                    var options = {
                                        serverAddress: serviceHost,
                                        freq: freqacanviar.freq,
                                        stream: regularUtils.Stream(data),
                                        source: regularUtils.Src(data),
                                        nSeq: regularUtils.SeqNum(data),
                                        session: ActualMessageSession
                                    };
                                    messages.playMessageDVBT(options, function (playMessDVBT) {
                                        logger.debug({timestamp: Date.now()}, "Play Message DVB-T:" + playMessDVBT);
                                        if (initOptions.verbose) {
                                            console.log("Play Message DVB-T:\n" + playMessDVBT);
                                        }
                                        serviceSocket.write(playMessDVBT);
                                    });
                                });
                            }
                            else { // Cas dvbt
                                mapping.toFreq(((regularUtils.Freq(data)).toString().slice(5)), function (freqCanviada) {
                                    if (freqCanviada !== undefined) {
                                        freqacanviar = freqCanviada;
                                    } else {
                                        freqacanviar = {
                                            freq: 0000,
                                            fec: '89',
                                            pol: 'h',
                                            sr: '22000'
                                        }
                                    }
                                    var options = {
                                        serverAddress: serviceHost,
                                        freq: freqacanviar.freq,
                                        pids: regularUtils.pids(data).toString(),
                                        session: ActualMessageSession,
                                        stream: regularUtils.Stream(data),
                                        source: regularUtils.Src(data),
                                        nSeq: regularUtils.SeqNum(data).toString().slice(6),
                                        fec: freqacanviar.fec,
                                        pol: freqacanviar.pol,
                                        sr: freqacanviar.sr
                                    };

                                    messages.playMessageDVBS(options, function (playMessDVBS) {//FALTA reservar ports server per udp, Iniciar udp amb client
                                        logger.debug({timestamp: Date.now()}, "PLAY Message DVB-S:" + playMessDVBS);
                                        if (initOptions.verbose) {
                                            console.log("PLAY Message DVB-S:\n" + playMessDVBS);
                                        }
                                        serviceSocket.write(playMessDVBS);
                                    });
                                });
                            }
                        }
                        else {
                            //canmbiem la IP i PORT del missatge PLAY simple (Addpids/Delpids)
                            var changeipPlay = VerEx().find(proxy).replace(data, serviceHost);
                            changeipPlay = VerEx().find(proxyPort).replace(changeipPlay, servicePort);
                            logger.debug({timestamp: Date.now()}, "PLAY Message (Only Change IP):" + changeipPlay);
                            if (initOptions.verbose) {
                                console.log("PLAY Message (Only Change IP):\n" + changeipPlay);
                            }

                            serviceSocket.write(changeipPlay);
                        }
                    }
                    //canmbiem la IP i PORT del missatge TEARDOWN
                    else if (regularUtils.isTeardown(data) !== null) {
                        var changeipTeardown = VerEx().find(proxy).replace(data, serviceHost);
                        changeipTeardown = VerEx().find(proxyPort).replace(changeipTeardown, servicePort);
                        serviceSocket.write(changeipTeardown);
                        logger.debug({timestamp: Date.now()}, "TEARDOWN Message (Only Change IP):" + changeipTeardown);
                        if (initOptions.verbose) {
                            console.log("TEARDOWN Message (Only Change IP):\n" + changeipTeardown);
                        }

                        //availablePorts.push(portsUsed[proxyClientID]);
                        //delete portsUsed[proxyClientID];
                    }
                    //Tornem a escriure el missatge PLAY degut a errors amb alguns Servidors (TVH)
                    else if (regularUtils.isOptions(data) !== null) {
                        var options = {
                            serverAddress: serviceHost,
                            nSeq: regularUtils.SeqNum(data),
                            session: ActualMessageSession
                        }
                        messages.optionsMessage(options, function (message) {
                            serviceSocket.write(message);
                            logger.debug({timestamp: Date.now()}, "OPTIONS Message:" + message);
                            if (initOptions.verbose) {
                                console.log("OPTIONS Message:\n" + message);
                            }

                        });
                    }
                }
                else if (regularUtils.isHTTP(data) !== null) {
                    logger.debug({timestamp: Date.now()}, "HTTP requests not implemented!!!" + data);
                    if (initOptions.verbose) {
                        console.log("\nHTTP requests not implemented!!!\n" + data);
                    }

                }
                else {
                    proxySocket.end();
                    serviceSocket.end();
                }

            });

            serviceSocket.on("data", function (data) {
                //canmbiem la IP i PORT dels missatges de resposta del Servidor
                if(proxySocket.getRemoteAddress !== null || proxySocket.getRemoteAddress !== undefined) {
                    var changeipOptions = VerEx().find(proxy).replace(data, proxySocket.remoteAddress.toString());
                    changeipOptions = VerEx().find(serviceHost).replace(changeipOptions, proxy);
                    logger.debug({timestamp: Date.now()}, "Response Message from server (Only change IP):" + changeipOptions.toString());
                    if (initOptions.verbose) {
                        console.log("Response Message from server (Only change IP):\n" + changeipOptions.toString());
                    }

                    proxySocket.write(changeipOptions);
                }
            });


            proxySocket.on("error", function (e) {
                serviceSocket.end();
                logger.debug({timestamp: Date.now()}, "Error Client Connection" + e);
                if (initOptions.verbose) {
                    console.log("\nError Client Connection\n" + e);
                }

                //availablePorts.push(portsUsed[proxyClientID]);
                //delete portsUsed[proxyClientID];
            });
            serviceSocket.on("error", function (e) {
                console.log("Could not connect to service at host "
                + serviceHost + ', port ' + servicePort);
                proxySocket.end();
                logger.debug({timestamp: Date.now()}, "Error Server Connection" + e);
                if (initOptions.verbose) {
                    console.log("\nError Server Connection\n" + e);
                }


            });

            proxySocket.on("close", function (had_error) {
                serviceSocket.end();
                if (portsUsed[proxyClientID] !== undefined) {
                    //availablePorts.push(portsUsed[proxyClientID]);
                    //delete portsUsed[proxyClientID];
                }
                logger.debug({timestamp: Date.now()}, "Client Connection closed " + had_error);
                if (initOptions.verbose) {
                    console.log("\nClient Connection closed" +" Error?= " +had_error);
                }

            });
            serviceSocket.on("close", function (had_error) {
                proxySocket.end();
            });

        }
    ).listen(proxyPort)
//}
}
exports.CreateProxySatIP = function (options) {
    return new ProxySatIP(options);
};
