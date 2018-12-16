import { Component } from "@angular/core";
import { GameService } from '../shared/game.service';
import { Card } from '../shared/types/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-export',
  templateUrl: './app-export.component.html',
  styleUrls: ['./app-export.component.css']
})
export class AppExportComponent {
  public cards: Card[] = [];

  public get cardListText(): string {
    let text = '';
    if (this.cards) {
      for (let card of this.cards) {
        text += card.count + ' ' + card.name + "\n";
      }
    }
    return text;
  }

  constructor(
    private router: Router,
    private gameService: GameService
  ) {
    this.gameService.gameConfig.subscribe(config => {
      if (!config.cards) {
        router.navigate(['']);
      } else {
        let cardDict = {};
        for (let card of config.cards) {
          if (!(card.name in cardDict)) {
            cardDict[card.name] = card;
            cardDict[card.name].count = 0;
          }
          cardDict[card.name].count += 1;
        }
        this.cards = Object.values(cardDict);
      }
    });
  }

  public copyText() {
    let field: any = document.getElementById('text-output');
    field.select();
    document.execCommand("copy");
  }
  
  public download() {
    // do stuff
  }
}