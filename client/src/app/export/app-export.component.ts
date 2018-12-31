import { Component, OnDestroy } from '@angular/core';
import { GameService } from '../shared/game.service';
import { ExportService } from '../shared/export.service';
import { Card } from '../shared/types/card';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-export',
  templateUrl: './app-export.component.html',
  styleUrls: ['./app-export.component.css']
})
export class AppExportComponent implements OnDestroy {
  public cards: Card[] = [];
  public code: string;
  public playerId: string;

  public get cardListText(): string {
    let text = '';
    if (this.cards) {
      for (const card of this.cards) {
        // tslint:disable-next-line:quotemark
        text += card.count + ' ' + card.name + "\n";
      }
    }
    return text;
  }

  public tabletopData: string;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private exportService: ExportService
  ) {
    this.route.paramMap.pipe(take(1)).subscribe((params: ParamMap) => {
      this.code = params.get('code');
      this.playerId = params.get('player');
      this.gameService.setConfigListener(this.code, this.playerId);
    });

    this.gameService.gameConfig.subscribe(config => {
      if (config.cards) {
        const cardDict = {};
        for (const card of config.cards) {
          if (!(card.name in cardDict)) {
            cardDict[card.name] = card;
            cardDict[card.name].count = 0;
          }
          cardDict[card.name].count += 1;
        }
        this.cards = Object.values(cardDict);
      }
    });

    // change the route for export to include game and player ids
    this.tabletopData = this.exportService.getTabletopConvertUrl(this.code, this.playerId);
  }

  public ngOnDestroy() {
    this.gameService.stopListener();
  }

  public copyText() {
    const field: any = document.getElementById('text-output');
    field.select();
    document.execCommand('copy');
  }
}
