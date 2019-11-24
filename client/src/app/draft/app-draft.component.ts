import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { GameConfig } from '../shared/types/game-config';
import { GameService } from '../shared/game.service';
import { take } from 'rxjs/operators';
import { Card } from '../shared/types/card';

@Component({
  selector: 'app-draft',
  templateUrl: './app-draft.component.html',
  styleUrls: ['./app-draft.component.css']
})
export class AppDraftComponent implements OnInit, OnDestroy {
  public backupImg =
  // tslint:disable-next-line:max-line-length
  'https://c-4tvylwolbz88x24nhtlwlkphx2ejbyzljkux2ejvt.g00.gamepedia.com/g00/3_c-4tan.nhtlwlkph.jvt_/c-4TVYLWOLBZ88x24oaawzx3ax2fx2fnhtlwlkph.jbyzljku.jvtx2ftanzhschapvu_nhtlwlkphx2fmx2fm5x2fThnpj_jhyk_ihjr.qwnx3fclyzpvux3d7kkj5k18j0i36j9j0j1ii2k49336mmk4_$/$/$/$/$?i10c.ua=1&i10c.dv=15';

  public gameConfig: GameConfig = {
    code: '',
    players: [],
    currentPack: []
  };

  public showPlayers = false;
  public browseCards = false;

  public selectedCard: Card = {
    id: '',
    name: '',
    description: '',
    imageUrl: ''
  };

  public currentPack = [];

  public get rightPlayer() {
    let index = this.gameConfig.players.indexOf(this.gameConfig.name) - 1;
    index = index < 0 ? this.gameConfig.players.length - 1 : index;
    return this.gameConfig.players[index];
  }

  public get leftPlayer() {
    let index = this.gameConfig.players.indexOf(this.gameConfig.name) + 1;
    index = index >= this.gameConfig.players.length ? 0 : index;
    return this.gameConfig.players[index];
  }

  public get nextPlayer() {
    if (this.gameConfig.isPassingLeft) {
      return this.rightPlayer;
    }
    return this.leftPlayer;
  }

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService
  ) { }

  public ngOnInit() {
    this.route.paramMap.pipe(take(1)).subscribe((params: ParamMap) => {
      this.gameConfig.code = params.get('code');
      this.gameConfig.playerId = params.get('player');
      this.gameService.setConfigListener(this.gameConfig.code, this.gameConfig.playerId);
    });

    this.gameService.gameConfig.subscribe(config => {
      if (config
        && config.currentPack
        && this.gameConfig.currentPack !== config.currentPack
        && config.currentPack.length > 0
      ) {
        this.currentPack = config.currentPack;
      } else if ( config && config.currentPack && config.currentPack.length === 0) {
        this.currentPack = [];
      }
      if (config) {
        this.gameConfig = config;
      }
    });
  }

  public ngOnDestroy() {
    this.gameService.stopListener();
  }

  public startGame() {
    this.gameService.startGame();
  }

  public submitChoice(card: Card) {
    this.gameService.submitCardChoice(card);
  }

  public updateSelected(card: Card) {
    this.selectedCard = card;
  }

  public getDescriptions(description) {
    return description.split('<br/>');
  }
}
