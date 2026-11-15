export interface Card {
  id: string;
  list_id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
  created_at?: string;
  updated_at?: string;
}

export interface User {
  email: string;
}
