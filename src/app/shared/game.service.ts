import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { GameConfig } from './types/game-config';

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
    this.gameConfig.next(this._gameConfig);
  }

  public submitCardChoice(card: string) {
    // Send card pick
    this.refreshConfig();
  }
}