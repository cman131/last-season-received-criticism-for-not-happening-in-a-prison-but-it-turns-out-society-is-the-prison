function generatePacks(cards, count, lands, mapCard) {
    const shadowsSetGenerator = require('./soi');
    return shadowsSetGenerator.generatePacks(cards, count, lands, mapCard);
}

exports.generatePacks = generatePacks;
