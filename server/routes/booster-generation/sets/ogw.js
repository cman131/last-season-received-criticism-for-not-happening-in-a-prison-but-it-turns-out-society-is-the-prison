const wastesCard = {
  "id": "9cc070d3-4b83-4684-9caf-063e5c473a77",
  "name": "Wastes",
  "image_uris": {
    "large": "https://img.scryfall.com/cards/large/front/9/c/9cc070d3-4b83-4684-9caf-063e5c473a77.jpg?1562926596"
  },
  "cmc": 0,
  "oracle_text": "{T}: Add {C}.",
  "colors": []
};

function getRandomIndex(length = 0) {
  return Math.floor(Math.random() * length);
}

function generatePacks(cards, count, _, mapCard) {
  const boosters = [];

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
    booster.push(wastesCard);

    boosters.push(booster.map(mapCard));
  }
  return boosters;
}

exports.generatePacks = generatePacks;
