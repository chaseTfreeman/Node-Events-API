## Thank you for your time & consideration
# Notes/Bugs:
Please accept my apologies, I wish it were better and passing all of the tests. That said, I am proud of my work and most of the API is completed.

I'm not sure at what point the test suite stopped working but at the point it was too late to go back for me. I was modeling my code off of the expected results of the tests but I began recieving this error:  
-For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves.
I'm not familiar with Mocha/Chai more than what I found online to assist in my understanding of the expectations so continued on anyway.

Some bugs:

* GET/event/:id 404 error bug - Was working, need to figure out what happened

* Id's in LevelDB? Hardcoded them all.

* PUT /event/:id - Need to target Value store so it doesn't UPDATE the whole Key:Value that includes multiple events, thus erasing one.. uh oh!

* GET /secrets - user name is: user & the password is: password - you'll need to input those in the Command-line. In the wild I would encode the PW in a hash.

# INSTRUCTIONS (if not using POSTMAN)
1. npm install
2. npm start
3. Open new terminal window and run:
4. NOTE: for /secrets, please input credentials in server window.


- $ curl http://localhost:9999/ - See the "/" route, API name, version, status.
- $ curl -X POST http://localhost:9999/events - See the POST request for two events to    /events
- $ curl GET http://localhost:9999/events - See all events (two) that have been posted
- $ curl GET http://localhost:9999/events/5297c1e0-8017-4126-bac9-3ce5c2c8f00a - See the specifics of each event
- $ curl GET http://localhost:9999/events/e78bcdd7-960e-4e1e-b05e-fbeade8b505d - See the specifics of each event
- $ curl -X DELETE http://localhost:9999/events/e78bcdd7-960e-4e1e-b05e-fbeade8b505d - to delete an event
- $ curl -X PUT http://localhost:9999/events/5297c1e0-8017-4126-bac9-3ce5c2c8f00a - To update/change the last remaining event to "maybe another time", and change its ID, etc
- $ curl GET http://localhost:9999/events - to circle back and view ALL events and how they've changed
- $ curl GET http://localhost:9999/secrets - You'll need to go to the server window to input the credentials:
  --- username is: user & Password is: password (no caps)
