import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Set } from '../shared/types/set';
import { Card } from './types/card';
import { CardFace } from './types/card-face';
import { CardQuery } from './types/card-query';

@Injectable()
export class ScryfallService {
  private colorMap = {
    W: 'white',
    U: 'blue',
    B: 'black',
    R: 'red',
    G: 'green'
  };

  private acceptableSetTypes = [
    'core',
    'expansion',
    'masters',
    'draft_innovation'
  ];

  private availableCubes: Set[] = [
    {
      name: 'Vintage Cube Winter 2020',
      code: 'vintage-winter-2020'
    }
  ];

  constructor(
    private http: HttpClient
  ) { }

  public queryForProxy(cardQueries: CardQuery[]): Observable<Card[]> {
    return this.http.post('https://api.scryfall.com/cards/collection', {
      unique: 'prints',
      identifiers: cardQueries.map(card => ({
        name: card.name,
        set: card.set
      }))
    }).pipe(
      map((data: any) => {
        return data.data.filter(Boolean).map(card => this.cardMap(card));
      })
    );
  }

  public getCards(cardNames: string[]): Observable<Card[]> {
    const cards = cardNames.map((cardName) => {
      return {
        name: cardName
      };
    });
    return this.http.post('https://api.scryfall.com/cards/collection', {
      identifiers: cards
    }).pipe(map((data: any) => {
      return data.data.map(card => this.cardMap(card));
    }));
  }

  private cardMap(card: any): Card {
    let cardFaces: CardFace[] = [];
    let cardColors: string[] = [];
    let description = card.oracle_text;

    if (card.card_faces) {
      description = card.card_faces.map(cardFace => cardFace.name + ' - ' + cardFace.oracle_text).join('<br/>');
      cardFaces = card.card_faces.map(cardFace => ({
        imageUrl: cardFace.image_uris.large,
        imageUrlCropped: cardFace.image_uris.border_crop
      }));

      const colorArrays = card.card_faces.map(cardFace => cardFace.colors.map(item => this.colorMap[item]));
      for (let colorSet of colorArrays) {
        cardColors = this.unionArrays(cardColors, colorSet);
      }
    } else if (card.image_uris) {
      cardFaces = [{
        imageUrl: card.image_uris.large,
        imageUrlCropped: card.image_uris.border_crop,
      }];

      cardColors = card.colors.map(item => this.colorMap[item]);
    }

    return {
      id: card.id,
      name: card.name,
      description: description,
      imageUrl: cardFaces[0].imageUrl,
      imageUrlCropped: cardFaces[0].imageUrlCropped,
      faces: cardFaces,
      cmc: card.cmc,
      colors: cardColors,
      set: card.set
    };
  }

  public getSets(): Observable<Set[]> {
    return this.http.get('https://api.scryfall.com/sets').pipe(map((data: any) => {
      return data.data.filter(set => this.acceptableSetTypes.indexOf(set.set_type.toLowerCase()) > -1).map(set =>
        ({
          name: set.name,
          code: set.code
        })
      ).concat(this.availableCubes);
    }));
  }

  private reduceDuplicatePrints(cards: any[]) {
    const cardDict = {};

    for (let card of cards) {
      if (card.name in cardDict) {
        cardDict[card.name].prints.push({ set: card.set, imageUrl: card.imageUrl });
      } else {
        cardDict[card.name] = {
          name: card.name,
          prints: [{ set: card.set, imageUrl: card.imageUrl }]
        };
      }
    }

    return Object.keys(cardDict).map(key => cardDict[key]);
  }

  private unionArrays (x: any[], y: any[]): any[] {
    var obj = {};
    for (var i = x.length-1; i >= 0; -- i)
      obj[x[i]] = x[i];
    for (var i = y.length-1; i >= 0; -- i)
      obj[y[i]] = y[i];
    var res = []
    for (var k in obj) {
      if (obj.hasOwnProperty(k))  // <-- optional
        res.push(obj[k]);
    }
    return res;
  }
}
