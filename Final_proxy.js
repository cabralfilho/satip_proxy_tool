/**
 * Created by jordi on 12/04/15.
 */
var net              = require('net');
var VerEx            = require('verbal-expressions');
var config           = require('./config.json');
var udpf             = require('./udp_forward');
var logger           = require('winston');
var messages         = require('./messages_lib.js');
var mapping          = require('./mapping.js');
var regularUtils     = require('./regularExpforProxy.js').regularExp;
var GeneralFunctions = require('./general_functions.js');


var proxyPort   = config.localproxy.serverRtspPort; // SAT>IP proxy port
var serviceHost = config.Server.externServer; // Exter SAT>IP server IP
var servicePort = config.Server.externPort; // Exter SAT>IP server port
var proxy       = GeneralFunctions.myIP(); //SAT>IP Proxy address

var minPort     = config.localproxy.minPort;
var maxPort     = config.localproxy.maxPort;

var portsUsed   = {};
var availablePorts = [];

for (var i = parseInt(minPort); i < parseInt(maxPort); i = i + 2) {
    availablePorts.push(i);
}

var ProxySatIP = function (initOptions) {
    net.createServer (function (proxySocket) {
        var proxyClientID = undefined;
        var serviceSocket = new net.Socket();
        serviceSocket.connect(parseInt(servicePort), serviceHost, function () {
            logger.info(' New connection to proxy: ' + proxySocket.remoteAddress);
            GeneralFunctions.uuidGenerator(function (proxySessID) {
                proxyClientID = proxySessID;
                logger.verbose("Proxy_id: " + proxyClientID + "\n");

            });
        });

        var session = undefined;

            proxySocket.on("data", function (data) {
                if (regularUtils.isRTSP(data) !== null) {

                    var ActualMessageSession = regularUtils.SessionCheck(data);
                    var freqacanviar = undefined;

                    if (ActualMessageSession !== null && session === undefined) {
                        session = ActualMessageSession;
                        logger.debug(session + "\n");
                    }

                    if ((regularUtils.isSetup(data) !== null)) {
                        if (regularUtils.Ports(data) !== null) {

                            mapping.toFreq(((regularUtils.Freq(data)).toString().slice(5)), function (freqCanviada) {
                                if (freqCanviada !== undefined) {
                                    freqacanviar = freqCanviada;

                                    //First SETUP => Assign new session 
                                    if (ActualMessageSession !== null && session === undefined) {
                                        session = ActualMessageSession;
                                        // If session has changed
                                    } else if (ActualMessageSession !== null && session !== ActualMessageSession) { 
                                        //TO BE implemented if necessary
                                    }
                                    regularUtils.individualPorts(data, function (port) {
                                        if (portsUsed[proxyClientID] !== undefined) {
                                            //availablePorts.push(portsUsed[proxyClientID]);
                                            //delete portsUsed[proxyClientID];
                                        }
                                        portsUsed[proxyClientID] = availablePorts.pop();
                                        //console.log(portsUsed[proxyClientID]);

                                        var auxClientPorts = "client_port=" + portsUsed[proxyClientID] + "-" + (portsUsed[proxyClientID] + 1);

                                        if (freqacanviar.type === "DVB-T") { //SETUP pel cas DVB-T

                                            var options = {
                                                serverAddress: serviceHost,
                                                freq: freqacanviar.freq,
                                                session: session,
                                                nSeq: regularUtils.SeqNum(data).toString().slice(6),
                                                clientports: auxClientPorts.toString(),
                                                msys: 'dvbt'
                                            };
                                            if(regularUtils.pids(data) !== null){
                                                options.pids = regularUtils.pids(data).toString();
                                            }

                                            messages.setupMessageDVBT (options, function (setupMessDVBT) {//FALTA reservar ports server per udp, Iniciar udp amb client
                                                logger.verbose("SETUP:\n>>>\n" + setupMessDVBT);
                                                serviceSocket.write(setupMessDVBT);
                                            });
                                        }
                                        else if (freqacanviar.type === "DVB-S" || freqacanviar.type === "DVB-S2") {//SETUP case DVB-S
                                            var msysT;
                                            if(freqacanviar.type == "DVB-S"){
                                                msysT = 'dvbs'}else{
                                                msysT = 'dvbs2'
                                            }
                                            var options = {
                                                serverAddress: serviceHost,
                                                freq: freqacanviar.freq,
                                                session: session,
                                                nSeq: regularUtils.SeqNum(data).toString().slice(6),
                                                clientports: auxClientPorts.toString(),
                                                fec: freqacanviar.fec,
                                                pol: freqacanviar.pol,
                                                sr: freqacanviar.sr,
                                                msys: msysT
                                            };
                                            if(regularUtils.pids(data) !== null){
                                                options.pids = regularUtils.pids(data).toString();
                                            }

                                            messages.setupMessageDVBS(options, function (setupMessDVBS) {//FALTA reservar ports server per udp, Iniciar udp amb client
                                                logger.debug("SETUP:\n>>>\n" + setupMessDVBS);

                                                serviceSocket.write(setupMessDVBS);
                                            });

                                        } else if (freqacanviar.type === "DVB-C" || freqacanviar.type === "DVB-C2") {
                                            var msysT;
                                            if (freqacanviar.type == "DVB-C") 
                                                msysT = 'dvbc'
                                            else
                                                msysT = 'dvbc2'
                                            
                                            var options = {
                                                serverAddress: serviceHost,
                                                freq: freqacanviar.freq,
                                                session: session,
                                                nSeq: regularUtils.SeqNum(data).toString().slice(6),
                                                clientports: auxClientPorts.toString(),
                                                mtype: freqacanviar.mtype,
                                                ds: freqacanviar.ds,
                                                sr: freqacanviar.sr,
                                                c2tft: freqacanviar.c2tft,
                                                plp: freqacanviar.plp,
                                                specinv: freqacanviar.specinv,
                                                bw: freqacanviar.bw,
                                                msys: msysT
                                            };
                                            if(regularUtils.pids(data) !== null){
                                                options.pids = regularUtils.pids(data).toString();
                                            }

                                            messages.setupMessageDVBC(options, function (setupMessageDVBC) {
                                                logger.debug("SETUP:\n>>>\n" + setupMessageDVBC);

                                                serviceSocket.write(setupMessageDVBC);
                                            })
                                    

                                        }
                                        else
                                            //Other cases TO BE implemented

                                        if (session === undefined) { 

                                            if(proxySocket.remoteAddress.length > 15){
                                                logger.info("UDP-Proxy for client:\n" + proxySocket.remoteAddress.toString().slice(7) + 'ports: ' + port[0] + '-' + port[1]);
                                                udpf.createUdpforward(proxySocket.remoteAddress.toString().slice(7), port[0], portsUsed[proxyClientID]);//Modificar ports a els reservats pel servidor
                                                udpf.createUdpforward(proxySocket.remoteAddress.toString().slice(7), port[1], (portsUsed[proxyClientID] + 1));
                                            }
                                            else{
                                                logger.info("UDP-Proxy for client:\n" + proxySocket.remoteAddress + 'ports: ' + port[0] + '-' + port[1]);
                                                udpf.createUdpforward(proxySocket.remoteAddress, port[0], portsUsed[proxyClientID]);//Modificar ports a els reservats pel servidor
                                                udpf.createUdpforward(proxySocket.remoteAddress, port[1], (portsUsed[proxyClientID] + 1));
                                            }
                                            logger.verbose("Remaining unused proxy Ports: "+availablePorts.length)
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
                                            logger.debug( "NOT FOUND (To Client):\n>>>\n" + notFoundMessage);
                                    });
                                }

                            });
                        } else {
                            mapping.toFreq (((regularUtils.Freq(data)).toString().slice(5)), function (freqCanviada) {

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
                                            logger.debug("SETUP Message without freq:\n>>>\n" + setupMessDVBT);

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
                                            logger.debug("SETUP Message without freq:\n>>>\n" + setupMessDVBS);

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
                                        logger.debug("Play Message DVB-T:\n>>>\n" + playMessDVBT);
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
                                        logger.debug("PLAY Message DVB-S:\n>>>\n" + playMessDVBS);
                                        serviceSocket.write(playMessDVBS);
                                    });
                                });
                            }
                            // is DVB-C 
                        }
                        else {
                            //canmbiem la IP i PORT del missatge PLAY simple (Addpids/Delpids)
                            var changeipPlay = VerEx().find(proxy).replace(data, serviceHost);
                            changeipPlay = VerEx().find(proxyPort).replace(changeipPlay, servicePort);
                            logger.debug("PLAY Message (Only Change IP):\n>>>\n" + changeipPlay);
                            serviceSocket.write(changeipPlay);
                        }
                    }
                    //canmbiem la IP i PORT del missatge TEARDOWN
                    else if (regularUtils.isTeardown(data) !== null) {
                        var changeipTeardown = VerEx().find(proxy).replace(data, serviceHost);
                        changeipTeardown = VerEx().find(proxyPort).replace(changeipTeardown, servicePort);
                        serviceSocket.write(changeipTeardown);
                        logger.debug("TEARDOWN Message (Only Change IP):\n>>>\n" + changeipTeardown);
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
                            logger.debug("OPTIONS Message:\n>>>\n" + message);
                        });
                    }
                }
                else if (regularUtils.isHTTP(data) !== null) {
                    logger.debug("HTTP requests not implemented!!!" + data);
                }
                else {
                    proxySocket.end();
                    serviceSocket.end();
                }

            });

            serviceSocket.on("data", function (data) {
                //canmbiem la IP i PORT dels missatges de resposta del Servidor
                if(proxySocket.getRemoteAddress !== null || proxySocket.getRemoteAddress !== undefined) {
                    var changeipOptions = VerEx().find(proxy).replace (data, proxySocket.remoteAddress.toString());
                    changeipOptions = VerEx().find(serviceHost).replace (changeipOptions, proxy);
                    logger.debug("Response Message from server (Only change IP , To Client):\n>>>\n" + changeipOptions);
                    proxySocket.write(changeipOptions);
                }
            });


            proxySocket.on("error", function (e) {
                serviceSocket.end();
                logger.debug("Error Client Connection" + e);

                //availablePorts.push(portsUsed[proxyClientID]);
                //delete portsUsed[proxyClientID];
            });
            serviceSocket.on("error", function (e) {
                proxySocket.end();
                logger.error("Error Server Connection" + e);
            });

            proxySocket.on("close", function (had_error) {
                serviceSocket.end();
                if (portsUsed[proxyClientID] !== undefined) {
                    //availablePorts.push(portsUsed[proxyClientID]);
                    //delete portsUsed[proxyClientID];
                }
                logger.debug("Client Connection closed " + had_error);

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
