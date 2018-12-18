import { Player } from './player';
import { Card } from './card';

export interface GameConfig {
  name?: string;
  numberOfPlayers?: number;
  sets?: string[];
  code?: string;
  playerId?: string;
  players?: Player[];
  cards?: Card[];
  currentPack?: string[];
  status?: number;
  done?: boolean;
}