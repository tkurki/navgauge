XXXXX
======

Navigation displays in your browser

XXXXX makes navigation data coming via NMEA 0183 and NMEA 2000 (N2K) available on your browser in customizable displays.

The system is really a Node Js http server application that pipes data from N2K and NMEA connections to the browser via Websockets.
Browser code updates the displayed gauges and maps as new data is received.

Access to N2K bus is provided by Canboat's actisense-serial software and Actisense's NGT-1 N2K to usb adapter. N2K messages are analyzed using Canboat analyzer.

XXXX uses gpspipe from gpsd to access NMEA 0183. Any NMEA 0183 device available via gpsd can be accessed and adding support for previously unknown NMEA 0183 sentences is pretty straightforward.

Captured data sets, either directly from actisense-serial and gpspipe or XXXXX generated, unified json stream, can be used to 'play back' trips to use in debugging and development.

NMEA 0183 data can also be broadcast via UDP to be used in other applications such as INavX and iRegatta.

Tooling

* Node with baconjs, nmea, node-static, optimist, primus, ws

Quick Start

(1) Install Node JS
(2) Install npm packages
   npm install baconjs nmea node-static optimist primus ws
(3) Grab the code
  git clone  or zip
(4) Start server with the sample data file
(5) Open http://localhost:8080/wind.html