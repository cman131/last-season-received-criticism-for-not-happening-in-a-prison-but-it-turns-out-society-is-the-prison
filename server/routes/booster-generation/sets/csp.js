function generatePacks(cards, count, lands) {
    const modernHorizonsSetGenerator = require('./mh1');
    return modernHorizonsSetGenerator.generatePacks(cards, count, lands);
}

exports.generatePacks = generatePacks;
