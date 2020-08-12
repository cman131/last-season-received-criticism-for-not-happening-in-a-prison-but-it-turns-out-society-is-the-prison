import { Component } from '@angular/core';
import { GameService } from '../shared/game.service';
import { Card } from '../shared/types/card';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { LandRef } from '../shared/land-ref';
import { ScryfallService } from '../shared/scryfall.service';

@Component({
  selector: 'app-proxy',
  templateUrl: './app-proxy.component.html',
  styleUrls: ['./app-proxy.component.css']
})
export class AppProxyComponent {
  public cards: Card[] = [];
  public code: string;
  public playerId: string;

  public cardListText: string = '';
  public editing = true;
  public useCropped = true;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private scryfallService: ScryfallService
  ) {
    this.route.paramMap.pipe(take(1)).subscribe((params: ParamMap) => {
      this.code = params.get('code');
      this.playerId = params.get('player');
      if (this.code && this.playerId) {
        this.gameService.setConfigListener(this.code, this.playerId);
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
            this.cardListText = this.getCardListText();
            this.gameService.stopListener();
          }
        });
      }
    });
  }

  public getCardListText(): string {
    let text = '';
    if (this.cards) {
      for (const card of this.cards) {
        // tslint:disable-next-line:quotemark
        text += card.count + ' ' + card.name + "\n";
      }
    }
    return text;
  }

  public generateProxies(): void {
    this.cards = [];
    this.editing = false;
    let rawCards = this.cardListText.split("\n");
    const cards = rawCards.map(card => card.trim())
      .filter(Boolean)
      .map(card => {
        const nameSetSplit = card.split('|').map(card => card.trim());
        let set: string = undefined;
        if (nameSetSplit.length > 1) {
          set = nameSetSplit[1];
        }

        const cardParts = nameSetSplit[0].split(' ');
        const count = parseInt(cardParts.shift());

        if (isNaN(count)) {
          return {
            count: 1,
            name: nameSetSplit[0],
            set: set
          };
        } else {
          return {
            count: count,
            name: cardParts.join(' ').trim(),
            set: set
          };
        }
    });
    this.scryfallService.queryForProxy(cards).subscribe(results => {
      const newCardList = [];
      for (let card of results) {
        const match = cards.find(queryCard => queryCard.name.toLowerCase() === card.name.toLowerCase());
        if (match) {
          for (let i = 0; i < match.count; i++) {
            newCardList.push(card);
          }
        }
      }

      this.cards = newCardList;
    });
  }

  public ngOnDestroy() {
    this.gameService.stopListener();
  }
}
