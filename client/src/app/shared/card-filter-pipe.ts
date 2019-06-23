import { Pipe, PipeTransform } from '@angular/core';
import { Card } from './types/card';

export interface CardFilters {
  color: CardColorFilter;
  search: string;
}

export interface CardColorFilter {
  isExact: boolean;
  white: boolean;
  blue: boolean;
  black: boolean;
  red: boolean;
  green: boolean;
  colorless: boolean;
}

@Pipe({
  name: 'cardFilter',
  pure: false
})
export class CardFilterPipe  implements PipeTransform {
  transform(array: Card[], filters: CardFilters): any[] {
    const newArr = array.filter((a: Card) =>
      this.searchMatch(a, filters.search) &&
      this.matchesColors(a.colors, filters.color)
    );
    return newArr;
  }

  public searchMatch(card: Card, searchText: string): boolean {
    if (!searchText) {
      return true;
    }

    return card.name.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 ||
      card.description.toLowerCase().indexOf(searchText.toLowerCase()) >= 0;
  }

  public matchesColors(colors: string[], colorFilter: CardColorFilter): boolean {
    if (!colorFilter.isExact) {
      return this.colorMatch(colors, 'white', colorFilter) ||
        this.colorMatch(colors, 'blue', colorFilter) ||
        this.colorMatch(colors, 'black', colorFilter) ||
        this.colorMatch(colors, 'black', colorFilter) ||
        this.colorMatch(colors, 'red', colorFilter) ||
        this.colorMatch(colors, 'green', colorFilter) ||
        this.colorMatch(colors, 'colorless', colorFilter);
    }
    return this.colorMatch(colors, 'white', colorFilter) &&
      this.colorMatch(colors, 'blue', colorFilter) &&
      this.colorMatch(colors, 'black', colorFilter) &&
      this.colorMatch(colors, 'black', colorFilter) &&
      this.colorMatch(colors, 'red', colorFilter) &&
      this.colorMatch(colors, 'green', colorFilter) &&
      this.colorMatch(colors, 'colorless', colorFilter);
  }

  public colorMatch(colors: string[], colorKey: string, colorFilter: CardColorFilter): boolean {
    if (colorKey === 'colorless') {
      return colorFilter[colorKey] && (colors.length === 0);
    }
    return colorFilter[colorKey] && colors.indexOf(colorKey) >= 0;
  }
}
