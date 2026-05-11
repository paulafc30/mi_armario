// Tipos generados manualmente que reflejan supabase/migrations/0001_initial_schema.sql.
// Si cambias el esquema, actualiza también estos tipos (o usa `supabase gen types`).

export type ClothesStatus =
  | 'closet'
  | 'baul'
  | 'en_venta'
  | 'vendida'
  | 'archivada'

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Clothe {
  id: string
  user_id: string
  name: string
  category_id: string | null
  image_url: string | null
  image_path: string | null
  notes: string | null
  tags: string[]
  status: ClothesStatus
  on_wallapop: boolean
  on_vinted: boolean
  price: number | null
  sold_at: string | null
  brand: string | null
  size: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export interface Outfit {
  id: string
  user_id: string
  name: string
  cover_image_url: string | null
  created_at: string
}

export interface OutfitItem {
  outfit_id: string
  clothe_id: string
}

export interface WishlistItem {
  id: string
  user_id: string
  url: string
  name: string | null
  price: number | null
  image_url: string | null
  notes: string | null
  created_at: string
}

// Database type para tipar el cliente de supabase (mínimo viable)
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> }
      categories: { Row: Category; Insert: Omit<Category, 'id' | 'created_at'> & { id?: string }; Update: Partial<Category> }
      clothes: { Row: Clothe; Insert: Omit<Clothe, 'id' | 'created_at' | 'updated_at'> & { id?: string }; Update: Partial<Clothe> }
      outfits: { Row: Outfit; Insert: Omit<Outfit, 'id' | 'created_at'> & { id?: string }; Update: Partial<Outfit> }
      outfit_items: { Row: OutfitItem; Insert: OutfitItem; Update: Partial<OutfitItem> }
      wishlist: { Row: WishlistItem; Insert: Omit<WishlistItem, 'id' | 'created_at'> & { id?: string }; Update: Partial<WishlistItem> }
    }
  }
}
