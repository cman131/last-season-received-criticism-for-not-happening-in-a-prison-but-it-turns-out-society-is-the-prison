function getRandomIndex(length = 0) {
  return Math.floor(Math.random() * length);
}

function generatePacks(cards, count, lands, mapCard) {
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
    const isFoil = getRandomIndex(6) === 2;
    const isRareTransform = getRandomIndex(8) === 2;

    const commonCount = 10 + (isFoil ? -1 : 0) + (isRareTransform ? -1 : 0);
    for(let i = 0; i < commonCount; i++) {
      booster.push(commons[getRandomIndex(commons.length)]);
    }

    for(let i = 0; i < 3; i++) {
      booster.push(uncommons[getRandomIndex(uncommons.length)]);
    }

    booster.push(rares[getRandomIndex(rares.length)]);
    booster.push(nonRareTransform[getRandomIndex(nonRareTransform.length)]);

    if (isRareTransform) {
      booster.push(rareTransform[getRandomIndex(rareTransform.length)]);
    }

    if (isFoil) {
      booster.push({
        ...cards[getRandomIndex(cards.length)],
        isFoil: true
      });
    }

    booster.push(lands[getRandomIndex(lands.length)]);

    boosters.push(booster.map(mapCard));
  }
  return boosters;
}

exports.generatePacks = generatePacks;
