import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { Deck } from './types/deck';

@Injectable()
export class DeckService implements OnDestroy {
  private baseUrl: string;
  public deckList = new BehaviorSubject([] as Deck[]);

  constructor(
    private config: ConfigService,
    private http: HttpClient
  ) {
    this.baseUrl = this.config.configuration.baseUrl;
  }

  public ngOnDestroy() {
    this.deckList.complete();
  }

  public reloadDeckList(playerId: string, code: string): void {
    this.http.get(this.baseUrl + '/player/' + playerId + '/game/' + code + '/decklist')
      .pipe(take(1), map((response: any) => response.data as Deck[]))
      .subscribe(deck => this.deckList.next(deck));
  }

  public load(playerId: string, code: string, deckId: string): Observable<Deck> {
    return this.http.get(this.baseUrl + '/player/' + playerId + '/game/' + code + '/deck/' + deckId)
      .pipe(take(1), map((response: any) => response.data as Deck));
  }

  public save(playerId: string, code: string, deck: Deck): Observable<string> {
    if (deck.deckId) {
      return this.http.put(this.baseUrl + '/player/' + playerId + '/game/' + code + '/deck/' + deck.deckId, deck)
        .pipe(take(1), map((response: any) => response.data.deckId));
    }
    return this.http.post(this.baseUrl + '/player/' + playerId + '/game/' + code + '/deck', deck)
      .pipe(take(1), map((response: any) => response.data.deckId));
  }
}
