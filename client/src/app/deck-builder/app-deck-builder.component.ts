import { Card } from '../shared/types/card';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { GameService } from '../shared/game.service';
import { take } from 'rxjs/operators';
import { OnDestroy, Component } from '@angular/core';
import { CardFilters, CardFilterPipe } from '../shared/card-filter-pipe';
import { SortPipe } from '../shared/sort-pipe';
import { DeckService } from '../shared/deck.service';
import { Deck } from '../shared/types/deck';
import { LandRef } from '../shared/land-ref';

@Component({
  selector: 'app-deck-builder',
  templateUrl: './app-deck-builder.component.html',
  styleUrls: ['./app-deck-builder.component.css']
})
export class AppDeckBuilderComponent implements OnDestroy {
  public filters: CardFilters = {
    color: {
      isExact: false,
      white: true,
      blue: true,
      black: true,
      red: true,
      green: true,
      colorless: true
    },
    search: '',
  };
  public showFilters = false;
  public showManagement = true;

  public deckList: Deck[] = [];
  public activeDeck: Deck = {
    playerId: '',
    gameId: '',
    name: '',
    mainBoard: [],
    sideBoard: []
  };
  public selectedCard: Card = {
    id: '',
    name: '',
    description: '',
    imageUrl: ''
  };

  public backupImg =
  // tslint:disable-next-line:max-line-length
  'https://c-4tvylwolbz88x24nhtlwlkphx2ejbyzljkux2ejvt.g00.gamepedia.com/g00/3_c-4tan.nhtlwlkph.jvt_/c-4TVYLWOLBZ88x24oaawzx3ax2fx2fnhtlwlkph.jbyzljku.jvtx2ftanzhschapvu_nhtlwlkphx2fmx2fm5x2fThnpj_jhyk_ihjr.qwnx3fclyzpvux3d7kkj5k18j0i36j9j0j1ii2k49336mmk4_$/$/$/$/$?i10c.ua=1&i10c.dv=15';
  public landNames = LandRef.landNames;
  public lands = LandRef.lands;

  public isSaving = false;
  public isLoading = true;
  public getKeys = Object.keys;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private deckService: DeckService,
    private router: Router
  ) {
    this.route.paramMap.pipe(take(1)).subscribe((params: ParamMap) => {
      this.activeDeck.gameId = params.get('code');
      this.activeDeck.playerId = params.get('player');
      this.activeDeck.deckId = params.get('deckId') || undefined;
      this.deckService.reloadDeckList(this.activeDeck.playerId, this.activeDeck.gameId);
      if (this.activeDeck.deckId) {
        this.load(this.activeDeck.deckId);
      } else {
        this.gameService.setConfigListener(this.activeDeck.gameId, this.activeDeck.playerId);
        this.gameService.gameConfig.subscribe(config => {
          if (config.cards && config.cards.length > 0) {
            const cardDict = {};
            for (const card of config.cards) {
              if (this.landNames.indexOf(card.name.toLowerCase()) < 0) {
                if (!(card.name in cardDict)) {
                  cardDict[card.name] = card;
                  cardDict[card.name].count = 0;
                }
                cardDict[card.name].count += 1;
                cardDict[card.name].unlimited = false;
              }
            }
            this.activeDeck.sideBoard = Object.values(cardDict);
            this.activeDeck.sideBoard = this.activeDeck.sideBoard.concat(this.lands);
            this.gameService.stopListener();
            this.isLoading = false;
          }
        });
      }
    });

    this.deckService.deckList.subscribe(deckList => {
      this.deckList = deckList;
    });
  }

  public ngOnDestroy() {
    this.gameService.stopListener();
  }

  public addCard(card: Card) {
    if (card.count > 0) {
      const filteredDeck = this.activeDeck.mainBoard.filter(item => item.name === card.name);
      if (filteredDeck.length > 0) {
        filteredDeck.pop().count += 1;
      } else {
        this.activeDeck.mainBoard.push({
          ...card,
          count: 1
        });
      }
      if (!card.unlimited) {
        card.count -= 1;
      }
    }
  }

  public removeCard(card: Card) {
    const filteredCollection = this.activeDeck.sideBoard.filter(item => item.name === card.name);
    if (!card.unlimited && filteredCollection.length > 0) {
      filteredCollection.pop().count += 1;
    } else if (!card.unlimited) {
      this.activeDeck.sideBoard.push({
        ...card,
        count: 1
      });
    }
    if (card.count <= 1) {
      this.activeDeck.mainBoard = this.activeDeck.mainBoard.filter(item => item.name !== card.name);
    } else {
      card.count -= 1;
    }
  }

  public load(deckId): void {
    this.isLoading = true;
    this.deckService.load(this.activeDeck.playerId, this.activeDeck.gameId, deckId).subscribe((deck: Deck) => {
      this.isLoading = false;
      if (deck && deck.sideBoard && deck.sideBoard.length > 0) {
        this.activeDeck = deck;
      }
    });
  }

  public save(): void {
    if (!this.isSaving && this.activeDeck.name) {
      this.isSaving = true;
      this.deckService.save(
        this.activeDeck.playerId,
        this.activeDeck.gameId,
        this.activeDeck
      ).subscribe((deckId) => {
        this.isSaving = false;
        this.activeDeck.deckId = deckId;
        this.deckService.reloadDeckList(this.activeDeck.playerId, this.activeDeck.gameId);
      });
    }
  }

  public updateSelected(card: Card) {
    this.selectedCard = card;
  }

  public getDescriptions(description) {
    return description.split('<br/>');
  }

  public getCardCount(cards: Card[]) {
    if (cards.length === 0) {
      return 0;
    }
    return cards.map(card => card.count).reduce((prev, cur) => prev + cur);
  }

  public getSaveButtonTitle() {
    if (this.isSaving) {
      return 'Saving...';
    } else if (!this.activeDeck.name) {
      return 'Please give the deck a name before saving.';
    } else {
      return 'Save this deck';
    }
  }
}
