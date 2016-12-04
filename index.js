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

db.put('data',
{
  "name": "Test",
  "start": "2016-10-30T20:44:49.100Z",
  "end": "2016-10-30T20:44:49.100Z",
  "eventId": "111111-111111"
}
);

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
    console.log(data);
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

  //GET /events/:event_id
  // Should return json for a specific event.
  // Get the id from the url, then run db.get on levelDB's to query all of
  // the "data" keys for any key:value pair that has the same value as the req.params.event_id
  app.get('/events/:event_id', function(req, res){

    db.get('data', function(error, data){
      if (error){
        res.writeHead(404, {'content-type': 'text/plain'});
        res.end('Not Found')
        return;
      }
      db.createReadStream()
      .on('data', function(data){
        if (data.value.eventId.toString() == req.params.event_id ){
          res.setHeader('content-type', 'application/json');
          res.send(data.value)}
          else if (data.value.eventId.toString() != req.params.event_id ) {
            res.status(404).end('Not Found')
            return;
          }
        })
      });
    });

    // POST /events/:event_id
    app.post('/events/:event_id', function(req, res){
      console.log('adding new event with eventID =' + req.params.event_id);
      var format =

      // var options = {
      //   type          : 'put'
      //   , key           : 'data'
      //   , value         : format
      //     , keyEncoding   : 'binary'
      //     , valueEncoding : 'json'
      //   }
        db.put('data', {
          "name": "Interview for sweet dev job",
          "start": "2016-10-30T20:44:49.100",
          "end": "2016-10-30T20:44:49.100Z",
          "eventId": req.params.event_id}, function(error){
          if (error){
            res.writeHead(500,{'content-type': 'text/plain'});
            res.end('Internal Server Error');
            return;
          }
          res.send(req.params.event_id + 'succesfully inserted');
        });
      });
// DELETE /events/:event_id
      app.delete('/events/:event_id', function(req, res){
        // console.log('Deleting event with EventID = ' + req.params.event_id);
        db.del('data', function(error){
          if (error){
            res.writeHead(500,{
              'content-type': 'text/plain'
            });
            res.end('Internal Server Error');
            return;
          }
          db.createReadStream()
          .on('data', function(data){
            if (data.value.eventId.toString() == req.params.event_id ){
              res.setHeader('content-type', 'application/json');
              res.send(data)}
              else if (data.value.eventId.toString() != req.params.event_id ) {
                res.status(404).end('Not Found')
                return;
              }
            })
          res.end(req.params.event_id + 'succesfully deleted');
        });
      });
      // Port 9999
      app.listen(9999, function () {
        console.log('Example app listening on port 9999!');
      });

      module.exports = app;
