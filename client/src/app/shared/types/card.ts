import { CardFace } from './card-face';

export interface Card {
  id: string;
  name: string;
  imageUrl: string;
  imageUrlCropped?: string;
  faces?: CardFace[];
  description: string;
  set?: string;
  cmc?: number;
  colors?: string[];
  count?: number;
  unlimited?: boolean;
}
