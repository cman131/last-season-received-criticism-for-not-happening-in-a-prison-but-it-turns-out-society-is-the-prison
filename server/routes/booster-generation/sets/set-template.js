function getRandomIndex(length = 0) {
  return Math.floor(Math.random() * length);
}

function generatePacks(cards, count, lands, mapCard) {
  const boosters = [];
  while (boosters.length < count) {
      const booster = [];
      boosters.push(booster.map(mapCard));
  }
  return boosters;
}

exports.generatePacks = generatePacks;
