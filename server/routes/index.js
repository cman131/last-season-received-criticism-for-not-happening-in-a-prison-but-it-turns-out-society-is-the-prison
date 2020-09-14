const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const config = require('../config');
const request = require('request');

const TabletopGenerator = require('./tabletop-generator');
const BoosterGenerator = require('./booster-generation/booster-generator');

const requestQueue = [];
const tabletopRequestQueue = [];
let lock = false;
let tabletopLock = false;

const tabletopStateMap = ['Errored/NotStarted', 'Queued', 'Processing', 'Complete'];

let tabletopQueueFuncComplete = () => {
  tabletopLock = false;
  handleTabletopQueue();
};

let queueFuncComplete = () => {
  lock = false;
  handleQueue();
};

let handleQueue = (requestFunc, res) => {
  if (requestFunc) {
    requestQueue.push(requestFunc);
  }
  if (!lock && requestQueue.length > 0) {
    lock = true;
    let request = requestQueue[0];
    requestQueue.splice(0, 1);
    try {
      request();
    } catch (error) {
      if (res) {
        send(res);
      } else {
        queueFuncComplete();
      }
    }
  }
};

let handleTabletopQueue = (requestFunc) => {
  if (requestFunc) {
    tabletopRequestQueue.push(requestFunc);
  }
  if (!tabletopLock && tabletopRequestQueue.length > 0) {
    tabletopLock = true;
    let request = tabletopRequestQueue[0];
    tabletopRequestQueue.splice(0, 1);
    try {
      request();
    } catch (error) {
      tabletopQueueFuncComplete()
    }
  }
};

function send(res, status, data, errorMessage) {
  res.status(status || 500);
  res.send({ status: status || 500, errorMessage: errorMessage, data: data });
  queueFuncComplete();
}

function createGame(game, playerName, ip, res) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      database.close();
      throw err;
    } else {
      let code = new ObjectId();
      let playerId = new ObjectId();
      let db = database.db('draft');

      while (game.sets.length < 3) {
        game.sets.push(game.sets[game.sets.length - 1]);
      }
      if (game.sets.length > 3) {
        game.sets = [game.sets[0], game.sets[1], game.sets[2]];
      }

      game.sets.reverse();
      db.collection('games').insertOne({
        date: Date.now(),
        code: code,
        state: 0,
        maxPlayers: game.maxPlayers,
        sets: game.sets,
        players: [{
          id: playerId,
          name: game.name,
          ip: ip,
          currentPack: [],
          backupPacks: [],
          packQueue: [],
          cards: [],
          done: false,
          tabletopImages: {
            state: 0,
            links: []
          }
        }]
      }, (err) => {
        if (err) {
          send(res);
        } else {
          send(res, 200, { code: code, playerId: playerId });
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
      let playerId = new ObjectId();
      let db = database.db('draft');
      db.collection('games').find({
        code: new ObjectId(code)
      }).toArray((err, results) => {
        if (err) {
          send(res);
          database.close();
        } else if (results.length > 0) {
          let result = results[0];
          let match = result.players.filter((player) => player.name === playerName);
          if (match.length > 0) {
            if (match[0].ip === ip) {
              send(res, 200, { code: code, playerId: match[0].id });
            } else {
              send(res, 400, undefined, 'Name taken');
            }
            database.close();
          } else if (result.maxPlayers === result.players.length) {
            send(res, 400, undefined, 'Game is full');
            database.close();
          } else if (result.state === 1) {
            send(res, 400, undefined, 'Game already in progress');
            database.close();
          } else {
            db.collection('games').update({
              code: new ObjectId(code)
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
                  done: false,
                  tabletopImages: {
                    state: 0,
                    links: []
                  }
                }
              }
            }, (err) => {
              if (err) {
                send(res);
                database.close();
              } else {
                send(res, 200, { code: code, playerId: playerId });
                database.close();
                populatePacks(code, playerId, result.sets, result.fullCardPool, result.remainingCards);
              }
            });
          }
        } else {
          database.close();
          send(res, 404, undefined, 'Code not recognized.');
        }
      });
    }
  });
}

function startGame(code, res) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      throw err;
    } else {
      let db = database.db('draft');
      db.collection('games').update({
        code: new ObjectId(code)
      },
      {
        $set: {
          "state": 1
        }
      }, (err) => {
        if (err) {
          send(res);
        } else {
          send(res, 200);
        }
        database.close();
      });
    }
  });
}

