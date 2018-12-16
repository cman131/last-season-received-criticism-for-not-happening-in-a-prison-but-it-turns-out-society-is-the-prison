import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { GameConfig } from './types/game-config';
import { Card } from './types/card';

@Injectable()
export class GameService {
  private _gameConfig: GameConfig = {};
  public gameConfig: BehaviorSubject<GameConfig> = new BehaviorSubject(this._gameConfig);

  constructor(
    private http: HttpClient
  ) { }

  public refreshConfig() {
    // Refresh the game config
    this.gameConfig.next(this._gameConfig);
  }

  public setConfig(config: GameConfig) {
    // set the code
    this._gameConfig.code = config.code;
    this._gameConfig.playerId = config.playerId;
    this._gameConfig.players = [{
      id: config.playerId,
      name: 'Conor'
    }];
    this._gameConfig.currentPack = [
      'Ancient tomb',
      'Vivid Revival',
      'Jace\'s Archivist'
    ];
    this.gameConfig.next(this._gameConfig);
  }

  public submitCardChoice(card: Card) {
    // Send card pick
    if (!this._gameConfig.cards) {
      this._gameConfig.cards = [];
    }
    this._gameConfig.cards.push(card);
    if (this._gameConfig.cards.length >= 15) {
      this._gameConfig.done = true;
    }
    this.refreshConfig();
  }
}