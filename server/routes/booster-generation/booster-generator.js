function getRandomIndex(length = 0) {
  return Math.floor(Math.random() * length);
}

const specialSets = [
  'grn',
  'rna',
  'jou',
  'dgm',
  'frf'
]
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
const colorMap = {
  W: 'white',
  U: 'blue',
  B: 'black',
  R: 'red',
  G: 'green'
};

function mapCard(card) {
  let description = card.oracle_text;
  if (card.card_faces) {
    description = card.card_faces.map(cardFace => cardFace.name + ' - ' + cardFace.oracle_text).join('<br/>');
  }
  return {
    id: card.id,
    name: card.name,
    description: description,
    imageUrl: card.image_uris.large,
    cmc: card.cmc,
    colors: card.colors.map(item => colorMap[item])
  };
}

function makePacks(cards, set, count, callback) {
  let boosters = [];
  if (specialSets.includes(set.toLowerCase())) {
    const setGenerator = require('./sets/' + set.toLowerCase());
    boosters = setGenerator.generatePacks(cards, count, lands, mapCard);
  } else {
    const commons = cards.filter(card => card.rarity === 'common');
    const uncommons = cards.filter(card => card.rarity === 'uncommon');
    let rares = cards.filter(card => card.rarity === 'rare');
    rares = rares.concat(rares);
    rares.concat(cards.filter(card => card.rarity === 'mythic'));

    while(boosters.length < count) {
      let booster = [];
      const isFoil = getRandomIndex(6) === 2;
      for(let i = 0; i < (isFoil ? 10 : 11); i++) {
        booster.push(commons[getRandomIndex(commons.length)]);
      }
      for(let i = 0; i < 3; i++) {
        booster.push(uncommons[getRandomIndex(uncommons.length)]);
      }
      booster.push(rares[getRandomIndex(rares.length)]);

      if (isFoil) {
        booster.push({
          ...cards[getRandomIndex(cards.length)],
          isFoil: true
        });
      }

      booster.push(lands[getRandomIndex(lands.length)]);
      boosters.push(booster.map(mapCard));
    }
  }
  callback(boosters);
}

function cardGrabber(request, url, set, count, callback, cards) {
  request.get({
    url: url,
    json: true,
    headers: { 'User-Agent': 'request' }
  }, (err, _, data) => {
    if (err) {
      throw err;
    }
    const newCards = cards.concat(data.data);
    if (data.has_more) {
      cardGrabber(request, data.next_page, set, count, callback, newCards)
    } else {
      makePacks(newCards, set, count, callback);
    }
  });
}

function generatePacks(request, setCode, count , callback) {
  cardGrabber(
    request,
    baseBoosterUrl.replace('{0}', setCode),
    setCode,
    count,
    callback,
    []
  );
}

exports.generatePacks = generatePacks;
