var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/game/:gameId/player/:playerId', function(req, res) {
  res.send(req.params);
});

module.exports = router;
