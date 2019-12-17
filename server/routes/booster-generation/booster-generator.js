const Utility = require('./utility');
const specialSetList = require('./sets/special-set-list').specialSetList;
const fs = require('fs');

const lands = [
  {
    id: '58fe058d-7796-4233-8d74-2a12f9bd0023',
    colors: [],
    cmc: 0,
    name: 'Forest',
    oracle_text: '({T}: Add {G}.)',
    image_uris: {
      large: 'https://img.scryfall.com/cards/large/front/5/8/58fe058d-7796-4233-8d74-2a12f9bd0023.jpg?1543675077'
    }
  },
  {
    id: '0ba8851d-0b25-4232-acd3-594b5b25f16e',
    colors: [],
    cmc: 0,
    name: 'Island',
    oracle_text: '({T}: Add {U}.)',
    image_uris: {
      large: 'https://img.scryfall.com/cards/large/front/0/b/0ba8851d-0b25-4232-acd3-594b5b25f16e.jpg?1543675020'
    }
  },
  {
    id: '49ac3fd1-f732-4d96-ac93-560e4e86051e',
    colors: [],
    cmc: 0,
    name: 'Mountain',
    oracle_text: '({T}: Add {R}.)',
    image_uris: {
      large: 'https://img.scryfall.com/cards/large/front/4/9/49ac3fd1-f732-4d96-ac93-560e4e86051e.jpg?1543675054'
    }
  },
  {
    id: '8bc682cd-b13b-4670-913c-70542f161316',
    colors: [],
    cmc: 0,
    oracle_text: '({T}: Add {B}.)',
    name: 'Swamp',
    image_uris: {
      large: 'https://img.scryfall.com/cards/large/front/8/b/8bc682cd-b13b-4670-913c-70542f161316.jpg?1543675036'
    }
  },
  {
    id: 'feada93b-aabf-45d6-ac46-98b33caf9112',
    colors: [],
    cmc: 0,
    oracle_text: '({T}: Add {W}.)',
    name: 'Plains',
    image_uris: {
      large: 'https://img.scryfall.com/cards/large/front/f/e/feada93b-aabf-45d6-ac46-98b33caf9112.jpg?1543675002'
    }
  }
];

const baseBoosterUrl = 'https://api.scryfall.com/cards/search?order=set&q=set%3A{0}+unique%3Acards+is%3Abooster+-type%3Abasic&unique=cards&is=booster';
const baseCollectionUrl = 'https://api.scryfall.com/cards/collection';

function makePacks(cards, set, count, callback) {
  let boosters = [];
  if (specialSetList.includes(set.toLowerCase())) {
    const setGenerator = require('./sets/' + set.toLowerCase());
    boosters = setGenerator.generatePacks(cards, count, lands);
  } else {
    boosters = Utility.makeGenericPacks(cards, count, lands);
  }

  callback(boosters.map(pack => pack.map(Utility.mapCard)));
}

function makeCubePacks(cards, count, callback) {
  const boosters = Utility.makeTrulyRandomPack(cards, count, lands);
  callback(boosters.map(pack => pack.map(Utility.mapCard)));
}

function cardGrabber(request, url, set, count, callback, cards, retryCount = 0) {
  request.get({
    url: url,
    json: true,
    headers: { 'User-Agent': 'request' }
  }, (err, _, data) => {
    if ((err || data.status >= 400) && retryCount < 10) {
      console.log(url);
      console.log(err || data);
      cardGrabber(request, url, set, count, callback, cards, retryCount + 1);
    } else if (err || data.status >= 400) {
      throw err;
    } else {
      const newCards = cards.concat(data.data);
      if (data.has_more) {
        cardGrabber(request, data.next_page, set, count, callback, newCards)
      } else {
        makePacks(newCards, set, count, callback);
      }
    }
  });
}

function cubeGrabber(request, count, callback, cards, remainingChunks = []) {
  if (remainingChunks.length > 0) {
    const currentChunk = remainingChunks.pop();
    request.post({
      url: baseCollectionUrl,
      json: true,
      headers: { 'Content-Type': 'application/json' },
      body: {
        identifiers: currentChunk.map(cardName => ({ name: cardName }))
      }
    }, (err, _, data) => {
      if (err || data.status >= 400) {
        console.log(err || data);
        throw err;
      } else {
        const newCards = cards.concat(data.data);
        cubeGrabber(request, count, callback, newCards, remainingChunks);
      }
    });
  } else {
    makeCubePacks(cards, count, callback);
  }
}

function generatePacks(request, setCode, count, callback, isCube = false) {
  if (!isCube) {
    cardGrabber(
      request,
      baseBoosterUrl.replace('{0}', setCode),
      setCode,
      count,
      callback,
      []
    );
  } else {
    let cube = require('./cubes/' + setCode.toLowerCase());
    cubeGrabber(
      request,
      count,
      callback,
      [],
      Utility.makeChunks(cube.cardNames, 70)
    )
  }
}

exports.generatePacks = generatePacks;
