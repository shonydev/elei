export type BusinessCategory =
  | 'cafeteria'
  | 'pasteleria'
  | 'restaurante'
  | 'libreria'
  | 'tienda'
  | 'tostaduria';

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  description: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  priceLevel: '$' | '$$' | '$$$';
  openingHours?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  tags: string[];
  isFeatured?: boolean;
  createdAt: string;
}

export interface CategoryInfo {
  id: BusinessCategory;
  label: string;
  emoji: string;
  color: string;
  borderColor: string;
}