function chooseCard(code, playerId, card, res) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      throw err;
    } else {
      let db = database.db('draft');
      db.collection('games').find({ code: new ObjectId(code) }).toArray((err, findResults) => {
        if (err) {
          send(res);
          database.close();
        } else if (findResults.length > 0) {
          let findResult = findResults[0];
          let modified = pickACard(playerId, card, findResult);
          db.collection('games').update({ code: new ObjectId(code) }, modified, (err) => {
            if (err) {
              send(res);
            } else {
              send(res, 200);
            }
            database.close();
          });
        } else {
          send(res, 404, undefined, 'Game not found');
          database.close();
        }
      });
    };
  });
}

function getGameConfig(code, playerId, res) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      throw err;
    } else {
      const db = database.db('draft');
      db.collection('games').find({ code: new ObjectId(code) }).toArray((err, results) => {
        if (err) {
          send(res);
          database.close();
          return;
        }
        if (results.length > 0) {
          let result = results[0];
          let playerMatch = result.players.filter(player => player.id.toString() === playerId.toString());
          if (playerMatch.length === 0) {
            send(res, 404, 'Game not found');
          } else {
            send(res, 200, {
              name: playerMatch[0].name,
              maxPlayers: result.maxPlayers,
              sets: result.sets,
              code: code,
              isPassingLeft: playerMatch[0].backupPacks.length !== 1,
              playerId: playerId,
              players: result.players.map(player => player.name),
              packsReady: result.players.filter(player => !player.currentPack || player.currentPack.length === 0).length === 0,
              cards: playerMatch[0].cards,
              currentPack: playerMatch[0].currentPack,
              state: result.state,
              done: playerMatch[0].done
            });
          }
          database.close();
        } else {
          send(res, 404, undefined, 'Game code not recognized.');
          database.close();
        }
      });
    }
  });
}

function populatePacks(code, playerId, sets, fullCardPool = undefined, remainingCards = undefined) {
  let boosters = [];
  let boosterFulfillment = (data) => {
    boosters = boosters.concat(data.boosters);
    if (boosters.length === 3) {
      handleQueue(() => {
        MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
          if (err) {
            throw err;
          }
          const db = database.db('draft');
          db.collection('games').find({ code: new ObjectId(code) }).toArray((err, results) => {
            if (err) {
              throw err;
            } else if (results.length > 0) {
              let result = results[0];
              let playerMatch = result.players.filter(plyr => plyr.id.toString() === playerId.toString());
              if (playerMatch.length > 0) {
                if (data.remainingCards) {
                  result.remainingCards = data.remainingCards;
                }
                if (data.fullCardPool && !result.fullCardPool) {
                  result.fullCardPool = data.fullCardPool;
                }
                let player = playerMatch[0];
                player.currentPack = boosters[0];
                boosters.splice(0, 1);
                player.backupPacks = boosters;
                db.collection('games').update({ code: new ObjectId(code) }, result, (err) => {
                  if (err) {
                    throw err;
                  }
                  database.close();
                  queueFuncComplete();
                });
              }
            } else {
              database.close();
              queueFuncComplete();
            }
          });
        });
      })
    }
  };

  if (sets[0].length > 3) {
    BoosterGenerator.generatePacks(MongoClient, config.dbUrl, request, sets[0], 3, boosterFulfillment, true, fullCardPool, remainingCards);
  } else {
    let setMap = {};
    for (let set of sets) {
      if (set in setMap) {
        setMap[set] += 1;
      } else {
        setMap[set] = 1;
      }
    }
    for (let set in setMap) {
      BoosterGenerator.generatePacks(MongoClient, config.dbUrl, request, set, setMap[set], boosterFulfillment, set.length > 3, fullCardPool, remainingCards);
    }
  }
}

