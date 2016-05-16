/**
 * Created by jordi on 12/04/15.
 */
var util = require('util');
var net = require('net');
var VerEx = require('verbal-expressions');
var config = require('./config_rtsp.json');
var udpf = require('./udp_forward');
var logger = require('./logger.js');
var messages = require('./messages_lib.js');
var mapping = require('./mapping.js');
var regularUtils = require('./regularExpforProxy.js').regularExp;
var myIp = require('./http_s.js');
var GeneralFunctions = require('./general_functions.js');



var proxyPort = config.localproxy.serverPort; // Port on es connecta el client SAT>IP
var serviceHost = config.Server.externServer; // Adreça servidor SAT>IP extern
var servicePort = config.Server.externPort; // Port Servidor Sat>IP extern
var proxy = myIp.getIPAddress(); //Adreça proxy sat>ip

var minPort = config.localproxy.minPort;
var maxPort = config.localproxy.maxPort;

console.log(proxyPort + " " + serviceHost + " " + servicePort + " " + proxy);

console.log("\nInit SAT>IP RTSP-Server Proxy\n\n\n");
logger.debug({timestamp: Date.now()}, "Init SAT>IP RTSP-Server Proxy");

var portsUsed = {};
var availablePorts = [];
for(var i=parseInt(minPort); i<parseInt(maxPort); i=i+2){
    availablePorts.push(i);
}

