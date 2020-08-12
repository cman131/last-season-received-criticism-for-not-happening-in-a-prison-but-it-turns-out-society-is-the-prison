export interface Card {
  id: string;
  name: string;
  imageUrl: string;
  imageUrlCropped?: string;
  description: string;
  set?: string;
  cmc?: number;
  colors?: string[];
  count?: number;
  unlimited?: boolean;
}
