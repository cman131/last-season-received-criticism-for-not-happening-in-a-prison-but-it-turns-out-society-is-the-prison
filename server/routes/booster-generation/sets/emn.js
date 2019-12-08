function generatePacks(cards, count, lands) {
    const shadowsSetGenerator = require('./soi');
    return shadowsSetGenerator.generatePacks(cards, count, lands);
}

exports.generatePacks = generatePacks;
