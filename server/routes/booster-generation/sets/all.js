function generatePacks(cards, count, lands) {
    const iceAgeSetGenerator = require('./ice');
    return iceAgeSetGenerator.generatePacks(cards, count, lands);
}

exports.generatePacks = generatePacks;
