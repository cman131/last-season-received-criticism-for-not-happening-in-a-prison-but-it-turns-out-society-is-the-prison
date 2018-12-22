import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { GameConfig } from '../shared/types/game-config';
import { GameService } from '../shared/game.service';
import { take } from 'rxjs/operators';
import { Card } from '../shared/types/card';
import { ScryfallService } from '../shared/scryfall.service';

@Component({
  selector: 'app-draft',
  templateUrl: './app-draft.component.html',
  styleUrls: ['./app-draft.component.css']
})
export class AppDraftComponent implements OnInit, OnDestroy {
  public backupImg = "https://d1u5p3l4wpay3k.cloudfront.net/mtgsalvation_gamepedia/thumb/f/f8/Magic_card_back.jpg/200px-Magic_card_back.jpg?version=4f6a80129fc99f07b7723141b122def4";
  public gameConfig: GameConfig = {
    code: '',
    players: [],
    currentPack: []
  };
  public browseCards = false;
  public selectedCard: Card = {
    id: '',
    name: '',
    description: '',
    imageUrl: ''
  };

  public currentPack = [];

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private scryfall: ScryfallService
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
        this.scryfall.getCards(config.currentPack).pipe(take(1)).subscribe(cards => this.currentPack = cards);
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
}