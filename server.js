// var dataService = require('./lib/read-data');
var dataService = require('./lib/read-dht22');
var express = require('express');
var cors = require('cors')
var fs = require('fs');
var mqtt = require('./lib/mqtt-publish');

var converter = require("swagger-to-html")({ /* options */ });
var YAML = require('yamljs');

// // call the lesscss-compiler to generate css
// converter.generateCss('./docs');
//
// // call handlebars to generate the HTML-code
// converter.generateHtml(YAML.load('./swagger.yml'), './docs');

var app = express();
app.use(cors());
//
// app.use('/docs', express.static(__dirname + '/docs'));

var timeSeries = require('./cache/cache.json');
if (!timeSeries.features['n52-subsidiary']) {
  timeSeries.features['n52-subsidiary'] = {
        type: "Feature",
        properties: {
          identifier: "n52-subsidiary"
        },
        geometry: {
          type: "Point",
          coordinates: [
            7.649244368076324,
            51.93432195507079
          ]
        },
        observations: []
    };
}

var readData = function() {
  dataService.readData(function(data) {
    if (!data) {
      console.warn("could not read data");
      return;
    }

    data.forEach(function(entry) {
      entry.timestamp = Math.floor(new Date() / 1000);
      timeSeries.features['n52-subsidiary'].observations.unshift(entry);
    });

    data.forEach(function(origEntry) {
      var entry = JSON.parse(JSON.stringify(origEntry));
      entry.feature = 'n52-subsidiary';
      mqtt.publish(JSON.stringify(entry), 'pi-weather/'+entry.feature);
    });
  });
};


var updateCache = function() {
  fs.writeFile('./cache/cache.json', JSON.stringify(timeSeries), function (err, data) {
    if (err) {
      return console.log(err);
    }
    console.log('cache updated at: ./cache/cache.json');
  });
}


/**
* Controller definitions
*/
app.get('/features', function (req, res) {
  var features = JSON.parse(JSON.stringify(timeSeries.features));
  var response = {
    type: "FeatureCollection",
    features: []
  };
  for (var feat in features) {
    if (features.hasOwnProperty(feat)) {
      delete features[feat].observations;
      response.features.push(features[feat]);
    }
  }
  res.send(response);
});

app.get('/features/:id', function (req, res) {
  var resp = JSON.parse(JSON.stringify(timeSeries.features));
  for (var feat in resp) {
    if (resp.hasOwnProperty(feat)) {
      delete resp[feat].observations;
      if (feat !== req.params.id) {
        delete resp[feat];
      }
    }
  }
  res.send(resp[req.params.id]);
});

app.get('/features/:id/observations', function (req, res) {
  var resp = JSON.parse(JSON.stringify(timeSeries.features));
  for (var feat in resp) {
    if (resp.hasOwnProperty(feat)) {
      if (feat === req.params.id) {
        res.send(resp[feat].observations);
        return;
      }
    }
  }
  res.send({});
});

setInterval(readData, 1000*60*5);
readData();

setInterval(updateCache, 1000*60*15 +5000);

app.listen(3000, function () {
  console.log('Data API listening on port 3000!');
});
