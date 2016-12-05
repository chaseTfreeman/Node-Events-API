var express = require('express')
, hhtp = require('http')
, bodyParser = require('body-parser')
, path = require('path')
, methodOverride = require('method-override')
, errorHandler = require('error-handler')
, levelup = require('levelup');
var prompt = require('prompt');
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
  "name": "Interview for sweet dev job",
  "start": "2016-10-30T20:44:49.100Z",
  "end": "2016-10-30T20:44:49.100Z",
  "eventId": "111111-111111"
}
);


app.get('/secrets',function(req, res){
  var properties = [
    {
      name: 'username',
      validator: /^[a-zA-Z\s\-]+$/,
      warning: 'Username must be only letters, spaces, or dashes'
    },
    {
      name: 'password',
      hidden: true
    }
  ];

  prompt.start();

  prompt.get(properties, function (err, result) {
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log('  Username: ' + result.username);
    console.log('  Password: ' + result.password);
    if (result.username == "user" && result.password == "password"){
      res.send(
        {
          "secrets": [
            "The answer is 42."
          ]
        }
      )
    }
  });

  function onErr(err) {
    console.log(err);
    return 1;
  }

}
);
// *********************
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
    //
    // if (is_first == true){
    //   res.write('[');
    // }
    // else {
    //   res.write(',');
    // }
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
      res.end();
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
      db.createValueStream()
      .on('data', function(data){
        for (i = 0; i < data.length; i++){
          if (data[i].eventId.toString() == req.params.event_id){
            res.setHeader('content-type', 'application/json');
            res.send(data[i])
          }
        }
      })
    });
  });

  // POST /events/:event_id
  // app.post('/events/:event_id', function(req, res){
  //   console.log('adding new event with eventID =' + req.params.event_id);
  //
  //   db.put('data', {
  //     "name": "Interview for sweet dev job",
  //     "start": "2016-10-30T20:44:49.100",
  //     "end": "2016-10-30T20:44:49.100Z",
  //     "eventId": req.params.event_id}, function(error){
  //       if (error){
  //         res.writeHead(500,{'content-type': 'text/plain'});
  //         res.end('Internal Server Error');
  //         return;
  //       }
  //       res.send(req.params.event_id + 'succesfully inserted');
  //     });
  //   });

  // POST EVENTS(Multiple)-try using batch posts
  // POST /events
  app.post('/events', function(req, res){
    var ops = [
      { type: 'put', key: 'data', value:[
        {
          "name": "Interview for sweet dev job",
          "start": "2016-10-30T20:44:49.100Z",
          "end": "2016-10-30T20:44:49.100Z",
          "eventId": "5297c1e0-8017-4126-bac9-3ce5c2c8f00a"
        },
        {
          "name": "Another event",
          "start": "2016-10-25T20:44:49.100Z",
          "end": "2016-10-25T20:44:49.100Z",
          "eventId": "e78bcdd7-960e-4e1e-b05e-fbeade8b505d"
        }
      ]
    }
  ]
  db.batch(ops, function (err, res) {
    if (err) return console.log('Ooops!', err)
  })
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
