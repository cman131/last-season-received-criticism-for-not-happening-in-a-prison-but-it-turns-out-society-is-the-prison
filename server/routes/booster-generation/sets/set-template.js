const Utility = require('../utility');

function generatePacks(cards, count, lands, mapCard) {
  const boosters = [];
  while (boosters.length < count) {
      const booster = [];
      boosters.push(booster.map(Utility.mapCard));
  }
  return boosters;
}

exports.generatePacks = generatePacks;
