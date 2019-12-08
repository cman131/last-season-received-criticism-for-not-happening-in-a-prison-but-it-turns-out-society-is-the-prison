const Utility = require('../utility');

const wastesCard = {
  "id": "9cc070d3-4b83-4684-9caf-063e5c473a77",
  "name": "Wastes",
  "image_uris": {
    "large": "https://img.scryfall.com/cards/large/front/9/c/9cc070d3-4b83-4684-9caf-063e5c473a77.jpg?1562926596"
  },
  "cmc": 0,
  "oracle_text": "{T}: Add {C}.",
  "colors": []
};

function generatePacks(cards, count, _) {
  return Utility.makeGenericPacks(cards, count, [wastesCard])
}

exports.generatePacks = generatePacks;
