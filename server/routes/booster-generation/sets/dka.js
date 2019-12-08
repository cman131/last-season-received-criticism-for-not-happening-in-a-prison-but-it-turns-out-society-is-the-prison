function generatePacks(cards, count, lands) {
    const innistradSetGenerator = require('./isd');
    return innistradSetGenerator.generatePacks(cards, count, lands);
}

exports.generatePacks = generatePacks;
