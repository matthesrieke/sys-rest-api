var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://test.mosquitto.org');
var connected = false;

client.on('connect', function () {
  console.info('connected to mqqt host');
  connected = true;
});

client.on('error', function (err) {
  console.warn('mqtt error:'+ err);
});

var publish = function(payload, topic) {
  if (client && connected) {
    console.info('mqtt publish to topic: '+topic);
    client.publish(topic, payload);
  }
  else {
    console.info('not connected, skipping mqtt publish');
  }
};

module.exports.publish = publish;
