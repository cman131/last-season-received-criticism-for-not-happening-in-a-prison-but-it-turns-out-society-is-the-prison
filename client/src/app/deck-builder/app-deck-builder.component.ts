import { Card } from '../shared/types/card';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { GameService } from '../shared/game.service';
import { take } from 'rxjs/operators';
import { OnDestroy, Component } from '@angular/core';
import { CardFilters, CardFilterPipe } from '../shared/card-filter-pipe';
import { SortPipe } from '../shared/sort-pipe';

@Component({
  selector: 'app-deck-builder',
  templateUrl: './app-deck-builder.component.html',
  styleUrls: ['./app-deck-builder.component.css']
})
export class AppDeckBuilderComponent implements OnDestroy {
  public cards: Card[] = [];
  public code: string;
  public playerId: string;
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
    search: ''
  };

  public activeDeck: Card[] = [];
  public selectedCard: Card = {
    id: '',
    name: '',
    description: '',
    imageUrl: ''
  };

  public backupImg =
  // tslint:disable-next-line:max-line-length
  'https://c-4tvylwolbz88x24nhtlwlkphx2ejbyzljkux2ejvt.g00.gamepedia.com/g00/3_c-4tan.nhtlwlkph.jvt_/c-4TVYLWOLBZ88x24oaawzx3ax2fx2fnhtlwlkph.jbyzljku.jvtx2ftanzhschapvu_nhtlwlkphx2fmx2fm5x2fThnpj_jhyk_ihjr.qwnx3fclyzpvux3d7kkj5k18j0i36j9j0j1ii2k49336mmk4_$/$/$/$/$?i10c.ua=1&i10c.dv=15';
  public landNames = ['forest', 'mountain', 'swamp', 'plains', 'island'];
  public lands: Card[] = [
    {
      id: 'a9d61651-349e-40d0-a7c4-c9561e190405',
      name: 'Forest',
      description: '({T}: Add {G}.)',
      imageUrl: 'https://img.scryfall.com/cards/large/front/5/8/58fe058d-7796-4233-8d74-2a12f9bd0023.jpg?1543675077',
      count: 1,
      cmc: 0,
      colors: [],
      unlimited: true
    },
    {
      id: '7014b9fc-a906-4ffd-a482-22ba8dbe3b4a',
      name: 'Island',
      description: '({T}: Add {U}.)',
      imageUrl: 'https://img.scryfall.com/cards/large/front/0/b/0ba8851d-0b25-4232-acd3-594b5b25f16e.jpg?1543675020',
      count: 1,
      cmc: 0,
      colors: [],
      unlimited: true
    },
    {
      id: '489fdba7-5c25-4cf3-a1e0-3e0fda6c6ee6',
      name: 'Mountain',
      description: '({T}: Add {R}.)',
      imageUrl: 'https://img.scryfall.com/cards/large/front/4/9/49ac3fd1-f732-4d96-ac93-560e4e86051e.jpg?1543675054',
      count: 1,
      cmc: 0,
      colors: [],
      unlimited: true
    },
    {
      id: '24eeb424-235d-4346-9355-57914e740ec6',
      name: 'Swamp',
      description: '({T}: Add {B}.)',
      imageUrl: 'https://img.scryfall.com/cards/large/front/8/b/8bc682cd-b13b-4670-913c-70542f161316.jpg?1543675036',
      count: 1,
      cmc: 0,
      colors: [],
      unlimited: true
    },
    {
      id: 'd92ef517-2417-43a2-8b1a-0673d1531c65',
      name: 'Plains',
      description: '({T}: Add {W}.)',
      imageUrl: 'https://img.scryfall.com/cards/large/front/f/e/feada93b-aabf-45d6-ac46-98b33caf9112.jpg?1543675002',
      count: 1,
      cmc: 0,
      colors: [],
      unlimited: true
    }
  ];

  public getKeys = Object.keys;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService
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
          if (this.landNames.indexOf(card.name.toLowerCase()) < 0) {
            if (!(card.name in cardDict)) {
              cardDict[card.name] = card;
              cardDict[card.name].count = 0;
            }
            cardDict[card.name].count += 1;
            cardDict[card.name].unlimited = false;
          }
        }
        this.cards = Object.values(cardDict);
        this.cards = this.cards.concat(this.lands);
        this.gameService.stopListener();
      }
    });
  }

  public ngOnDestroy() {
    this.gameService.stopListener();
  }

  public addCard(card: Card) {
    if (card.count > 0) {
      const filteredDeck = this.activeDeck.filter(item => item.name === card.name);
      if (filteredDeck.length > 0) {
        filteredDeck.pop().count += 1;
      } else {
        this.activeDeck.push({
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
    const filteredCollection = this.cards.filter(item => item.name === card.name);
    if (!card.unlimited && filteredCollection.length > 0) {
      filteredCollection.pop().count += 1;
    } else if (!card.unlimited) {
      this.cards.push({
        ...card,
        count: 1
      });
    }
    if (card.count <= 1) {
      this.activeDeck = this.activeDeck.filter(item => item.name !== card.name);
    } else {
      card.count -= 1;
    }
  }

  public updateSelected(card: Card) {
    this.selectedCard = card;
  }

  public getDescriptions(description) {
    return description.split('<br/>');
  }
}
