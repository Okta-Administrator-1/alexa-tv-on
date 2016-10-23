'use strict'

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

let SkillAdapter = function(callback) {
  this.callback = callback;
}

SkillAdapter.prototype.handle = function(event, eventHandler) {
  console.log(JSON.stringify(event));

  createResponseFor(event, eventHandler).then((data) => {
    console.log(JSON.stringify(data));
    this.callback(null, data);
  }).catch((error) => {
    console.log(JSON.stringify(error));
    this.callback(null, null);
  });
}

function createResponseFor(event, eventHandler) {
  let requestedNamespace = event.header.namespace;
  switch (requestedNamespace) {
    case NAMESPACE_DISCOVERY:
      return eventHandler.onDiscovery().then(mapToDiscoveryResponse);
    case NAMESPACE_CONTROL:
      return eventHandler.onControl(event).then(mapToControlResponse);
    default:
      throw 'error: unhandled ' + requestedNamespace;
  }
}

let mapToDiscoveryResponse = function(payload) {
  let header = createHeader(NAMESPACE_DISCOVERY, RESPONSE_DISCOVER);
  return Promise.resolve(createDirective(header, payload));
}

let mapToControlResponse = function(data) {
  let header = createHeader(NAMESPACE_CONTROL, data.type);
  return Promise.resolve(createDirective(header, data.payload));
}

let createHeader = function(namespace, name) {
  return {
    "messageId": createMessageId(),
    "namespace": namespace,
    "name": name,
    "payloadVersion": "2"
  };
}

function createMessageId() {
  let d = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}

let createDirective = function(header, payload) {
  return {
    "header" : header,
    "payload" : payload
  };
}

module.exports = {
  SkillAdapter: SkillAdapter,
  Constants: {
    REQUEST_TURN_ON: REQUEST_TURN_ON,
    RESPONSE_TURN_ON: RESPONSE_TURN_ON,
    REQUEST_TURN_OFF: REQUEST_TURN_OFF,
    RESPONSE_TURN_OFF: RESPONSE_TURN_OFF
  }
}
