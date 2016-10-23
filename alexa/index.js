const TV_ENDPOINT = require('./secrets').TV_ENDPOINT;
const httpClient = require('request-promise-native');

exports.handler = function (event, context, callback) {
  let skillAdapter = new SkillAdapter(callback);
  skillAdapter.handle(event, eventHandler);
}

var eventHandler = {

  onDiscovery: function() {
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
    return Promise.resolve(payload);
  },

  onControl: function(event) {
    var requestedName = event.header.name;
    switch (requestedName) {
      case SkillAdapter.REQUEST_TURN_ON :
        return handleControlTurnOn(event);
      case SkillAdapter.REQUEST_TURN_OFF :
        return handleControlTurnOff(event);
      default:
        console.log("Error", "Unsupported operation" + requestedName);
        return handleUnsupportedOperation();
    }
  }
}

var handleControlTurnOn = function(event) {
  return toggleTv().then(() => {
    return createResponse(SkillAdapter.RESPONSE_TURN_ON);
  });
}

var handleControlTurnOff = function(event) {
  return toggleTv().then(() => {
    return createResponse(SkillAdapter.RESPONSE_TURN_OFF);
  });
}

function toggleTv() {
  // not needed if you're using http or have a legit ssl cert
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  return httpClient(TV_ENDPOINT).then((body) => {
    return Promise.resolve('success');
  }).catch(err => {
    return Promise.resolve('success');
  });
}

var handleUnsupportedOperation = function() {
  return createResponse(SkillAdapter.ERROR_UNSUPPORTED_OPERATION);
}

function createResponse(type) {
  return Promise.resolve({
    type: type,
    payload: {}
  });
}
