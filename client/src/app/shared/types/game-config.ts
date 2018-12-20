import { Card } from './card';

export interface GameConfig {
  name?: string;
  maxPlayers?: number;
  sets?: string[];
  code?: string;
  playerId?: string;
  players?: string[];
  cards?: Card[];
  currentPack?: string[];
  state?: number;
  done?: boolean;
}