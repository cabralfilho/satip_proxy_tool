# satip-proxy
Proxy to translate DVB-S/S2/T RTSP queries. The proxy can translate client queries of one type to another.

These translations can be done:

From | To
-----|----
DVB-S| DVB-T
DVB-S2| DVB-T
DVB-S| DVB-S
DVB-T| DVB-S
DVB-T| DVB-S2

All translations & parameters must be included in maps.json archive.

* maps.json have this structure:

    {"from":"12711",
         "freq": "778",
        "type": "DVB-T"
    },
    {"from":"12727",
        "freq": "12727",
        "type": "DVB-S",
        "fec": "89",
        "pol": "h",
        "sr": "22000"
    },

'from' parameter, specify the freq found in client queries.

'freq' parameter specify the translated freq
type, determine the translated type

, all other relevant parameters are included


*

##How to install:##

From Source:

    git clone https://github.com/jfont555/satip_proxy_tool

Install dependencies with:

    npm install

Use it like other node tools

##How to use it:##


* Arguments:

**-c --config:** SSDP config file'

**-p --path:** Path configuration file

**-V --Verbose:** Enable Verbose


* XML parameters:

**-d --devicetype:** Set deviceType in XML

**-n --friendlyName:**  Set friendlyName in XML

**-m --manufacturer:** Set manufacturer in XML

**-U --manufacturerURL:** Set manufacturerURL in XML

**-r --modelDescription:** Set modelDescription in XML

**-u --path:** Set path in XMl

**-d --modelURL:** Set modelURl in XML

**-q --modelName:** Set modelName in XMl

**-v --udn:** Set udn in XML

**-b --modelNumber:** Set modelNumber in XMl

**-s --serialNumber:** Set serialNumber in XMl

**-t --UPC:** Set UPC in XMl

**-x --satipX_SATIPCAP:** Set satipX_SATIPCAP in XMl

* Note that XML use these default parameters if are not specified and also XML path is not provided:

            deviceType: "SatIPServer:1" ,
            friendlyName: "Sat>IP Proxy ",
            manufacturer: "JFv",
            manufacturerURL: "http://www.github.com/jfont555/satip_proxy_tool",
            modelDescription: "Sat>IP proxy",
            modelURL: "http://www.github.com/jfont555/satip_proxy_tool",
            modelName: "SAT>IP PROXY TEST",
            modelNumber: "Release 18-05-16",
            serialNumber: "PCSATIP-1JFVSAT",
            UDN:  Generate and return a RFC4122 v1 (timestamp-based)
            satip:X_SATIPCAP' : 'DVBT-1,DVBS-2'

* Configuration File:

Some parameters must be specified in config_rtsp.json file:


    "serverPort": "555", Port that PROXY USE
    "minPort": "52000",  PROXY RTP port range min value
    "maxPort": "52010"   Proxy RTP port range max value


    "externServer" : "192.168.1.99", SAT>IP Server IP
    "externPort" : "554" SAT>IP Server Port

The most important is SAT>IP Server IP. Other parameters can be modified for user needs.

* Usage:

    sudo node index.js [args]

##Examples##



##TO-DO##
