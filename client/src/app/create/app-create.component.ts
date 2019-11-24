import { Component } from '@angular/core';
import { ManagementService } from '../shared/management.service';
import { GameConfig } from '../shared/types/game-config';
import { Set } from '../shared/types/set';
import { GameConnection } from '../shared/types/game-connection';
import { Router } from '@angular/router';
import { ScryfallService } from '../shared/scryfall.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-create',
  templateUrl: './app-create.component.html',
  styleUrls: ['./app-create.component.css']
})
export class AppCreateComponent {
  public game: GameConfig = {
    name: '',
    maxPlayers: 8,
    sets: []
  };
  public sets: Set[] = [];
  public errorMessage: string;

  constructor(
    private managementService: ManagementService,
    private router: Router,
    private scryfall: ScryfallService
  ) {
    this.scryfall.getSets().pipe(take(1)).subscribe((sets: Set[]) => {
      this.sets = sets;
      this.game.sets = [sets[0].code];
    });
  }

  public isMaxPlayersValid() {
    return this.game.maxPlayers
      && this.game.maxPlayers > 0
      && this.game.maxPlayers < 13;
  }

  public isSetsValid() {
    return this.game.sets.length > 0
      && this.game.sets.length < 4;
  }

  public isValid() {
    return this.game.name
      && this.isMaxPlayersValid()
      && this.isSetsValid();
  }

  public submit(): void {
    // submit the thing and validate
    this.managementService.createGame(this.game).subscribe((connection: GameConnection) => {
      if (connection.success) {
        this.router.navigate(['/draft', connection.code, connection.playerId]);
      } else {
        this.errorMessage = connection.errorMessage;
      }
    });
  }
}
