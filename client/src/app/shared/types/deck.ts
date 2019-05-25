import { Card } from './card';

export interface Deck {
  deckId?: string;
  gameId: string;
  playerId: string;
  name: string;
  dateCreated?: Date;
  dateModified?: Date;
  mainBoard?: Card[];
  sideBoard?: Card[];
}
