'use strict'

const TV_ENDPOINT = require('./secrets').TV_ENDPOINT;
const httpClient = require('request-promise-native');
const SkillAdapter = require('./skill-adapter').SkillAdapter;
const Constants = require('./skill-adapter').Constants;

exports.handler = function (event, context, callback) {
  const skillAdapter = new SkillAdapter(callback);
  skillAdapter.handle(event, eventHandler);
}

const eventHandler = {
  onDiscovery: function() {
    let payload = {
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
    return Promise.resolve(payload);
  },

  onControl: function(event) {
    let requestedName = event.header.name;
    switch (requestedName) {
      case Constants.REQUEST_TURN_ON :
        return handleControlTurnOn(event);
      case Constants.REQUEST_TURN_OFF :
        return handleControlTurnOff(event);
      default:
        console.log("Error", "Unsupported operation" + requestedName);
        return handleUnsupportedOperation();
    }
  }
}

const handleControlTurnOn = function(event) {
  return toggleTv().then(() => {
    return createResponse(Constants.RESPONSE_TURN_ON);
  });
}

const handleControlTurnOff = function(event) {
  return toggleTv().then(() => {
    return createResponse(Constants.RESPONSE_TURN_OFF);
  });
}

function toggleTv() {
  return httpClient(TV_ENDPOINT).then((body) => {
    return Promise.resolve('success');
  }).catch(err => {
    return Promise.resolve('success');
  });
}

const handleUnsupportedOperation = function() {
  return createResponse(Constants.ERROR_UNSUPPORTED_OPERATION);
}

function createResponse(type) {
  return Promise.resolve({
    type: type,
    payload: {}
  });
}
