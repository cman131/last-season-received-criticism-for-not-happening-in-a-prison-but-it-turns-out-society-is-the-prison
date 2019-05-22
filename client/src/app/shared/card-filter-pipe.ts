import { Pipe, PipeTransform } from '@angular/core';
import { Card } from './types/card';

export interface CardFilters {
  colors: {
    white: boolean,
    blue: boolean,
    black: boolean,
    red: boolean,
    green: boolean,
    colorless: boolean
  };
  search: string;
}

@Pipe({
  name: 'cardFilter'
})
export class CardFilterPipe  implements PipeTransform {
  transform(array: Card, filters: CardFilters): any[] {
    if (!Array.isArray(array)) {
      return;
    }
    array.filter((a: Card) =>
      a.name.toLowerCase().indexOf(filters.search.toLowerCase()) ||
      a.description.toLowerCase().indexOf(filters.search.toLowerCase())
    );
    return array;
  }
}