function pickACard(playerId, card, game) {
  let player = game.players.filter(plyr => plyr.id.toString() === playerId.toString())[0];

  // fucked up with an additional request
  if (player.currentPack.filter(item => item.name === card.name).length === 0) {
    return game;
  }

  player.cards.push(card);
  player.currentPack = removeFirst(player.currentPack, (item) => item.name === card.name);

  let nextPlayerIndex;
  if (player.backupPacks.length === 1) {
    nextPlayerIndex = game.players.indexOf(player) - 1;
    nextPlayerIndex = nextPlayerIndex < 0 ? game.players.length - 1 : nextPlayerIndex;
  } else {
    nextPlayerIndex = game.players.indexOf(player) + 1;
    nextPlayerIndex = nextPlayerIndex > game.players.length - 1 ? 0 : nextPlayerIndex;
  }

  let nextPlayer = game.players[nextPlayerIndex];
  if (player.currentPack.length === 0) {
    if (player.backupPacks.length === 0) {
      player.done = true;
    } else {
      player.currentPack = player.backupPacks[0];
      player.backupPacks.splice(0, 1);
    }
  } else {
    if (nextPlayer.currentPack.length === 0) {
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

function getPlayer(code, playerId, callback, errCallback) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      throw err;
    } else {
      const db = database.db('draft');
      db.collection('games').find({ code: new ObjectId(code) }).toArray((err, results) => {
        if (err || results.length === 0) {
          errCallback({
            status: 400,
            errorMessage: 'Game not found.'
          });
          database.close();
          return;
        }

        let result = results[0];
        let playerMatch = result.players.filter(player => player.id.toString() === playerId.toString());
        database.close();
        if (playerMatch.length > 0) {
          callback(playerMatch[0]);
        } else {
          errCallback({
            status: 400,
            errorMessage: 'Player not found'
          });
        }
      });
    }
  });
}

function updatePlayer(playerId, code, playerModifier, callback) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      throw err;
    } else {
      const db = database.db('draft');
      db.collection('games').find({ code: new ObjectId(code) }).toArray((err, results) => {
        if (err || results.length === 0) {
          errCallback({
            status: 400,
            errorMessage: 'Game not found.'
          });
          database.close();
          return;
        }

        let result = results[0];
        let playerMatch = result.players.filter(matchplayer => matchplayer.id.toString() === playerId.toString());
        playerModifier(playerMatch[0]);
        db.collection('games').update({ code: new ObjectId(code) }, result, () => {
          database.close();
          callback();
        });
      });
    }
  });
}

function getDeck(deckId, callback, errCallback) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      errCallback({
        status: 500,
        error: err
      })
    } else {
      const db = database.db('draft');
      db.collection('decks').find({
        deckId: new ObjectId(deckId)
      }).toArray((err, results) => {
        if (err || results.length === 0) {
          database.close();
          errCallback({
            status: 400,
            errorMessage: 'Deck not found.'
          });
        } else {
          let result = results[0];
          database.close();
          callback(result);
        }
      });
    }
  });
}

function getDeckList(playerId, gameId, res) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      throw err;
    } else {
      const db = database.db('draft');
      db.collection('decks').find({
        gameId: new ObjectId(gameId),
        playerId: new ObjectId(playerId)
      }).toArray((err, results) => {
        if (err || results.length === 0) {
          database.close();
          res.status(400);
          res.send({
            status: 400,
            errorMessage: 'Deck not found.'
          });
        } else {
          database.close();
          res.status(200);
          res.send({
            status: 200,
            data: results.map(deck => ({
              gameId: deck.gameId,
              playerId: deck.playerId,
              deckId: deck.deckId,
              name: deck.name
            }))
          })
        }
      });
    }
  });
}

function createDeck(playerIdentifier, gameIdentifier, deck, res) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      database.close();
      throw err;
    } else {
      let gameId = new ObjectId(gameIdentifier);
      let playerId = new ObjectId(playerIdentifier);
      let deckId = new ObjectId();
      let db = database.db('draft');

      db.collection('decks').insertOne({
        deckId: deckId,
        gameId: gameId,
        playerId: playerId,
        dateCreated: Date.now(),
        dateModified: Date.now(),
        name: deck.name,
        mainBoard: deck.mainBoard,
        sideBoard: deck.sideBoard,
        tabletopImages: {
          state: 0,
          links: []
        }
      }, (err) => {
        if (err) {
          res.status(500);
          res.send({ status: 500 });
        } else {
          res.status(200);
          res.send({
            status: 200,
            data: {
              gameId: gameId,
              playerId: playerId,
              deckId: deckId
            }
          });
        }
        database.close();
      });
    }
  });
}

function updateDeck(deckId, deckModifier, callback, errCallback) {
  getDeck(deckId, (deck) => {
    MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
      if (err) {
        errCallback();
      } else {
        const db = database.db('draft');

        deckModifier(deck);
        db.collection('decks').update({ deckId: new ObjectId(deckId) }, deck, () => {
          database.close();
          callback();
        });
      }
    });
  }, errCallback)
}

