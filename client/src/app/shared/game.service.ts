import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { GameConfig } from './types/game-config';
import { Card } from './types/card';
import { take } from 'rxjs/operators';
import { ConfigService } from './config.service';

@Injectable()
export class GameService implements OnDestroy {
  private _gameConfig: GameConfig = {
    state: 0,
    players: [],
    currentPack: [],
    cards: []
  };
  public gameConfig: BehaviorSubject<GameConfig> = new BehaviorSubject(this._gameConfig);

  private baseUrl: string;
  private configListener: any;

  constructor(
    private config: ConfigService,
    private http: HttpClient
  ) {
    this.baseUrl = this.config.configuration.baseUrl;
  }

  public ngOnDestroy() {
    this.stopListener();
    this.gameConfig.complete();
  }

  public setConfigListener(code: string, playerId: string) {
    this._gameConfig.code = code;
    this._gameConfig.playerId = playerId;
    if (!this.configListener) {
      this.refreshConfig(this.http);
      this.configListener = setInterval(() => this.refreshConfig(this.http), 5000);
    }
  }

  public stopListener() {
    if (this.configListener) {
      clearInterval(this.configListener);
      this.configListener = undefined;
    }
  }

  public submitCardChoice(card: Card) {
    this.stopListener();
    if (!this._gameConfig.cards) {
      this._gameConfig.cards = [];
    }

    this._gameConfig.cards.push(card);
    this._gameConfig.currentPack = [];
    this.gameConfig.next(this._gameConfig);

    this.http.post(this.baseUrl + '/game/' + this._gameConfig.code + '/player/' + this._gameConfig.playerId, {
      card: card
    }).pipe(take(1)).subscribe((response) => {
      this.setConfigListener(this._gameConfig.code, this._gameConfig.playerId);
    });
  }

  public startGame() {
    if (this._gameConfig.state === 0) {
      this.stopListener();
      this.http.put(this.baseUrl + '/game/' + this._gameConfig.code, {}).pipe(take(1)).subscribe((response) => {
        this.setConfigListener(this._gameConfig.code, this._gameConfig.playerId);
      });
    }
  }

  private refreshConfig(http: HttpClient) {
    // Refresh the game config
    http.get(
      this.baseUrl + '/game/' + this._gameConfig.code + '/player/' + this._gameConfig.playerId
    ).pipe(take(1)).subscribe((response: any) => {
      if (this.configListener) {
        this._gameConfig = response.data;
        this.gameConfig.next(this._gameConfig);
      }
    });
  }
}
