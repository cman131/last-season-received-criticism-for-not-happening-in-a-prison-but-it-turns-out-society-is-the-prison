import { Component } from '@angular/core';
import { GameService } from '../shared/game.service';

@Component({
  selector: 'app-home',
  templateUrl: './app-home.component.html',
  styleUrls: ['./app-home.component.css']
})
export class AppHomeComponent {
  public code = '';
  public playerId = '';

  constructor(private gameService: GameService) {}

  public endGame(code, playerId) {
    this.gameService.endGame(code, playerId);
  }
}
