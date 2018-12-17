import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Set } from '../shared/types/set';
import { Card } from './types/card';

@Injectable()
export class ScryfallService {
  private acceptableSetTypes = [
    'core',
    'expansion',
    'masters',
    'draft_innovation',
    'funny'
  ]

  constructor(
    private http: HttpClient
  ) { }

  public getCards(cardNames: string[]): Observable<Card[]> {
    const cards = cardNames.map((cardName) => {
      return {
        name: cardName
      };
    });
    return this.http.post('https://api.scryfall.com/cards/collection', {
      identifiers: cards
    }).pipe(map((data: any) => {
      return data.data.map(card => {
        return {
          id: card.id,
          name: card.name,
          description: card.oracle_text,
          imageUrl: card.image_uris.large
        };
      });
    }));
  }

  public getSets(): Observable<Set[]> {
    return this.http.get('https://api.scryfall.com/sets').pipe(map((data: any) => {
      return data.data.filter(set => this.acceptableSetTypes.indexOf(set.set_type.toLowerCase()) > -1).map(set => {
        return {
          name: set.name,
          code: set.code
        };
      });
    }));
  }
}