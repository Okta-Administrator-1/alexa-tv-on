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

const SkillAdapter = function(callback) {
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
  const requestedNamespace = event.header.namespace;
  switch (requestedNamespace) {
    case NAMESPACE_DISCOVERY:
      return eventHandler.onDiscovery().then(mapToDiscoveryResponse);
    case NAMESPACE_CONTROL:
      return eventHandler.onControl(event).then(mapToControlResponse);
    default:
      throw 'error: unhandled ' + requestedNamespace;
  }
}

const mapToDiscoveryResponse = function(payload) {
  const header = createHeader(NAMESPACE_DISCOVERY, RESPONSE_DISCOVER);
  return Promise.resolve(createDirective(header, payload));
}

const mapToControlResponse = function(data) {
  let header = createHeader(NAMESPACE_CONTROL, data.type);
  return Promise.resolve(createDirective(header, data.payload));
}

const createHeader = function(namespace, name) {
  return {
    "messageId": createMessageId(),
    "namespace": namespace,
    "name": name,
    "payloadVersion": "2"
  };
}

function createMessageId() {
  const d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (d + Math.random()*16)%16 | 0;
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}

const createDirective = function(header, payload) {
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
