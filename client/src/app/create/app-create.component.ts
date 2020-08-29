import { Component } from '@angular/core';
import { ManagementService } from '../shared/management.service';
import { GameConfig } from '../shared/types/game-config';
import { Set } from '../shared/types/set';
import { GameConnection } from '../shared/types/game-connection';
import { Router, ActivatedRoute } from '@angular/router';
import { ScryfallService } from '../shared/scryfall.service';
import { take, finalize } from 'rxjs/operators';
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

  public get selectedSet() {
    return this.game.sets[0];
  }
  public set selectedSet(value: string) {
    this.game.sets = [value, this.selectedSecondSet, this.selectedThirdSet].filter(Boolean);
  }

  public get selectedSecondSet() {
    if (this.game.sets.length > 1) {
      return this.game.sets[1];
    }
    return undefined;
  }
  public set selectedSecondSet(value: string) {
    this.game.sets = [this.selectedSet, value, this.selectedThirdSet].filter(Boolean);
  }

  public get selectedThirdSet() {
    if (this.game.sets.length > 2) {
      return this.game.sets[2];
    }
    return undefined;
  }
  public set selectedThirdSet(value: string) {
    this.game.sets = [this.selectedSet, this.selectedSecondSet, value].filter(Boolean);
  }

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
  public message: string;
  public errorMessage: string;
  public isWaiting = false;

  constructor(
    private managementService: ManagementService,
    private router: Router,
    private route: ActivatedRoute,
    private scryfall: ScryfallService,
    private cubeService: CubeService
  ) {
    this.route.queryParamMap.pipe(take(1)).subscribe(paramMap => {
      if (paramMap.has('message')) {
        this.message = paramMap.get('message');
      }
    });
    this.isWaiting = true;
    this.scryfall.getSets()
      .pipe(
        take(1),
        finalize(() => this.isWaiting = false)
      ).subscribe((sets: Set[]) => {
        this.sets = sets;
        this.game.sets = [sets[0].code];
    });
    this.cubeService.getAllCubes().pipe(take(1)).subscribe((cubes: Cube[]) => {
      this.cubes = cubes.map(cube => ({ name: cube.name, code: cube.cubeId }));
    });
  }

  public addSet(): void {
    if (!this.useCube && this.game.sets.length < 3) {
      if (!this.selectedSecondSet) {
        this.selectedSecondSet = this.selectedSet;
      } else {
        this.selectedThirdSet = this.selectedSet;
      }
    }
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
    this.isWaiting = true;
    this.managementService.createGame(this.game)
      .pipe(finalize(() => this.isWaiting = false))
      .subscribe((connection: GameConnection) => {
        if (connection.success) {
          this.router.navigate(['/draft', connection.code, connection.playerId]);
        } else {
          this.errorMessage = connection.errorMessage;
        }
    });
  }
}
