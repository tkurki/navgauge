var n2kMessages = {
  POSITIONRAPIDUPDATE: 129025,
  '129025': {name: "Position, Rapid update",
    glyph: "pushpin"},

  WATERDEPTH: 128267,
  '128267': {name:"Water depth",
    glyph:"hand-down"},

  'SPEED': 128259,
  '128259': {name:"Speed", glyph:"flash"},

  'VESSELHEADING': 127250,
  '127250': {name:"Vessel Heading",glyph:"arrow-right"},

  'COGSOG': 129026,
  '129026': {name:"COG & SOG, Rapid update",glyph:"arrow-right"},

  'WIND': 130306,
  '130306': {name:"Wind Data",glyph:"flag"},

  'NAVIGATIONDATA': 129284,
  '129284': {name: "Navigation Data",glyph:"pushpin"},

  '129033': {name: "Time & Date", glyph: "time"},
  '126992': {name: "System Time", glyph: "time"},


  '129029': {name: "GNSS Position Data", glyph: "list"},

  '129540': {name: "GNSS Sats in View", glyph: "stats"},

  '262386': {name: "Actisense info", glyph: "list"},


  '129283': {name: "Cross Track Error",glyph:"pushpin"},

  '129285': {name: "Navigation - Route/WP Information",glyph:"tag"},

  '127245' : {name: "Rudder", glyph: "arrow-down"},

  '129539' : {name:"GNSS DOPs", glyph:"list"}
};

function getGlyph(msgType) {
  return n2kMessages[msgType] != undefined ? n2kMessages[msgType].glyph : "question-sign";
}

function getName(msgType, theDefault) {
  return n2kMessages[msgType] != undefined ? n2kMessages[msgType].name : theDefault ;
}

if (exports != undefined) {
  exports.n2kMessages = n2kMessages;
}

