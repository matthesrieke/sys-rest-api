var exec = require('child_process').exec;
var cmd = '/opt/get-temp.sh';
var csv = require('csv');


var readData = function(callback) {
  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      console.warn('Could not read data');
      return;
    }

    csv.parse(stdout, {columns: true, delimiter: ';'}, function(err, data) {
      callback(data);
    });
  });
};

module.exports.readData = readData;
