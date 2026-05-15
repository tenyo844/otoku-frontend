export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Flyer {
  id: string;
  title?: string;
  thumbUrl: string;
  pageUrl: string;
  validUntil?: string; // e.g. "5/13〜5/19"
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
  flyerCount: number;
  flyers: Flyer[];
  address?: string;
  phone?: string;
}

export interface StoresResponse {
  stores: Store[];
  total: number;
}
