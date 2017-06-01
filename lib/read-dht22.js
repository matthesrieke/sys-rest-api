var exec = require('child_process').exec;
var cmd = '/opt/get-temp.sh';
var csv = require('csv');
// var sensor = require('node-dht-sensor');
var sensor = require('./dummy-dht');

var readData = function(callback, repetition) {

  sensor.read(22, 4, function(err, temperature, humidity) {
    if (!err) {

      //the sensor seems to give the data of the last measurement? measure two times
      if (!repetition) {
        setTimeout(function() {
          readData(callback, true);
        }, 1001);
        return;
      }

      //return the data
      callback([{
        temperature: temperature,
        humidity: humidity
      }]);
    }
    else {
      console.warn(err);
      callback(null);
    }
  });
};

module.exports.readData = readData;
