import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Set } from '../shared/types/set';
import { Card } from './types/card';

export interface CardQuery {
  name: string;
  set?: string;
}

export interface CardQueryPrintResult {
  set: string;
  imageUrl: string;
}

export interface CardQueryResult {
  name: string;
  prints: CardQueryPrintResult[]
}

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
        return data.data.map(card => this.cardMap(card));
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
    let description = card.oracle_text;
    if (card.card_faces) {
      description = card.card_faces.map(cardFace => cardFace.name + ' - ' + cardFace.oracle_text).join('<br/>');
    }
    return {
      id: card.id,
      name: card.name,
      description: description,
      imageUrl: card.image_uris.large,
      imageUrlCropped: card.image_uris.border_crop,
      cmc: card.cmc,
      colors: card.colors.map(item => this.colorMap[item]),
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
}
