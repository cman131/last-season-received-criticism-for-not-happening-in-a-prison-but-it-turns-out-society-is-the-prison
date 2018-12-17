var MongoClient = require('mongodb').MongoClient;
var database = undefined;
var config = require('config');
MongoClient.connect(config.dbUrl, function(err, db) {
  if (err) {
    throw err;
  } else {
    database = db;
    console.log('MongoDB connection successful');
  }
});

