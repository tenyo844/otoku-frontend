export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DealContent {
  url: string;
  title?: string;
  summary: string; // 店舗Webサイトから取得した特売テキスト
}

export interface Store {
  id: string;
  name: string;
  category: string;
  categoryEmoji: string;
  latitude: number;
  longitude: number;
  distance: number; // meters
  isOpen?: boolean;
  dealCount: number;
  deals: DealContent[];
  website?: string;
  address?: string;
  phone?: string;
}

export interface StoresResponse {
  stores: Store[];
  total: number;
}
