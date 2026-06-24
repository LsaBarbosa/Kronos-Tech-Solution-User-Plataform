export interface FaqCategory {
  id: string;
  name: string;
}

export interface FaqItem {
  id: string;
  title: string;
  shortAnswer: string;
  fullAnswer: string;
  category: FaqCategory;
  screenKeys: string[];
  tags: string[];
  priority: number;
}

export interface FaqSearchResponse {
  content: FaqItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface FaqContextualResponse {
  items: FaqItem[];
  screenKey: string;
}
