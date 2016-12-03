var express = require('express')
, hhtp = require('http')
, bodyParser = require('body-parser')
, path = require('path')
, methodOverride = require('method-override')
, errorHandler = require('error-handler')
,levelup = require('levelup');
var apiInfo = require('./package.json')
var app = express();
var url = require('url')
app.set('port', process.env.PORT || 9999);

app.use(methodOverride());
app.use(bodyParser.json());

var db = levelup('./event', {valueEncoding: 'json'});
var apiConnectInfo = {
  "title": apiInfo.title,
  "version": apiInfo.version,
  "status": apiInfo.status
}

// db.put('data',
//   {
//     "name": "Interview for sweet dev job",
//     "start": "2016-10-30T20:44:49.100Z",
//     "end": "2016-10-30T20:44:49.100Z",
//     "id": "659ab379-083f-4414-a73a-aa593c3f9892"
//   }
// );

// ROUTES
// GET/ -- Return API Title, Version, & Status form package.Json file
app.get('/', function (req, res) {
  res.send(apiConnectInfo);
});

// GET/events
// Should return json listing (array) of all events
app.get('/events', function(req, res){
  console.log('Listing All Events')
  var is_first = true;

  res.setHeader('content-type', 'application/json');
  db.createReadStream()
  .on('data', function(data){
    console.log(data.value)

    if (is_first == true){
      res.write('[');
    }
    else {
      res.write(',');
    }
    res.write(JSON.stringify(data.value));
    is_first = false;
  })
  .on('error', function(error){
    console.log('Error While Reading', error)
  })
  .on('close', function(){
    console.log('Closing DB Stream');})
    .on('end', function(){
      console.log('DB Stream Closed');
      res.end(']');
    })
  });

//GET /events/:id
// Should return json for a specific event
app.get('/events/:id', function(req, res){
  console.log(res);

    db.get(req.params.id, function(error, data){
      if (error){
        res.writeHead(404, {'content-type': 'text/plain'});
        res.end('Not Found');
        return;
      }
      res.setHeader('content-type', 'application/json');
        res.send(data);
    });
});

  app.listen(9999, function () {
    console.log('Example app listening on port 9999!');
  });

  module.exports = app;
