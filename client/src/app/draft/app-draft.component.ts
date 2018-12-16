import { Component, OnInit } from "@angular/core";
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
export class AppDraftComponent implements OnInit {
  public gameConfig: GameConfig = {};
  public browseCards = false;
  public selectedCard = {};

  public currentPack = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private scryfall: ScryfallService
  ) { }

  public ngOnInit() {
    this.route.paramMap.pipe(take(1)).subscribe((params: ParamMap) => {
      this.gameConfig.code = params.get('code');
      this.gameConfig.playerId = params.get('player');
      this.gameService.setConfig(this.gameConfig);
    });
    this.gameService.gameConfig.subscribe(config => {
        if (this.gameConfig.currentPack !== config.currentPack && config.currentPack.length > 0) {
          this.scryfall.getCards(config.currentPack).pipe(take(1)).subscribe(cards => this.currentPack = cards);
        }
        this.gameConfig = config;
      }
    );
  }

  public submitChoice(card: Card) {
    this.gameService.submitCardChoice(card);
  }

  public updateSelected(card: Card) {
    this.selectedCard = card;
  }
}