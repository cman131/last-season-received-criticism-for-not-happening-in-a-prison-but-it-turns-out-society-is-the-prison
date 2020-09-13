const Utility = require('../utility');

function generatePacks(cards, count, lands) {
  const boosters = [];

  const transformCards = cards.filter(card => card.card_faces && card.card_faces.length > 1);
  const commons = cards.filter(card => card.rarity === 'common');
  const uncommons = cards.filter(card => card.rarity === 'uncommon');

  const nonRareTransform = transformCards.filter(card => card.rarity === 'common' || card.rarity === 'uncommon');
  const rareTransform = transformCards.filter(card => card.rarity !== 'common' && card.rarity !== 'uncommon');

  let rares = cards.filter(card => card.rarity === 'rare');
  rares = rares.concat(rares);
  rares.concat(cards.filter(card => card.rarity === 'mythic'));

  while(boosters.length < count) {
    let booster = [];
    const isFoil = Utility.getRandomIndex(6) === 2;
    const isRareTransform = Utility.getRandomIndex(8) === 2;

    const commonCount = 10 + (isFoil ? -1 : 0) + (isRareTransform ? -1 : 0);
    for(let i = 0; i < commonCount; i++) {
      booster.push(Utility.getRandomCard(commons, booster));
    }

    for(let i = 0; i < 3; i++) {
      booster.push(Utility.getRandomCard(uncommons, booster));
    }

    booster.push(Utility.getRandomCard(rares, booster));
    booster.push(Utility.getRandomCard(nonRareTransform, booster));

    if (isRareTransform) {
      booster.push(Utility.getRandomCard(rareTransform, booster));
    }

    if (isFoil) {
      booster.push({
        ...Utility.getRarityWeightedRandomCard(cards, booster, false),
        isFoil: true
      });
    }

    booster.push(Utility.getRandomCard(lands, booster, false));
    boosters.push(booster);
  }
  return boosters;
}

exports.generatePacks = generatePacks;
