import { Card } from './card';

export interface GameConfig {
  name?: string;
  maxPlayers?: number;
  sets?: string[];
  code?: string;
  isPassingLeft?: boolean;
  playerId?: string;
  players?: string[];
  packsReady?: boolean;
  cards?: Card[];
  currentPack?: Card[];
  state?: number;
  done?: boolean;
}
