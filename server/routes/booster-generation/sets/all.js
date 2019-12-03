function generatePacks(cards, count, lands, mapCard) {
    const iceAgeSetGenerator = require('./ice');
    return iceAgeSetGenerator.generatePacks(cards, count, lands, mapCard);
}

exports.generatePacks = generatePacks;
