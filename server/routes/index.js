const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const config = require('../config');
const request = require('request');
let baseBoosterUrl = 'https://api.magicthegathering.io/v1/sets/{0}/booster';

function createGame(game, playerName, ip, res) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      database.close();
      throw err;
    } else {
      let code = ObjectId();
      let playerId = ObjectId();
      let db = database('draft');

      db.collection('games').insertOne({
        code: code,
        state: 0,
        maxPlayers: game.maxPlayers,
        sets: game.sets,
        players: [{
          id: playerId,
          name: playerName,
          ip: ip,
          currentPack: [],
          backupPacks: [],
          packQueue: [],
          cards: [],
          done: false
        }]
      }, (err) => {
        if (err) {
          res.send({ status: 500 });
        } else {
          res.send({ status: 200, code: code, playerId: playerId });
          populatePacks(code, playerId, game.sets);
        }
        database.close();
      });
    }
  });
}

function joinGame(code, playerName, ip, res) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      throw err;
    } else {
      let playerId = ObjectId();
      let db = database.db('draft');
      db.collection('games').find({
        code: code
      }).toArray((err, results) => {
        if (err) {
          res.send({ status: 500 });
          database.close();
        } else if (results.length > 0) {
          let result = results[0];
          let match = result.players.filter(player => player.name === playerName);
          if (match.length > 0) {
            if (match[0].ip === ip) {
              res.send({ status: 200, code: code, playerId: match[0].id });
            } else {
              res.send({ status: 400, errorMessage: 'Name taken' });
            }
            database.close();
          } else if (result.maxPlayers === result.players.length) {
            res.send({ status: 400, errorMessage: 'Game is full' });
            database.close();
          } else {
            db.collection('games').update({
              code: code
            },
            {
              $addToSet: {
                "players": {
                  id: playerId,
                  name: playerName,
                  ip: ip,
                  currentPack: [],
                  backupPacks: [],
                  packQueue: [],
                  cards: [],
                  done: false
                }
              }
            }, (err) => {
              if (err) {
                res.send({ status: 500 });
                database.close();
              } else {
                res.send({ status: 200, code: code, playerId: playerId });
                database.close();
                populatePacks(code, playerId, game.sets);
              }
            });
          }
        } else {
          database.close();
          res.send({ status: 404, errorMessage: 'Code not recognized.' });
        }
      });
    }
  });
}

function startGame(code, res) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, function(err, database) {
    if (err) {
      throw err;
    } else {
      let db = database.db('draft');
      db.collection('games').update({
        code: code
      },
      {
        $set: {
          "status": 1
        }
      }, function(err) {
        if (err) {
          res.send({ status: 500 });
        } else {
          res.send({ status: 200 });
        }
        database.close();
      });
    }
  });
}

function chooseCard(code, playerId, card, res) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, function(err, database) {
    if (err) {
      throw err;
    } else {
      let db = database.db('draft');
      db.collection('games').find({ code: code }).toArray((err, findResults) => {
        if (err) {
          res.send({ status: 500 });
          database.close();
        } else if (findResults.length > 0) {
          let findResult = findResults[0];
          let modified = pickACard(playerId, card, findResult);
          db.collection('games').update({ code: code }, modified, function(err) {
            if (err) {
              res.send({ status: 500 });
            } else {
              res.send({ status: 200 });
            }
            database.close();
          });
        } else {
          res.send({ status: 404 });
          database.close();
        }
      });
    };
  });
}

function getGameConfig(code, playerId, res) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, function(err, database) {
    if (err) {
      throw err;
    } else {
      const db = database.db('draft');
      db.collection('games').find({ code: code }).toArray(function(err, results) {
        if (err) {
          res.send({ status: 500 });
          database.close();
          return;
        }
        let result = results[0];
        let playerMatch = result.players.filter(player => player.id === playerId);
        if (playerMatch.length === 0) {
          res.send({ status: 404 });
        } else {
          res.send({ status: 200, data: {
            name: playerMatch[0].name,
            numberOfPlayers: result.maxPlayers,
            sets: result.sets,
            code: code,
            playerId: playerId,
            players: result.players.map(player => player.name),
            cards: playerMatch[0].cards,
            currentPack: playerMatch[0].currentPack,
            status: result.status,
            done: playerMatch[0].done
          }});
        }
        database.close();
      });
    }
  });
}

function populatePacks(code, playerId, sets) {
  let boosters = [];
  let boosterFulfillment = (data) => {
    boosters.push(data.cards.map(item => item.name));
    if (boosters.length === 3) {
      MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
        if (err) {
          throw err;
        }
        const db = database.db('draft');
        db.collection('games').find({ code: code }).toArray((err, results) => {
          if (err) {
            throw err;
          } else if (results.length > 0) {
            let result = results[0];
            let player = result.players.filter(plyr => plyr.id === playerId);
            player.currentPack = boosters[0];
            boosters.splice(0, 1);
            player.backupPacks = boosters;
            db.collection('games').update({ code: code }, result, (err) => {
              if (err) {
                throw err;
              }
              database.close();
            });
          }
        });
        database.close();
      });
    }
  };

  for (let set of sets) {
    request.get({
      url: baseBoosterUrl.replace('{0}', set),
      json: true,
      headers: { 'User-Agent': 'request' }
    }, (err, response, data) => {
      if (err) {
        throw err;
      }
      boosterFulfillment(data);
    });
  }
}

function pickACard(playerId, card, game) {
  let player = game.players.filter(plyr => plyr.id === playerId)[0];
  player.cards.push(card);
  player.currentPack = removeFirst(player.currentPack, (item) => item.id === card.id);

  let nextPlayerIndex = game.players.indexOf(player) + 1;
  nextPlayerIndex = nextPlayerIndex > game.players.length - 1 ? 0 : nextPlayerIndex;

  let nextPlayer = games.players[nextPlayerIndex];

  if (player.currentPack.length === 0) {
    if (player.backupPacks.length === 0) {
      player.done = true;
    } else {
      player.currentPack = player.backupPacks[0];
      player.backupPacks.splice(0, 1);
    }
  } else {
    if (nextPlayer.currentPack.length = 0) {
      nextPlayer.currentPack = player.currentPack;
    } else {
      nextPlayer.packQueue.push(player.currentPack);
    }

    player.currentPack = [];
    if (player.packQueue.length > 0) {
      player.currentPack = player.packQueue[0];
      player.packQueue.splice(0, 1);
    }
  }
  return game;
}

function removeFirst(arr, checkFunc) {
  for (let i = 0; i < arr.length; i++) {
    if (checkFunc(arr[i])) {
      arr.splice(i, 1);
      return arr;
    }
  }
  return arr;
}

// Create game
router.post('/game', function(req, res) {
  createGame(req.body, req.body.playerName, req.ip, res);
});

// Join game
router.post('/game/:gameId/player', function(req, res) {
  joinGame(req.params.gameId, req.body.playerName, req.ip, res);
});

// Start game
router.put('/game/:gameId', function(req, res) {
  startGame(req.params.gameId, res);
});

// Choose card
router.post('/game/:gameId/player/:playerId', function(req, res) {
  chooseCard(req.params.gameId, req.params.playerId, req.body.card, res);
})

// Get game state/config
router.get('/game/:gameId/player/:playerId', function(req, res) {
  getGameConfig(req.params.gameId, req.params.playerId, res);
});

module.exports = router;
