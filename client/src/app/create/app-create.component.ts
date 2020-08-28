import { Component } from '@angular/core';
import { ManagementService } from '../shared/management.service';
import { GameConfig } from '../shared/types/game-config';
import { Set } from '../shared/types/set';
import { GameConnection } from '../shared/types/game-connection';
import { Router } from '@angular/router';
import { ScryfallService } from '../shared/scryfall.service';
import { take } from 'rxjs/operators';
import { CubeService } from '../shared/cube.service';
import { Cube } from '../shared/types/cube';

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

  public get useCube(): boolean {
    return this._useCube;
  }
  public set useCube(value: boolean) {
    this._useCube = value;
    this.game.sets = value ? [this.cubes[0].code] : [this.sets[0].code];
  }
  private _useCube: boolean = false;

  public sets: Set[] = [];
  public cubes: Set[] = [];
  public errorMessage: string;

  constructor(
    private managementService: ManagementService,
    private router: Router,
    private scryfall: ScryfallService,
    private cubeService: CubeService
  ) {
    this.scryfall.getSets().pipe(take(1)).subscribe((sets: Set[]) => {
      this.sets = sets;
      this.game.sets = [sets[0].code];
    });
    this.cubeService.getAllCubes().pipe(take(1)).subscribe((cubes: Cube[]) => {
      this.cubes = cubes.map(cube => ({ name: cube.name, code: cube.cubeId }));
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
