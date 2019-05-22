import { Component, OnDestroy } from '@angular/core';
import { GameService } from '../shared/game.service';
import { ExportService } from '../shared/export.service';
import { Card } from '../shared/types/card';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { TabletopResponse } from '../shared/types/tabletop-response';

@Component({
  selector: 'app-export',
  templateUrl: './app-export.component.html',
  styleUrls: ['./app-export.component.css']
})
export class AppExportComponent implements OnDestroy {
  public cards: Card[] = [];
  public code: string;
  public playerId: string;
  public copiedState = false;
  public tabletopGetState: string;

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

  public tabletopDataListener: any;

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
      if (config.cards && config.cards.length > 0) {
        const cardDict = {};
        for (const card of config.cards) {
          if (!(card.name in cardDict)) {
            cardDict[card.name] = card;
            cardDict[card.name].count = 0;
          }
          cardDict[card.name].count += 1;
        }
        this.cards = Object.values(cardDict);
        this.gameService.stopListener();
      }
    });
  }

  public ngOnDestroy() {
    this.gameService.stopListener();
    this.stopListener();
  }

  public copyText() {
    const el = document.createElement('textarea');
    el.value = this.cardListText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.notifyCopied();
  }

  public getTabletopData(): void {
    if (!this.tabletopDataListener) {
      this.checkForTabletopData();
      this.tabletopDataListener = setInterval(() => this.checkForTabletopData(), 3000);
    }
  }

  public stopListener(): void {
    if (this.tabletopDataListener) {
      clearInterval(this.tabletopDataListener);
      this.tabletopDataListener = undefined;
    }
  }

  public checkForTabletopData(): void {
    this.exportService.getTabletopJson(this.code, this.playerId).subscribe((value: TabletopResponse) => {
      this.tabletopGetState = value.state;
      if (!value.isProcessing && value.data) {
        this.stopListener();
        const blob = new Blob([JSON.stringify(value.data)], { type: 'text/json' });
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = 'draft-pool.json';

        // Append anchor to body.
        document.body.appendChild(a);
        a.click();

        // Remove anchor from body
        document.body.removeChild(a);
      }
    });
  }

  private notifyCopied() {
    this.copiedState = true;
    setTimeout(() => {
      this.copiedState = false;
    }, 2000);
  }
}
