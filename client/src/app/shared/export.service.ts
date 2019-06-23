import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConfigService } from './config.service';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { TabletopResponse } from './types/tabletop-response';

@Injectable()
export class ExportService {
  private baseUrl: string;

  constructor(
    private config: ConfigService,
    private http: HttpClient
  ) {
    this.baseUrl = this.config.configuration.baseUrl;
  }

  public getTabletopJson(code: string, playerId: string, addLand = true): Observable<TabletopResponse> {
    return this.http.get(
      this.baseUrl + '/game/' + code + '/player/' + playerId + '/cards/tabletop?addLand=' + (addLand ? 'true' : 'false')
    ).pipe(take(1)).pipe(map(value => value as TabletopResponse));
  }

  public getDeckTabletopJson(code: string, playerId: string, deckId: string, addLand = false): Observable<TabletopResponse> {
    return this.http.get(
      this.baseUrl + '/game/' + code + '/player/' + playerId + '/deck/' + deckId + '/tabletop?addLand=' + (addLand ? 'true' : 'false')
    ).pipe(take(1)).pipe(map(value => value as TabletopResponse));
  }
}
