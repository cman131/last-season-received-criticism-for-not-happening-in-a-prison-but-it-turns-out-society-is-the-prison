import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take, map, catchError } from 'rxjs/operators';
import { GameConfig } from './types/game-config';
import { GameConnection } from './types/game-connection';
import { Observable, of } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable()
export class ManagementService {
  private baseUrl: string;

  constructor(
    private config: ConfigService,
    private http: HttpClient
  ) {
    this.baseUrl = this.config.configuration.baseUrl;
  }

  public createGame(gameConfig: GameConfig): Observable<GameConnection> {
    return this.http.post(this.baseUrl + '/game', gameConfig).pipe(take(1), map((response: any) => {
      const data = response.data || {};
      return {
        code: data.code,
        playerId: data.playerId,
        success: response.status === 200,
        errorMessage: response.errorMessage
      };
    }));
  }

  public joinGame(gameConfig: GameConfig): Observable<GameConnection> {
    return this.http.post(this.baseUrl + '/game/' + gameConfig.code + '/player', {
      name: gameConfig.name
    }).pipe(
      take(1),
      map((response: any) => {
        console.log(response);
        const data = response.data || {};
        return {
          code: data.code,
          playerId: data.playerId,
          success: response.status === 200,
          errorMessage: response.errorMessage
        };
      }),
      catchError((err) => {
        return of({
          code: undefined,
          playerId: undefined,
          success: false,
          errorMessage: err.error.errorMessage
        });
      })
    );
  }
}
