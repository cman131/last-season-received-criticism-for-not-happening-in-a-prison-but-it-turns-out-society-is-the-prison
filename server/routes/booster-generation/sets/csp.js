function generatePacks(cards, count, lands, mapCard) {
    const modernHorizonsSetGenerator = require('./mh1');
    return modernHorizonsSetGenerator.generatePacks(cards, count, lands, mapCard);
}

exports.generatePacks = generatePacks;