var ProxySatIP = function () {
    net.createServer(function (proxySocket) {
            var proxyClientID = undefined;
            var serviceSocket = new net.Socket();
            serviceSocket.connect(parseInt(servicePort), serviceHost, function () {
                //logger.debug({timestamp: Date.now()}, ' New connection to proxy: ' + proxySocket.getRemoteAddress());
                GeneralFunctions.uuidGenerator(function (proxySessID){
                    proxyClientID= proxySessID;
                    console.log("\nProxy_id: "+proxyClientID);
                });
            });

            var session = undefined;

            proxySocket.on("data", function (data) {
                console.log(data.toString());
                if (regularUtils.isRTSP(data) !== null) {
                    var ActualMessageSession = regularUtils.SessionCheck(data);
                    var freqacanviar = undefined;

                    if (ActualMessageSession !== null && session === undefined) {
                        session = ActualMessageSession;
                    }

                    if ((regularUtils.isSetup(data) !== null)) {
                        if (regularUtils.Ports(data) !== null) {

                            mapping.toFreq(((regularUtils.Freq(data)).toString().slice(5)), function (freqCanviada) {

                                if(freqCanviada !== undefined) {
                                    freqacanviar = freqCanviada;

                                    //Si és el primer SETUP, assignem sessió
                                    if (ActualMessageSession !== null && session === undefined) {
                                        session = ActualMessageSession;
                                    } else if (ActualMessageSession !== null && session !== ActualMessageSession) { //Si la sessió ha canviat
                                        //TO BE implemented if necessary
                                    }
                                    regularUtils.individualPorts(data, function (port) {
                                        if(portsUsed[proxyClientID] !== undefined){
                                            //availablePorts.push(portsUsed[proxyClientID]);
                                            //delete portsUsed[proxyClientID];
                                        }
                                        portsUsed[proxyClientID] = availablePorts.pop();
                                        //console.log(portsUsed[proxyClientID]);

                                        if (freqacanviar.type == "DVB-T") { //SETUP pel cas DVB-T

                                            var auxClientPorts = "client_port="+portsUsed[proxyClientID]+"-"+(portsUsed[proxyClientID]+1);

                                            var options = {
                                                serverAddress: serviceHost,
                                                freq: freqacanviar.freq,
                                                pids: regularUtils.pids(data).toString(),
                                                session: session,
                                                nSeq: regularUtils.SeqNum(data).toString().slice(6),
                                                clientports: auxClientPorts.toString()
                                            };

                                            //logger.debug({timestamp: Date.now()}, 'ServiceSocket connect to server: ' + freqacanviar.freq[5]);
                                            messages.setupMessageDVBT(options, function (setupMessDVBT) {//FALTA reservar ports server per udp, Iniciar udp amb client
                                                console.log("SETUP MESS" + setupMessDVBT);
                                                serviceSocket.write(setupMessDVBT);
                                            });
                                        }
                                        else if (freqacanviar.type == "DVB-S") {//SETUP pel cas DVB-S
                                            var auxClientPorts = "client_port="+portsUsed[proxyClientID]+"-"+(portsUsed[proxyClientID]+1);

                                            var options = {
                                                serverAddress: serviceHost,
                                                freq: freqacanviar.freq,
                                                pids: regularUtils.pids(data).toString(),
                                                session: session,
                                                nSeq: regularUtils.SeqNum(data).toString().slice(6),
                                                clientports: auxClientPorts.toString(),
                                                fec: freqacanviar.fec,
                                                pol: freqacanviar.pol,
                                                sr: freqacanviar.sr
                                            };

                                            logger.debug({timestamp: Date.now()}, 'ServiceSocket connect to server: ' + freqacanviar.freq[5]);
                                            messages.setupMessageDVBS(options, function (setupMessDVBS) {//FALTA reservar ports server per udp, Iniciar udp amb client
                                                console.log("SETUP MESS" + setupMessDVBS);
                                                serviceSocket.write(setupMessDVBS);
                                            });

                                        } else {
                                        }//Cas per no DVB-S i no DVB-T TO BE implemented

                                        if (session === undefined) { // Si ja tenim sessió ja tenim proxy udp de ports
                                            console.log("\nPORT OPEN proxy \n")
                                            logger.debug({timestamp: Date.now()}, 'Iniciant UDP-Proxy per client' + proxySocket.remoteAddress + 'ports: ' + port[0] + '-' + port[1]);
                                            udpf.createUdpforward(proxySocket.remoteAddress.toString().slice(7), port[0], portsUsed[proxyClientID]);//Modificar ports a els reservats pel servidor
                                            udpf.createUdpforward(proxySocket.remoteAddress.toString().slice(7), port[1], (portsUsed[proxyClientID]+1));
                                        }
                                    });
                                }
                                // Si la freq no està a la llista de traduccions, i és el primer SETUP, el proxy retorna automàticament Not found
                                else{
                                    var options = {
                                        nSeq: regularUtils.SeqNum(data).toString().slice(6)
                                    }
                                    messages.freqNotFound(options,function (notFoundMessage){
                                       proxySocket.write(notFoundMessage);
                                        console.log("NOT FOUND:\n"+notFoundMessage);
                                    });
                                }

                            });
                        }else{
                            mapping.toFreq(((regularUtils.Freq(data)).toString().slice(5)), function (freqCanviada) {

                                if(freqCanviada !== undefined) {
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
                                            console.log("SETUP MESS" + setupMessDVBT);
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
                                            console.log("SETUP MESS" + setupMessDVBS);
                                            serviceSocket.write(setupMessDVBS);
                                        });
                                    }else {
                                    }//Cas per no DVB-S i no DVB-T TO BE implemented
                                }

                            });
                        }
                    }
                    else if (regularUtils.isPlay(data) !== null) {

                        if (regularUtils.Freq(data) !== null) { // Ens passen una freq al PLAY
                            console.log("PLAY\n ");
                            if (regularUtils.isDvbt(data) === null) {// cas de dvbs Es comproba diferent ja que la comanda es realitza en la mateixa sessió!
                                mapping.toFreq(((regularUtils.Freq(data)).toString().slice(5)), function (freqCanviada) {

                                    if(freqCanviada !== undefined) {
                                        freqacanviar = freqCanviada;
                                    }else{
                                        freqacanviar = {
                                            freq: 0000
                                        }
                                    }

                                    var options = {
                                        serverAddress: serviceHost,
                                        freq: freqacanviar.freq,//.toString().slice(5),
                                        stream: regularUtils.Stream(data),//.toString().slice(7),
                                        source: regularUtils.Src(data),//.toString().slice(4),
                                        nSeq: regularUtils.SeqNum(data),//.toString().slice(6),
                                        session: ActualMessageSession//s.toString().slice(9)
                                    };
                                    messages.playMessageDVBT(options, function (playMess) {
                                        console.log(options);
                                        console.log("\n" + playMess);
                                        serviceSocket.write(playMess);
                                    });
                                });
                            }
                            else { // Cas dvbt
                                mapping.toFreq(((regularUtils.Freq(data)).toString().slice(5)), function (freqCanviada) {
                                    if(freqCanviada !== undefined) {
                                        freqacanviar = freqCanviada;
                                    }else{
                                        freqacanviar = {
                                            freq: 0000,
                                            fec: '89',
                                            pol: 'h',
                                            sr: '22000'
                                        }
                                    }                                    var options = {
                                        serverAddress: serviceHost,
                                        freq: freqacanviar.freq,
                                        pids: regularUtils.pids(data).toString(),
                                        session: ActualMessageSession,
                                        stream: regularUtils.Stream(data),//.toString().slice(7),
                                        source: regularUtils.Src(data),
                                        nSeq: regularUtils.SeqNum(data).toString().slice(6),
                                        fec: freqacanviar.fec,
                                        pol: freqacanviar.pol,
                                        sr: freqacanviar.sr
                                    };

                                    messages.playMessageDVBS(options, function (setupMessDVBS) {//FALTA reservar ports server per udp, Iniciar udp amb client
                                        console.log("SETUP MESS" + setupMessDVBS);
                                        serviceSocket.write(setupMessDVBS);
                                    });
                                });
                            }
                        }
                        else {
                            //canmbiem la IP i PORT del missatge PLAY simple (Addpids/Delpids)
                            var changeipPlay = VerEx().find(proxy).replace(data, serviceHost);
                            changeipPlay = VerEx().find(proxyPort).replace(changeipPlay, servicePort);
                            console.log("\nMESSAGE PLAY\n" + changeipPlay);
                            serviceSocket.write(changeipPlay);
                        }
                    }
                    //canmbiem la IP i PORT del missatge TEARDOWN
                    else if (regularUtils.isTeardown(data) !== null) {
                        var changeipTeardown = VerEx().find(proxy).replace(data, serviceHost);
                        changeipTeardown = VerEx().find(proxyPort).replace(changeipTeardown, servicePort);
                        serviceSocket.write(changeipTeardown);
                        //availablePorts.push(portsUsed[proxyClientID]);
                        //delete portsUsed[proxyClientID];
                    }
                    //canmbiem Tornem a escriure el missatge PLAY degut a errors amb alguns Servidors (TVH)
                    else if (regularUtils.isOptions(data) !== null) {
                        var options = {
                            serverAddress: serviceHost,
                            nSeq: regularUtils.SeqNum(data),//.toString().slice(6),
                            session: ActualMessageSession//s.toString().slice(9)
                        }
                        messages.optionsMessage(options, function (message) {
                            serviceSocket.write(message);
                            console.log("OPTIONS MODIFIED:\n"+message)
                        });
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
                //canmbiem la IP i PORT dels missatges de resposta del Servidor
                console.log("PROXYS " + data.toString());
                var changeipOptions = VerEx().find(proxy).replace(data, proxySocket.remoteAddress.toString());
                changeipOptions = VerEx().find(serviceHost).replace(changeipOptions, proxy);
                console.log("PROX MODIFIED " + changeipOptions.toString());

                proxySocket.write(changeipOptions);
            });


            proxySocket.on("error", function (e) {
                serviceSocket.end();
                //availablePorts.push(portsUsed[proxyClientID]);
                //delete portsUsed[proxyClientID];
            });
            serviceSocket.on("error", function (e) {
                console.log("Could not connect to service at host "
                + serviceHost + ', port ' + servicePort);
                proxySocket.end();
            });

            proxySocket.on("close", function (had_error) {
                serviceSocket.end();
                if(portsUsed[proxyClientID] !== undefined) {
                    //availablePorts.push(portsUsed[proxyClientID]);
                    //delete portsUsed[proxyClientID];
                }
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
