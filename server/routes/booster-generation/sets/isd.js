const Utility = require('../utility');

function generatePacks(cards, count, lands) {
  const boosters = [];

  const transformCards = cards.filter(card => card.card_faces && card.card_faces.length > 1);
  const commons = cards.filter(card => card.rarity === 'common');
  const uncommons = cards.filter(card => card.rarity === 'uncommon');

  let rares = cards.filter(card => card.rarity === 'rare');
  rares = rares.concat(rares);
  rares.concat(cards.filter(card => card.rarity === 'mythic'));

  while(boosters.length < count) {
    let booster = [];
    const isFoil = Utility.getRandomIndex(6) === 2;

    for(let i = 0; i < (isFoil ? 9 : 10); i++) {
      booster.push(Utility.getRandomCard(commons, booster));
    }

    for(let i = 0; i < 3; i++) {
      booster.push(Utility.getRandomCard(uncommons, booster));
    }

    booster.push(Utility.getRandomCard(rares, booster));
    if (isFoil) {
      booster.push({
        ...Utility.getRandomCard(cards, booster, false),
        isFoil: true
      });
    }
    booster.push(Utility.getRandomCard(transformCards, booster));
    booster.push(Utility.getRandomCard(lands, booster, false));

    boosters.push(booster);
  }
  return boosters;
}

exports.generatePacks = generatePacks;