function getCubes(callback, errCallback) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      errCallback({
        status: 500,
        error: err
      })
    } else {
      const db = database.db('draft');
      db.collection('cubes')
        .find({})
        .toArray((err, results) => {
          if (err) {
            database.close();
            errCallback({
              status: 500,
              error: err
            });
          } else {
            database.close();
            callback(results);
          }
      });
    }
  });
}

function createCube(cubeName, cardNames, res) {
  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      database.close();
      throw err;
    } else {
      let cubeId = new ObjectId();
      let db = database.db('draft');

      db.collection('cubes').insertOne({
        cubeId: cubeId,
        dateCreated: Date.now(),
        dateModified: Date.now(),
        name: cubeName,
        cardNames: cardNames
      }, (err) => {
        if (err) {
          res.status(500);
          res.send({ status: 500 });
        } else {
          res.status(200);
          res.send({
            status: 200,
            data: {
              cubeId: cubeId
            }
          });
        }
        database.close();
      });
    }
  });
}

// Create game
router.post('/game', (req, res) => {
  handleQueue(() => {
    createGame(req.body, req.body.playerName, req.ip, res);
  }, res);
});

// Join game
router.post('/game/:gameId/player', (req, res) => {
  handleQueue(() => {
    joinGame(req.params.gameId, req.body.name, req.ip, res);
  }, res);
});

// Start game
router.put('/game/:gameId', (req, res) => {
  handleQueue(() => {
    startGame(req.params.gameId, res);
  }, res);
});

// end game
router.post('/game/:gameId/player/:playerId/endgame', (req, res) => {
  const code = req.params.gameId;
  const playerId = req.params.playerId;

  MongoClient.connect(config.dbUrl, { useNewUrlParser: true }, (err, database) => {
    if (err) {
      throw err;
    } else {
      let db = database.db('draft');
      db.collection('games').find({ code: new ObjectId(code) }).toArray((err, findResults) => {
        if (err) {
          send(res);
          database.close();
        } else if (findResults.length > 0) {
          let findResult = findResults[0];
          let player = findResult.players.filter(plyr => plyr.id.toString() === playerId.toString())[0];
          player.done = true;
          player.currentPack = [];
          player.packQueue = [];
          db.collection('games').update({ code: new ObjectId(code) }, findResult, (err) => {
            if (err) {
              send(res);
            } else {
              send(res, 200);
            }
            database.close();
          });
        } else {
          send(res, 404, undefined, 'Game not found');
          database.close();
        }
      });
    };
  });
});

// Choose card
router.post('/game/:gameId/player/:playerId', (req, res) => {
  handleQueue(() => {
    chooseCard(req.params.gameId, req.params.playerId, req.body.card, res);
  }, res);
});

router.get('/game/:gameId/player/:playerId/cards/tabletop', (req, res) => {
  let code = req.params.gameId;
  let playerId = req.params.playerId;
  getPlayer(code, playerId, (player) => {
    if (player.tabletopImages.state < 1) {
      handleQueue(() => {
        updatePlayer(player.id, code, (match) => {
          match.tabletopImages.state = 1;
        }, queueFuncComplete);
      });
      res.status(200);
      res.send({ status: 200, state: tabletopStateMap[1], isProcessing: true });

      handleTabletopQueue(() => {
        handleQueue(() => {
          updatePlayer(player.id, code, (match) => {
            match.tabletopImages.state = 2;
          }, queueFuncComplete);
        });
        TabletopGenerator.generateTabletopImages(
          player.cards,
          true,
          (links, error) => {
            handleQueue(() => {
              updatePlayer(player.id, code, (match) => {
                if (error) {
                  match.tabletopImages.state = -1;
                } else {
                  match.tabletopImages.links = links;
                  match.tabletopImages.state = 3;
                }
              }, queueFuncComplete);
            });
            tabletopQueueFuncComplete()
        });
      });
    } else if (player.tabletopImages.state < 3) {
      res.status(200);
      res.send({ status: 200, state: tabletopStateMap[player.tabletopImages.state], isProcessing: true });
    } else {
      res.status(200);
      res.send( {
        status: 200,
        state: tabletopStateMap[player.tabletopImages.state],
        isProcessing: false,
        data: TabletopGenerator.getTabletopJson(
          'Draft pool',
          'Cards from a recent draft',
          player.cards,
          player.tabletopImages.links,
          true
        )
      });
    }
  }, (errResponse) => {
    res.status(errResponse.status);
    res.send(errResponse);
  });
});

