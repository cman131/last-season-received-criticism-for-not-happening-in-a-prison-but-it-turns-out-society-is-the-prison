export interface Card {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  cmc?: number;
  colors?: string[];
  count?: number;
  unlimited?: boolean;
}
