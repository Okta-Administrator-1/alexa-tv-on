var SECRETS = require('secrets');

var WIFI_NAME = SECRETS.WIFI_NAME;
var WIFI_OPTIONS = { password : SECRETS.WIFI_PASSWORD };
var LISTEN_PORT = SECRETS.SERVER_PORT;

var PLAIN_CONTENT = {'Content-Type': 'text/plain'};

var http = require("http");
var wifi = require("EspruinoWiFi");
var panasonic = require('panasonic-ir');

function onInit() {
  wifi.connect(WIFI_NAME, WIFI_OPTIONS, function(err) {
    if (err) {
      console.log("Connection error: " + err);
      return;
    }
    startServer();
  });
}

function startServer() {
  wifi.getIP(function(error, data) {
    console.log("server started " + data.ip + ":" + LISTEN_PORT);
  });
  http.createServer(onRequest).listen(LISTEN_PORT);
}

var onRequest = function(request, response) {
  var a = url.parse(request.url, true);
  if (a.path === '/tv ' || a.path === '/tv/') {
    response.writeHead(200, PLAIN_CONTENT);
    response.end(JSON.stringify(a));
    handleRequest();
  } else {
    response.writeHead(404, PLAIN_CONTENT);
    response.end("404: Page " + a.pathname + " not found");
  }
};

function handleRequest() {
  on();
}

function on() {
  var command = panasonic.encode(0x4004, 0x100BCBD);
  emit(command, A5, A6);
}

function emit(command, pinOne, pinTwo) {
  analogWrite(pinOne,0.9,{freq:35000});
  digitalPulse(pinTwo, 1, command);
  digitalPulse(pinTwo, 1, 0);
  analogWrite(pinOne,0,{freq:35000});
}
