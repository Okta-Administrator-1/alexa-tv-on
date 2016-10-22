const TV_ENDPOINT = require('./secrets').TV_ENDPOINT;

const https = require('request-promise-native');

const NAMESPACE_CONTROL = "Alexa.ConnectedHome.Control";
const NAMESPACE_DISCOVERY = "Alexa.ConnectedHome.Discovery";

const REQUEST_DISCOVER = "DiscoverAppliancesRequest";
const RESPONSE_DISCOVER = "DiscoverAppliancesResponse";

const REQUEST_TURN_ON = "TurnOnRequest";
const RESPONSE_TURN_ON = "TurnOnConfirmation";
const REQUEST_TURN_OFF = "TurnOffRequest";
const RESPONSE_TURN_OFF = "TurnOffConfirmation";

const ERROR_UNSUPPORTED_OPERATION = "UnsupportedOperationError";
const ERROR_UNEXPECTED_INFO = "UnexpectedInformationReceivedError";

exports.handler = function (event, context, callback) {
    console.log(JSON.stringify(event));
    var requestedNamespace = event.header.namespace;
    var response = null;
    switch (requestedNamespace) {
      case NAMESPACE_DISCOVERY:
        response = handleDiscovery(event);
        break;
      case NAMESPACE_CONTROL:
        response = handleControl(event);
        break;
      default:
        response = handleUnexpectedInfo(requestedNamespace);
        break;
    }

    response.then((data) => {
      console.log(JSON.stringify(data));
      callback(null, data);
    }).catch((error) => {
      console.log(JSON.stringify(error));
      callback(null, null);
    });
}

var handleDiscovery = function(event) {
  var header = createHeader(NAMESPACE_DISCOVERY, RESPONSE_DISCOVER);
  var payload = {
    "discoveredAppliances": [
      {
        "applianceId":"tv-ouchadam",
        "manufacturerName":"ouchadam",
        "modelName":"01",
        "version":"0.0.1",
        "friendlyName":"T. V.",
        "friendlyDescription":"TV Control",
        "isReachable": true,
        "actions":[
           "turnOn",
           "turnOff"
        ],
        "additionalApplianceDetails": {}
      }
    ]
  };
  return Promise.resolve(createDirective(header, payload));
}

var handleControl = function(event) {
  var response = null;
  var requestedName = event.header.name;
  switch (requestedName) {
    case REQUEST_TURN_ON :
      response = handleControlTurnOn(event);
      break;
    case REQUEST_TURN_OFF :
      response = handleControlTurnOff(event);
      break;
    default:
      log("Error", "Unsupported operation" + requestedName);
      response = handleUnsupportedOperation();
      break;
  }
  return response;
}

var handleControlTurnOn = function(event) {
  return toggleTv().then(() => {
    var header = createHeader(NAMESPACE_CONTROL, RESPONSE_TURN_ON);
    var payload = {};
    return Promise.resolve(createDirective(header, payload));
  });
}

function toggleTv() {
  // not needed if you're using http or have a legit ssl cert
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  return https(TV_ENDPOINT).then((body) => {
    return Promise.resolve('success');
  }).catch(err => {
    return Promise.resolve('success');
  });
}

var handleControlTurnOff = function(event) {
  return toggleTv().then(() => {
    var header = createHeader(NAMESPACE_CONTROL,RESPONSE_TURN_OFF);
    var payload = {};
    return Promise.resolve(createDirective(header, payload));
  });
}

var handleUnsupportedOperation = function() {
  var header = createHeader(NAMESPACE_CONTROL,ERROR_UNSUPPORTED_OPERATION);
  var payload = {};
  return Promise.resolve(createDirective(header,payload));
}

var createHeader = function(namespace, name) {
  return {
    "messageId": createMessageId(),
    "namespace": namespace,
    "name": name,
    "payloadVersion": "2"
  };
}

function createMessageId() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}

var createDirective = function(header, payload) {
  return {
    "header" : header,
    "payload" : payload
  };
}

var log = function(title, msg) {
  console.log('**** ' + title + ': ' + JSON.stringify(msg));
}
