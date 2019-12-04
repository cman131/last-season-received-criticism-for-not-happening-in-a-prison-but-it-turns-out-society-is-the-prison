function generatePacks(cards, count, lands, mapCard) {
    const innistradSetGenerator = require('./isd');
    return innistradSetGenerator.generatePacks(cards, count, lands, mapCard);
}

exports.generatePacks = generatePacks;
