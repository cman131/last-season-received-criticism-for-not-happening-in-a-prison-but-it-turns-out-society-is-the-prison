import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameConfig } from './types/game-config';
import { GameConnection } from './types/game-connection';

@Injectable()
export class ManagementService {
  constructor(
    private http: HttpClient
  ) { }

  public createGame(gameConfig: GameConfig): Observable<GameConnection> {
    return Observable.create(observer => {
      observer.next({
        code: '1',
        playerId: '1',
        success: true,
        errorMessage: undefined
      });
      observer.complete();
    });
  }

  public joinGame(gameConfig: GameConfig): Observable<GameConnection> {
    return Observable.create(observer => {
      observer.next({
        code: '1',
        playerId: '1',
        success: true,
        errorMessage: undefined
      });
      observer.complete();
    })
  }
}