// Get game state/config
router.get('/game/:gameId/player/:playerId', (req, res) => {
  handleQueue(() => {
    getGameConfig(req.params.gameId, req.params.playerId, res);
  }, res);
});

// Get decklist
router.get('/player/:playerId/game/:gameId/decklist', (req, res) => {
  getDeckList(req.params.playerId, req.params.gameId, res);
});

// Get deck
router.get('/player/:playerId/game/:gameId/deck/:deckId', (req, res) => {
  getDeck(req.params.deckId, (deck) => {
    res.status(200);
    res.send({ data: deck });
  }, (err) => {
    res.status(err.status);
    res.send(err);
  });
});

// Create deck
router.post('/player/:playerId/game/:gameId/deck', (req, res) => {
  createDeck(req.params.playerId, req.params.gameId, req.body, res);
});

// Update deck
router.put('/player/:playerId/game/:gameId/deck/:deckId', (req, res) => {
  const deckId = req.params.deckId;
  const gameId = req.params.gameId;
  const playerId = req.params.playerId;
  const deck = req.body;
  updateDeck(deckId, (dbDeck) => {
    dbDeck.dateModified = Date.now();
    dbDeck.name = deck.name;
    dbDeck.mainBoard = deck.mainBoard;
    dbDeck.sideBoard = deck.sideBoard;
    dbDeck.tabletopImages = {
      state: 0,
      links: []
    };
  }, () => {
    res.status(200);
    res.send({
      status: 200,
      data: {
        gameId: gameId,
        playerId: playerId,
        deckId: deckId
      }
    });
  }, (err) => {
    res.status(err.status || 500);
    res.send(err);
  });
});

// Tabletop deck
router.get('/game/:gameId/player/:playerId/deck/:deckId/tabletop', (req, res) => {
  let deckId = req.params.deckId;
  getDeck(deckId, (deck) => {
    if (deck.tabletopImages.state < 1) {
      updateDeck(deckId, (match) => {
        match.tabletopImages.state = 1;
      }, () => {});
      res.status(200);
      res.send({ status: 200, state: tabletopStateMap[1], isProcessing: true });

      handleTabletopQueue(() => {
        updateDeck(deckId, (match) => {
          match.tabletopImages.state = 2;
        }, () => {
          TabletopGenerator.generateTabletopImages(
            deck.mainBoard,
            false,
            (links, error) => {
              updateDeck(deckId, (match) => {
                if (error) {
                  match.tabletopImages.state = -1;
                } else {
                  match.tabletopImages.links = links;
                  match.tabletopImages.state = 3;
                }
              }, () => {});
              tabletopQueueFuncComplete()
          });
        });
      });
    } else if (deck.tabletopImages.state < 3) {
      res.status(200);
      res.send({ status: 200, state: tabletopStateMap[deck.tabletopImages.state], isProcessing: true });
    } else {
      res.status(200);
      res.send({
        status: 200,
        state: tabletopStateMap[deck.tabletopImages.state],
        isProcessing: false,
        data: TabletopGenerator.getTabletopJson(
          deck.name,
          'A deck from a recent draft',
          deck.mainBoard,
          deck.tabletopImages.links,
          false
        )
      });
    }
  }, (errResponse) => {
    res.status(errResponse.status);
    res.send(errResponse);
  });
});

// Get cubes
router.get('/cubes', (_, res) => {
  getCubes((cubes) => {
    res.status(200);
    res.send({ data: cubes });
  }, (err) => {
    res.status(err.status);
    res.send(err);
  });
});

// Create cube
router.post('/cubes', (req, res) => {
  createCube(req.body.name, req.body.cardNames, res);
});

router.get('/testpack/:setId/:count', (req, res) => {
  try {
    if (!req.params.setId || req.params.setId.length < 3) {
      res.status(400);
      res.send({ message: 'No. Bad input, bruh.', setId: req.params.setId });
    } else {
      let count = 1;
      if (req.params.count) {
        count = parseInt(req.params.count);
      }
      BoosterGenerator.generatePacks(MongoClient, config.dbUrl, request, req.params.setId, count, (packs) => {
        res.status(200);
        res.send({ data: packs.map(pack => pack.map(card => card.name)) });
      }, !!req.query.cube);
    }
  } catch(e) {
    console.log(e);
    throw e;
  }
});

// Home to test that we're running
router.get('/', (req, res) => {
  res.status(200);
  res.send({status: 200, message: 'banana'});
});

module.exports = router;
