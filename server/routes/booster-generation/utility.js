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
    imageUrl: card.image_uris ? card.image_uris.large : card.card_faces[0].image_uris.large,
    backImageUrl: card.card_faces && card.card_faces.length > 1 ? card.card_faces[1].image_uris.large : undefined,
    cmc: card.cmc,
    colors: (card.colors ? card.colors : card.card_faces[0].colors).map(item => colorMap[item]),
    isFoil: card.isFoil
  };
}

function getRandomIndex(length = 0) {
  return Math.floor(Math.random() * length);
}

function makeChunks(items, chunkSize) {
  var chunks = [];
  for (var i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

function getRandomCard(cardList, currentBooster = [], isUnique = true) {
  let index = getRandomIndex(cardList.length);
  while(isUnique && cardList.length > 1 && currentBooster.filter(card => card.name === cardList[index].name).length > 0) {
    index = getRandomIndex(cardList.length);
  }
  return cardList[index];
}

function getRarityWeightedRandomCard(cards, currentBooster = [], isUnique = true) {
  const commonCards = cards.filter(card => card.rarity === 'common');
  const alCommon = cards.filter(card => card.rarity !== 'uncommon' && card.rarity !== 'rare' && card.rarity !== 'mythic');
  const uncommonCards = cards.filter(card => card.rarity === 'uncommon');
  const rareCards = cards.filter(card => card.rarity === 'rare');
  const mythicRareCards = cards.filter(card => card.rarity === 'mythic')

  const rarity = getRandomIndex(100);
  const isUncommon = rarity > 72 || commonCards.length === 0;
  const isRare = rarity > 92 || (commonCards.length === 0 && uncommonCards.length === 0);
  const isMythicRare = isRare && getRandomIndex(3) === 2;

  if (isMythicRare && mythicRareCards.length > 0) {
    return getRandomCard(mythicRareCards, currentBooster, isUnique);
  } else if (isRare && rareCards.length > 0) {
    return getRandomCard(rareCards, currentBooster, isUnique);
  } else if (isUncommon && uncommonCards.length > 0) {
    return getRandomCard(uncommonCards, currentBooster, isUnique);
  } else if (commonCards.length > 0) {
    return getRandomCard(commonCards, currentBooster, isUnique)
  }
  return getRandomCard(cards, currentBooster, isUnique);
}

function popRandomCard(cardList) {
  let index = getRandomIndex(cardList.length);
  return {
    card: cardList.splice(index, 1)[0],
    remainingCards: cardList
  }
}

function makeGenericPacks(cards, count, lands, additionalFoilOptions = []) {
  const boosters = [];
  const foilOptions = cards.concat(additionalFoilOptions);
  const commons = cards.filter(card => card.rarity === 'common');
  const uncommons = cards.filter(card => card.rarity === 'uncommon');
  let rares = cards.filter(card => card.rarity === 'rare');
  rares = rares.concat(rares);
  rares = rares.concat(cards.filter(card => card.rarity === 'mythic'));

  while(boosters.length < count) {
    let booster = [];
    const isFoil = getRandomIndex(6) === 2;
    for(let i = 0; i < (isFoil ? 10 : 11); i++) {
      booster.push(getRandomCard(commons, booster));
    }
    for(let i = 0; i < 3; i++) {
      booster.push(getRandomCard(uncommons, booster));
    }
    booster.push(getRandomCard(rares, booster));

    if (isFoil) {
      booster.push({
        ...getRarityWeightedRandomCard(foilOptions, booster, false),
        isFoil: true
      });
    }

    booster.push(getRandomCard(lands, booster, false));
    boosters.push(booster);
  }
  return boosters;
}


function makeUniquePacks(cards, count, fullCardPool) {
  const boosters = [];
  let remainingCards = [...cards];

  while(boosters.length < count) {
    const booster = [];
    for(let i = 0; i < 15; i++) {
      if (remainingCards.length === 0) {
        remainingCards = [...fullCardPool];
      }

      const result = popRandomCard(remainingCards);
      booster.push(result.card);
      remainingCards = result.remainingCards;
    }
    boosters.push(booster);
  }

  return {
    boosters: boosters,
    remainingCards: remainingCards
  };
}

exports.mapCard = mapCard;
exports.getRandomIndex = getRandomIndex;
exports.makeChunks = makeChunks;
exports.getRandomCard = getRandomCard;
exports.getRarityWeightedRandomCard = getRarityWeightedRandomCard;
exports.makeGenericPacks = makeGenericPacks;
exports.makeUniquePacks = makeUniquePacks;
