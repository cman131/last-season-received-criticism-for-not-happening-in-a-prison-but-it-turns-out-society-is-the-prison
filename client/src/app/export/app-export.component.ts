import { Component, OnDestroy } from '@angular/core';
import { GameService } from '../shared/game.service';
import { ExportService } from '../shared/export.service';
import { Card } from '../shared/types/card';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { TabletopResponse } from '../shared/types/tabletop-response';
import { DeckService } from '../shared/deck.service';
import { Deck } from '../shared/types/deck';
import { LandRef } from '../shared/land-ref';

@Component({
  selector: 'app-export',
  templateUrl: './app-export.component.html',
  styleUrls: ['./app-export.component.css']
})
export class AppExportComponent implements OnDestroy {
  public cards: Card[] = [];
  public deck: Deck;
  public sideboardCards: Card[];
  public code: string;
  public playerId: string;
  public deckId: string;
  public isForUntapIn = true;

  public deckActive = false;
  public copiedState = false;
  public deckCopiedState = false;
  public sideboardCopiedState = false;

  public tabletopGetState: string;
  public deckTabletopGetState: string;

  public lands = LandRef.lands;

  public get cardListText(): string {
    let text = '';
    if (this.cards) {
      text = this.getCardListText(this.cards.concat(this.lands));
    }
    return text;
  }

  public get deckListText(): string {
    let text = '';
    if (this.deck.mainBoard) {
      text = this.getCardListText(this.deck.mainBoard);
    }
    return text;
  }

  public get deckListSideboardText(): string {
    let text = '';
    if (this.deck.mainBoard && this.cards) {
      if (!this.sideboardCards) {
        this.populateSideboard();
      }
      text = this.getCardListText(this.sideboardCards);
    }
    return text;
  }

  public tabletopDataListener: any;
  public deckTabletopDataListener: any;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private exportService: ExportService,
    private deckService: DeckService
  ) {
    this.route.paramMap.pipe(take(1)).subscribe((params: ParamMap) => {
      this.code = params.get('code');
      this.playerId = params.get('player');
      this.deckId = params.get('deckId');
      this.gameService.setConfigListener(this.code, this.playerId);
      if (this.deckId) {
        this.deckActive = true;
        this.deckService.load(this.playerId, this.code, this.deckId).subscribe((deck) => {
          this.deck = deck;
        });
      }
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
    this.stopDeckListener();
  }

  public copyText(text, isDeck = false, isSideboard = false) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.notifyCopied(isDeck, isSideboard);
  }

  public getTabletopData(): void {
    if (!this.tabletopDataListener) {
      this.tabletopDataListener = setInterval(() => this.checkForTabletopData(), 3000);
      this.checkForTabletopData();
    }
  }

  public getDeckTabletopData(): void {
    if (!this.deckTabletopDataListener) {
      this.deckTabletopDataListener = setInterval(() => this.checkForDeckTabletopData(), 3000);
      this.checkForDeckTabletopData();
    }
  }

  public stopListener(): void {
    if (this.tabletopDataListener) {
      clearInterval(this.tabletopDataListener);
      this.tabletopDataListener = undefined;
    }
  }

  public stopDeckListener(): void {
    if (this.deckTabletopDataListener) {
      clearInterval(this.deckTabletopDataListener);
      this.deckTabletopDataListener = undefined;
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

  public checkForDeckTabletopData(): void {
    this.exportService.getDeckTabletopJson(this.code, this.playerId, this.deckId).subscribe((value: TabletopResponse) => {
      this.deckTabletopGetState = value.state;
      if (!value.isProcessing && value.data) {
        this.stopDeckListener();
        const blob = new Blob([JSON.stringify(value.data)], { type: 'text/json' });
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = this.deck.name + '.json';

        // Append anchor to body.
        document.body.appendChild(a);
        a.click();

        // Remove anchor from body
        document.body.removeChild(a);
      }
    });
  }

  private getCardListText(cards: Card[]) {
    let text = '';
    for (const card of cards) {
      if (this.isForUntapIn) {
        const face1Name = card.name.split('//')[0].trim();
        text += card.count + ' ' + face1Name + "\n";
      } else {
        text += card.count + ' ' + card.name + "\n";
      }
    }
    return text
  }

  private populateSideboard() {
    this.sideboardCards = [...this.deck.sideBoard].filter(card =>
      !this.lands.find(landCard => landCard.name.toLowerCase() === card.name.toLowerCase()) && card.count > 0
    );

    for (let card of this.lands) {
      this.sideboardCards.push({ ...card, count: 20 });
    }
  }

  private notifyCopied(isDeck = false, isSideboard = false) {
    if (!isDeck) {
      this.copiedState = true;
      setTimeout(() => {
        this.copiedState = false;
      }, 2000);
    } else if (!isSideboard) {
      this.deckCopiedState = true;
      setTimeout(() => {
        this.deckCopiedState = false;
      }, 2000);
    } else {
      this.sideboardCopiedState = true;
      setTimeout(() => {
        this.sideboardCopiedState = false;
      }, 2000);
    }
  }
}
