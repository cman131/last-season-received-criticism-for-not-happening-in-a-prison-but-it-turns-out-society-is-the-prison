const config = require('../config');
const request = require('request');
const Jimp = require('jimp');
const tabletop_entity = require('./tabletop-objects');

const lands = [
  {
    name: 'Forest',
    description: '({T}: Add {G}.)',
    imageUrl: 'https://img.scryfall.com/cards/large/front/5/8/58fe058d-7796-4233-8d74-2a12f9bd0023.jpg?1543675077',
    count: 1
  },
  {
    name: 'Island',
    description: '({T}: Add {U}.)',
    imageUrl: 'https://img.scryfall.com/cards/large/front/0/b/0ba8851d-0b25-4232-acd3-594b5b25f16e.jpg?1543675020',
    count: 1
  },
  {
    name: 'Mountain',
    description: '({T}: Add {R}.)',
    imageUrl: 'https://img.scryfall.com/cards/large/front/4/9/49ac3fd1-f732-4d96-ac93-560e4e86051e.jpg?1543675054',
    count: 1
  },
  {
    name: 'Swamp',
    description: '({T}: Add {B}.)',
    imageUrl: 'https://img.scryfall.com/cards/large/front/8/b/8bc682cd-b13b-4670-913c-70542f161316.jpg?1543675036',
    count: 1
  },
  {
    name: 'Plains',
    description: '({T}: Add {W}.)',
    imageUrl: 'https://img.scryfall.com/cards/large/front/f/e/feada93b-aabf-45d6-ac46-98b33caf9112.jpg?1543675002',
    count: 1
  }
];

function reduce(array) {
  let tempDict = {};
  for (let item of array) {
    if (!(item.name in tempDict)) {
      tempDict[item.name] = item;
      tempDict[item.name].count = item.count ? item.count : 1;
    } else {
      tempDict[item.name].count += item.count ? item.count : 1;
    }
  }
  return Object.values(tempDict);
}

function makeChunks(array, chunkSize) {
  let chunks = [];
  while (array.length > 0) {
    chunks.push(array.splice(0, chunkSize));
  }
  return chunks;
}

function imgurPostCallback(links, cardSetsCount, callback) {
  if (links.length === cardSetsCount) {
    callback(links);
  }
}

function errorCallback(callback) {
  callback([], 'failed to get imgur url');
}

async function generateTabletopImages(cards, addLand, callback) {
  try {
    if (addLand) {
      cards = cards.concat(lands);
    }

    let cardSets = makeChunks(reduce(cards), 69);
    let links = [];

    console.log('1. Create card configs');
    for (let cardset of cardSets) {
      const width = 409;
      const height = 585;
      let images = [];
      for (let card of cardset) {
        let img = await Jimp.read(card.imageUrl);
        img.resize(width, height);

        for (let i = 0; i < card.count; i++) {
          images.push(img);
        }
      }

      // creates a new empty image, RGB mode, and size 4096 by 4096.
      const dimensions = [width * 10, height * 7];
      const newImage = new Jimp(dimensions[0], dimensions[1]);

      console.log('2. Create images from config');
      let cur = 0;
      for (let i = 0; i < dimensions[1]; i += height) {
        if(cur >= images.length) {
          break;
        }

        for (let j = 0; j < dimensions[0]; j += width) {
          if (cur >= images.length) {
            break;
          }

          // paste the image at location j,i:
          newImage.composite(images[cur], j, i);
          cur += 1;
        }
      }

      newImage.quality(96);

      console.log('3. Combine images');
      newImage.getBase64(Jimp.MIME_JPEG, (err, b64Image) => {
        // data to send with the POST request
        console.log('4. Post to imgur');
        request.post({
          url: 'https://api.imgur.com/3/image',
          headers: {
            'Authorization': 'Client-ID ' + config.imgurClientId
          },
          formData: {
            'image': b64Image.replace('data:image/jpeg;base64,', ''),
            'title': 'draft_api_image'
          }
        }, (error, response, body) => {
          if (error) {
            console.log(error);
            errorCallback(callback);
          } else {
            console.log('5. Finish');
            links.push(JSON.parse(body).data.link);
            imgurPostCallback(links, cardSets.length, callback);
          }
        });
      });
    }
  } catch (error) {
    console.log('error happened');
    console.log(error);
    errorCallback(callback);
  }
}

function getTabletopJson(name, description, cards, links, addLand) {
  if (addLand !== false) {
    cards = cards.concat(lands);
  }

  let cardSets = makeChunks(reduce(cards), 69);
  let tableTopObject = tabletop_entity.TabletopObjectState(name, description);

  for (let setIndex in cardSets) {
    const cardset = cardSets[setIndex];
    let tableCards = [];
    for (let card of cardset) {
      for (let i = 0; i < card.count; i++) {
        tableCards.push(card);
      }
    }
    tableTopObject.addDeck(links[setIndex], tableCards, 'magic');
  }

  if (Object.keys(tableTopObject.CustomDeck).length >= cardSets.length) {
    return tabletop_entity.TabletopSave([tableTopObject]);
  }
}

exports.getTabletopJson = getTabletopJson;
exports.generateTabletopImages = generateTabletopImages;
