type Unit =
  | 'pcs'
  | 'kg'
  | 'liter'
  | 'meter'
  | 'pack'
  | 'dus';

interface Products {
  id: number;
  uid: string;
  name: string;
  price: number;
  modal: number;
  stock: number;
  sold: number;
  size?: number;   // 1, 2, 5 (liter/kg/meter)
  unit: Unit;
  image_url: string;
  category_id?: string;
  category_name?: string;
  barcode: string;
  is_active: boolean;
  min_stock?: number;
  description?: string;
  supplier_id?: string;
  supplier_name?: string;
  expiration_date?: string;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
  branch_id?: string;
  branch_name?: string;
}

interface ProductsDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: ProductRow | null
  supplierName: string | null
  branchName: string | null
  categoryName: string | null
}

type ProductRow = {
  id: string | number
  uid?: string
  name: string
  price?: number
  modal?: number
  stock?: number
  sold?: number
  size?: number
  unit?: Unit
  barcode?: string
  is_active?: boolean
  branch_id?: string
  supplier_id?: string
  category_id?: string
  branch_name?: string
  supplier_name?: string
  image_url?: string
  category_name?: string
  min_stock?: number
  expiration_date?: string
  created_by?: string
  updated_by?: string
  created_at?: string
  updated_at?: string
}

type ProductsResponse = {
  success: boolean
  message?: string
  data: ProductRow[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

type DeleteProductResponse = {
  success: boolean
  message?: string
}

interface DeleteProductProps {
  product: ProductRow
  onUpdate: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

interface ProductActionsProps {
  product: ProductRow
  onDelete: (product: ProductRow) => void
  onViewSupplier: (product: ProductRow) => void
  onViewBranch: (product: ProductRow) => void
  onViewDetails: (product: ProductRow) => void
}

// Karyawan Products
type KaryawanProductRow = {
  id: string
  price: number
  name: string
  image_url: string
  category_name: string
  barcode: string
  branch_name: string
  unit?: Unit
}

type KaryawanProductsResponse = {
  success: boolean
  message?: string
  data: KaryawanProductRow[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

type AppsScriptProductUpdateRequest = {
  action: 'update';
  sheet: 'Products';
  id: string;
  name?: string;
  price?: number;
  modal?: number;
  stock?: number;
  sold?: number;
  size?: number;
  unit?: string;
  image_url?: string;
  category_id?: string;
  category_name?: string;
  barcode?: string;
  is_active?: boolean;
  min_stock?: number;
  description?: string;
  supplier_id?: string;
  supplier_name?: string;
  expiration_date?: string;
  updated_by?: string;
  branch_id?: string;
  branch_name?: string;
};