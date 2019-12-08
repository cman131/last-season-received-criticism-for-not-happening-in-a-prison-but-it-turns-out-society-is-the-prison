const Utility = require('../utility');

const snowLands = [
  {
    "id": "1c59fc48-704b-4187-b9d3-2a2cff6dd54b",
    "name": "Snow-Covered Forest",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/1/c/1c59fc48-704b-4187-b9d3-2a2cff6dd54b.jpg?1562202644"
    },
    "cmc": 0,
    "oracle_text": "({T}: Add {G}.)",
    "colors": []
  },
  {
    "id": "8ac1fceb-8427-409c-98a4-9a5c1ff980b4",
    "name": "Snow-Covered Island",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/8/a/8ac1fceb-8427-409c-98a4-9a5c1ff980b4.jpg?1562202628"
    },
    "cmc": 0,
    "oracle_text": "({T}: Add {U}.)",
    "colors": []
  },
  {
    "id": "d2209e6f-1d9d-43bb-a314-a8fefc509e78",
    "name": "Snow-Covered Mountain",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/d/2/d2209e6f-1d9d-43bb-a314-a8fefc509e78.jpg?1562202639"
    },
    "cmc": 0,
    "oracle_text": "({T}: Add {R}.)",
    "colors": []
  },
  {
    "id": "7a961768-6166-4852-b518-23eb4cced47d",
    "name": "Snow-Covered Plains",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/7/a/7a961768-6166-4852-b518-23eb4cced47d.jpg?1562202622"
    },
    "cmc": 0,
    "oracle_text": "({T}: Add {W}.)",
    "colors": []
  },
  {
    "id": "c835f235-4196-4281-9788-13e5d54a92d0",
    "name": "Snow-Covered Swamp",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/c/8/c835f235-4196-4281-9788-13e5d54a92d0.jpg?1562202633"
    },
    "cmc": 0,
    "oracle_text": "({T}: Add {B}.)",
    "colors": []
  }
];

function generatePacks(cards, count, _) {
  return Utility.makeGenericPacks(cards, count, snowLands);
}

exports.generatePacks = generatePacks;
