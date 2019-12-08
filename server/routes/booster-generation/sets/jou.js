const Utility = require('../utility');

const godPack  = 
[
  {
    "id": "52705c53-883e-4b6a-9c08-3fa35f6f17d5",
    "name": "Athreos, God of Passage",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/5/2/52705c53-883e-4b6a-9c08-3fa35f6f17d5.jpg?1562211207"
    },
    "cmc": 3,
    "oracle_text": "Indestructible\nAs long as your devotion to white and black is less than seven, Athreos isn't a creature.\nWhenever another creature you own dies, return it to your hand unless target opponent pays 3 life.",
    "colors": [
      "B",
      "W"
    ]
  },
  {
    "id": "75ec8548-5790-4eac-8780-cdd126438192",
    "name": "Pharika, God of Affliction",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/7/5/75ec8548-5790-4eac-8780-cdd126438192.jpg?1562214889"
    },
    "cmc": 3,
    "oracle_text": "Indestructible\nAs long as your devotion to black and green is less than seven, Pharika isn't a creature.\n{B}{G}: Exile target creature card from a graveyard. Its owner creates a 1/1 black and green Snake enchantment creature token with deathtouch.",
    "colors": [
      "B",
      "G"
    ]
  },
  {
    "id": "d6876c7a-8bbe-484e-b733-70229fa336cd",
    "name": "Thassa, God of the Sea",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/d/6/d6876c7a-8bbe-484e-b733-70229fa336cd.jpg?1562832605"
    },
    "cmc": 3,
    "oracle_text": "Indestructible\nAs long as your devotion to blue is less than five, Thassa isn't a creature. (Each {U} in the mana costs of permanents you control counts toward your devotion to blue.)\nAt the beginning of your upkeep, scry 1.\n{1}{U}: Target creature you control can't be blocked this turn.",
    "colors": [
      "U"
    ]
  },
  {
    "id": "6832e495-7ee9-43e0-94ea-03c88344080e",
    "name": "Ephara, God of the Polis",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/6/8/6832e495-7ee9-43e0-94ea-03c88344080e.jpg?1562508171"
    },
    "cmc": 4,
    "oracle_text": "Indestructible\nAs long as your devotion to white and blue is less than seven, Ephara isn't a creature.\nAt the beginning of each upkeep, if you had another creature enter the battlefield under your control last turn, draw a card.",
    "colors": [
      "U",
      "W"
    ]
  },
  {
    "id": "d0787e1f-0b75-44ab-a8fd-90358906a787",
    "name": "Erebos, God of the Dead",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/d/0/d0787e1f-0b75-44ab-a8fd-90358906a787.jpg?1562831894"
    },
    "cmc": 4,
    "oracle_text": "Indestructible\nAs long as your devotion to black is less than five, Erebos isn't a creature. (Each {B} in the mana costs of permanents you control counts toward your devotion to black.)\nYour opponents can't gain life.\n{1}{B}, Pay 2 life: Draw a card.",
    "colors": [
      "B"
    ]
  },
  {
    "id": "e90d01c9-e76e-42ff-b0fa-8b6786242aae",
    "name": "Heliod, God of the Sun",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/e/9/e90d01c9-e76e-42ff-b0fa-8b6786242aae.jpg?1562836166"
    },
    "cmc": 4,
    "oracle_text": "Indestructible\nAs long as your devotion to white is less than five, Heliod isn't a creature. (Each {W} in the mana costs of permanents you control counts toward your devotion to white.)\nOther creatures you control have vigilance.\n{2}{W}{W}: Create a 2/1 white Cleric enchantment creature token.",
    "colors": [
      "W"
    ]
  },
  {
    "id": "b4036bb7-835d-4690-aca1-1ab566776e9a",
    "name": "Iroas, God of Victory",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/b/4/b4036bb7-835d-4690-aca1-1ab566776e9a.jpg?1562415955"
    },
    "cmc": 4,
    "oracle_text": "Indestructible\nAs long as your devotion to red and white is less than seven, Iroas isn't a creature.\nCreatures you control have menace.\nPrevent all damage that would be dealt to attacking creatures you control.",
    "colors": [
      "R",
      "W"
    ]
  },
  {
    "id": "2a0417bf-b735-46d7-9985-2d991051020f",
    "name": "Mogis, God of Slaughter",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/2/a/2a0417bf-b735-46d7-9985-2d991051020f.jpg?1562501916"
    },
    "cmc": 4,
    "oracle_text": "Indestructible\nAs long as your devotion to black and red is less than seven, Mogis isn't a creature.\nAt the beginning of each opponent's upkeep, Mogis deals 2 damage to that player unless they sacrifice a creature.",
    "colors": [
      "B",
      "R"
    ]
  },
  {
    "id": "f185a734-a32a-4244-88e8-dabafbfd064f",
    "name": "Nylea, God of the Hunt",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/f/1/f185a734-a32a-4244-88e8-dabafbfd064f.jpg?1562837629"
    },
    "cmc": 4,
    "oracle_text": "Indestructible\nAs long as your devotion to green is less than five, Nylea isn't a creature. (Each {G} in the mana costs of permanents you control counts toward your devotion to green.)\nOther creatures you control have trample.\n{3}{G}: Target creature gets +2/+2 until end of turn.",
    "colors": [
      "G"
    ]
  },
  {
    "id": "7bf6baf2-d20b-467d-8929-abefcf7dfa99",
    "name": "Purphoros, God of the Forge",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/7/b/7bf6baf2-d20b-467d-8929-abefcf7dfa99.jpg?1562820377"
    },
    "cmc": 4,
    "oracle_text": "Indestructible\nAs long as your devotion to red is less than five, Purphoros isn't a creature.\nWhenever another creature enters the battlefield under your control, Purphoros deals 2 damage to each opponent.\n{2}{R}: Creatures you control get +1/+0 until end of turn.",
    "colors": [
      "R"
    ]
  },
  {
    "id": "74050cb3-ba99-475d-9124-726e498fb68e",
    "name": "Karametra, God of Harvests",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/7/4/74050cb3-ba99-475d-9124-726e498fb68e.jpg?1562509556"
    },
    "cmc": 5,
    "oracle_text": "Indestructible\nAs long as your devotion to green and white is less than seven, Karametra isn't a creature.\nWhenever you cast a creature spell, you may search your library for a Forest or Plains card, put it onto the battlefield tapped, then shuffle your library.",
    "colors": [
      "G",
      "W"
    ]
  },
  {
    "id": "ab70c262-37a9-4dcd-80bb-d4422368eade",
    "name": "Keranos, God of Storms",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/a/b/ab70c262-37a9-4dcd-80bb-d4422368eade.jpg?1562220545"
    },
    "cmc": 5,
    "oracle_text": "Indestructible\nAs long as your devotion to blue and red is less than seven, Keranos isn't a creature.\nReveal the first card you draw on each of your turns. Whenever you reveal a land card this way, draw a card. Whenever you reveal a nonland card this way, Keranos deals 3 damage to any target.",
    "colors": [
      "R",
      "U"
    ]
  },
  {
    "id": "27427233-da58-45af-ade8-e0727929efaa",
    "name": "Kruphix, God of Horizons",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/2/7/27427233-da58-45af-ade8-e0727929efaa.jpg?1562206204"
    },
    "cmc": 5,
    "oracle_text": "Indestructible\nAs long as your devotion to green and blue is less than seven, Kruphix isn't a creature.\nYou have no maximum hand size.\nIf you would lose unspent mana, that mana becomes colorless instead.",
    "colors": [
      "G",
      "U"
    ]
  },
  {
    "id": "8dfcb129-4665-40e4-b5cb-a79f3f40ae5c",
    "name": "Phenax, God of Deception",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/8/d/8dfcb129-4665-40e4-b5cb-a79f3f40ae5c.jpg?1562512215"
    },
    "cmc": 5,
    "oracle_text": "Indestructible\nAs long as your devotion to blue and black is less than seven, Phenax isn't a creature.\nCreatures you control have \"{T}: Target player puts the top X cards of their library into their graveyard, where X is this creature's toughness.\"",
    "colors": [
      "B",
      "U"
    ]
  },
  {
    "id": "3184b138-1109-4195-9d96-4f190164e98b",
    "name": "Xenagos, God of Revels",
    "image_uris": {
      "large": "https://img.scryfall.com/cards/large/front/3/1/3184b138-1109-4195-9d96-4f190164e98b.jpg?1562502824"
    },
    "cmc": 5,
    "oracle_text": "Indestructible\nAs long as your devotion to red and green is less than seven, Xenagos isn't a creature.\nAt the beginning of combat on your turn, another target creature you control gains haste and gets +X/+X until end of turn, where X is that creature's power.",
    "colors": [
      "G",
      "R"
    ]
  }
].map(card => ({ ...card, isFoil: true }));

const godPackRatio = 1080;

function generatePacks(cards, count, lands)
{
  const boosters = [];
  const prePacks = Utility.makeGenericPacks(cards, count, lands);
  while( boosters.length < count )
  {
    if(Utility.getRandomIndex(godPackRatio) === 540)
    {
      // Create a god pack
      const booster = [...godPack];
      // Put the land in 
      booster.push(Utility.getRandomCard(lands, booster, false));
      // Unpackages the card
      boosters.push(booster);
    }
    else
    {
      boosters.push(prePacks.pop());
    }
  }
  return boosters;
}

exports.generatePacks = generatePacks; 
