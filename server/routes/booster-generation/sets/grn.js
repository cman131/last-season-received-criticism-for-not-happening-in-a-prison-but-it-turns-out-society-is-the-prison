const guildGates = ['Boros Guildgate', 'Dimir Guildgate', 'Golgari Guildgate', 'Izzet Guildgate', 'Selesnya Guildgate'];
function getRandomIndex(length = 0) {
  return Math.floor(Math.random() * length);
}

function generatePacks(cards, count, _, mapCard) {
  const boosters = [];

  let commons = cards.filter(card => card.rarity === 'common');
  const lands = commons.filter(card => guildGates.includes(card.name));
  commons = commons.filter(card => !guildGates.includes(card.name));

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
  return boosters;
}

exports.generatePacks = generatePacks;
