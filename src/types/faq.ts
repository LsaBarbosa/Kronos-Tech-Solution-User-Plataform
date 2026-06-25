export interface FaqCategory {
  id: string;
  name: string;
}

export interface FaqItem {
  id: string;
  title: string;
  shortAnswer: string;
  fullAnswer?: string;
  category: FaqCategory;
  relatedScreens: string[];
  tags: string[];
  priority?: number;
  relevanceScore?: number | null;
  updatedAt?: string;
}

export interface FaqSearchResponse {
  items: FaqItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface FaqContextualResponse {
  items: FaqItem[];
  screen: string;
}
