import { Component } from '@angular/core';
import { Card } from '../shared/types/card';
import { finalize } from 'rxjs/operators';
import { ScryfallService } from '../shared/scryfall.service';
import { CardQuery } from '../shared/types/card-query';
import { CubeService } from '../shared/cube.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cube-management',
  templateUrl: './app-cube-management.component.html',
  styleUrls: ['./app-cube-management.component.css']
})
export class AppCubeManagementComponent {
  public cards: Card[] = [];
  public cardsNotFound: CardQuery[] = [];

  public cardListText: string = '';
  public editing = true;
  public cubeName = '';
  public isWaiting = false;

  constructor(
    private router: Router,
    private scryfallService: ScryfallService,
    private cubeService: CubeService
  ) {}

  public saveAsCube(): void {
    if (
      !this.editing &&
      this.cubeName &&
      this.cards &&
      this.cards.length > 0
    ) {
      this.cubeService.save({
        name: this.cubeName.trim(),
        cardNames: this.cards.map(card => card.name)
      }).subscribe(_ => {
        this.router.navigate(['/create'], {
          queryParams: {
            'message': this.cubeName + ' has been published. Care to try it out?'
          }
        });
      });
    }
  }

  public generateProxies(): void {
    this.isWaiting = true;
    this.cards = [];
    this.cardsNotFound = [];
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

    this.scryfallService.queryForProxy(cards)
      .pipe(finalize(() => this.isWaiting = false))
      .subscribe(results => {
        const newCardList = [];
        const cardsNotFound = [];

        for (let card of cards) {
          let match = results.find(queryCard => queryCard.name.toLowerCase() === card.name.toLowerCase());
          if (!match) {
            match = results.find(queryCard => queryCard.name.toLowerCase().indexOf(card.name.toLowerCase()) >= 0);
          }
          if (match) {
            for (let i = 0; i < card.count; i++) {
              for (let cardFace of match.faces) {
                newCardList.push({
                  ...match,
                  imageUrl: cardFace.imageUrl,
                  imageUrlCropped: cardFace.imageUrlCropped
                });
              }
            }
          } else {
            cardsNotFound.push(card);
          }
        }

        this.cards = newCardList;
        this.cardsNotFound = cardsNotFound;
    });
  }

  public getCardsNotFoundString(): string {
    return this.cardsNotFound.map(card => card.name + (card.set ? ' (' + card.set + ')' : '')).join(', ')
  }
}
