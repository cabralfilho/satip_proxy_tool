# satip-proxy
Proxy to translate DVB-S/S2/T RTSP queries. The proxy can translate client queries of one type to another.

These translations can be done:

From | To
-----|----
DVB-S/S2| DVB-T
DVB-S/S2| DVB-S/S2
DVB-T| DVB-S/S2
DVB-T| DVB-T
DVB-C| DVB-T
DVB-C| DVB-S/S2

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

## How to install: ##

From Source:

    git clone https://github.com/jfont555/satip_proxy_tool

Install dependencies with:

    npm install

Use it like other node tools

## How to use it: ##


* Arguments:

**-c --config:** SSDP config file'

**-p --path:** Path configuration file

**-v --verbose:** Enable Verbose, Verbose level = verbose: 1, debug: 2. Default level is: info.

**-f --Files:** Flag for save logs to file or not


* XML parameters:

**-d --devicetype:** Set deviceType in XML

**-n --friendlyName:**  Set friendlyName in XML

**-m --manufacturer:** Set manufacturer in XML

**-U --manufacturerURL:** Set manufacturerURL in XML

**-r --modelDescription:** Set modelDescription in XML

**-u --path:** Set path in XMl

**-d --modelURL:** Set modelURl in XML

**-q --modelName:** Set modelName in XMl

**-V --udn:** Set udn in XML

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

Some parameters must be specified in config.json file:


    "serverRtspPort": "554",         Port that PROXY USE
    "minPort": "52000",              PROXY RTP port range min value
    "maxPort": "52010",              Proxy RTP port range max value
    "serverHttpPort": "8990"         Port for HTTP server

    "externServer" : "192.168.1.99", SAT>IP Server IP
    "externPort" : "554"             SAT>IP Server Port

                                     Port rang for Proxy RTP (Not implemented yet)
    "clientPortMin": "40200",
    "clientPortMax": "40200"


The most important is SAT>IP Server IP. Other parameters can be modified for user needs.

* Usage:

    sudo node index.js [args]
    
## Motivate us!
Feel free to star the project and/or message me about it. It is always super-exciting to see real-world people using this , and it helps us to prioritize new features and bug fixes.

And if you find this useful, ensure that it is kept alive by donating:

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=FVAPQNL7S9GRS)


## Examples ##

config.json:

        "serverRtspPort": "554",
        "minPort": "52000",
        "maxPort": "52010",
        "serverHttpPort": "8990"

        "externServer" : "192.168.1.99",
        "externPort" : "554"

        "clientPortMin": "40200",
        "clientPortMax": "40200"

maps.json:

    {"frequencies": [
          {"from":"12727",
            "freq": "12727",
            "type": "DVB-S",
            "fec": "89",
            "pol": "h",
            "sr": "22000"
          },
          {"from":"786",
            "freq": "12727",
            "type": "DVB-S",
            "fec": "89",
            "pol": "h",
            "sr": "22000"
            },
          {"from":"778",
            "freq": "12727",
            "type": "DVB-S",
            "fec": "89",
            "pol": "h",
            "sr": "22000"
          },
          {"from":"770",
            "freq": "12727",
            "type": "DVB-S",
            "fec": "89",
            "pol": "h",
            "sr": "22000"
          }
          ]
    }

Freq: 786,778,770 MHz are mapped to 12727 MHz DVB-S
Also freq 12727 MHz is mapped to 12727 MHZ DVB-S

Turn on proxy:

    sudo node index.js -v 2 -f

turn on with debug verbosity and save log to file.

HTTP server will run in localhost at port:8990

XML file will be in: localhost:8990/DeviceDescription/DeviceDesc.xml


## TO-DO ##

* Restart proxy after crash
* Make a script to execute like: 'proxy [args]'
* Support for mapping DVB-C standard
