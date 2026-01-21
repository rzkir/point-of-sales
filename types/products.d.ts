interface Products {
  id: number;
  uid: string;
  name: string;
  price: number;
  modal: number;
  stock: number;
  sold: number;
  unit: string;
  image_url: string;
  category_id?: string;
  barcode: string;
  is_active: boolean;
  min_stock?: number;
  description?: string;
  supplier_id?: string;
  expiration_date?: string;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
  branch_id?: string;
}