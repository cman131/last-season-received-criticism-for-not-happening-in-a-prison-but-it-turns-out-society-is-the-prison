const uuid4 = require('uuid4');

function TabletopObjectState(name = '', description = '') {
  return {
    Name: "DeckCustom",
    Nickname: name,
    Description: description,
    Grid: true,
    Locked: false,
    SidewaysCard: false,
    GUID: uuid4(),
    ColorDiffuse: TabletopColor(0.713235259, 0.713235259, 0.713235259),
    DeckIDs: [],
    Transform: TabletopTransform(2.5, 2.5, 0.0, 0, 180, 180, 1.0, 1.0, 1.0),
    CustomDeck: {},
    ContainedObjects: [],
    addDeck(deckUrl, cards = [], cardBackKey = 'magic') {
      if (cards.length > 69) {
        throw Exception("No! only 69 cards in a deck.");
      }

      let deckId = Object.keys(this.CustomDeck).length + 1;
      this.CustomDeck[deckId] = TabletopDeck(deckUrl, cardBackKey);
      let ind = 0;
      for (let card of cards) {
        const cardId = deckId.toString() + (ind >= 10 ? ind.toString() : "0"+ind.toString());
        this.DeckIDs.push(cardId);
        this.ContainedObjects.push(TabletopCard(card.name, cardId, card.description));
        ind += 1;
      }
    }
  };
}
exports.TabletopObjectState = TabletopObjectState;

function TabletopSave(objects = []) {
  return {
    SaveName: '',
    GameMode: '',
    Date: '',
    Table: '',
    Sky: '',
    Note: '',
    Rules: '',
    PlayerTurn: '',
    ObjectStates: objects,
    addObject(object) {
      this.ObjectStates.push(object);
    }
  }
}
exports.TabletopSave = TabletopSave;

function TabletopColor(r, g, b) {
  return {
    r: r,
    g: g,
    b: b
  };
}
exports.TabletopColor = TabletopSave;

function TabletopTransform(posX, posY, posZ, rotX, rotY, rotZ, scaleX, scaleY, scaleZ) {
  return {
    posX: posX,
    posY: posY,
    posZ: posZ,
    rotX: rotX,
    rotY: rotY,
    rotZ: rotZ,
    scaleX: scaleX,
    scaleY: scaleY,
    scaleZ: scaleZ
  };
}
exports.TabletopTransform = TabletopTransform;

function TabletopDeck(faceUrl, cardBackKey="magic") {
  let cardBackUrls = {'magic': "http://i.imgur.com/P7qYTcI.png",
                  'weiss': "http://imgur.com/6pIaFqR.jpg"};
  return {
    FaceURL: faceUrl,
    BackURL: cardBackUrls[cardBackKey]
  };
}
exports.TabletopDeck = TabletopDeck;

function TabletopCard(name, cardId, description='') {
  return {
    Name: "Card",
    Nickname: name,
    CardID: cardId,
    Description: description,
    Transform: TabletopTransform(2.5, 2.5, 3.5, 0, 180, 180, 1.0, 1.0, 1.0)
  };
}
exports.TabletopCard = TabletopCard;
