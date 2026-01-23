interface Supplier {
    id: string;
    name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

type SupplierRow = {
    id: string | number
    name: string
    contact_person?: string
    phone?: string
    email?: string
    address?: string
    is_active?: boolean
    created_at?: string
    updated_at?: string
}

type SuppliersResponse = {
    success: boolean
    message?: string
    data: SupplierRow[]
}

type SupplierResponse = {
    success: boolean
    message?: string
    data: SupplierRow
}

type DeleteSupplierResponse = {
    success: boolean
    message?: string
}

interface SupplierModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    supplier: SupplierRow | null
    isLoading: boolean
}

interface SupplierEditFormProps {
    supplier: SupplierRow
    onUpdate: () => void
    children: React.ReactElement
}

interface DeleteSupplierProps {
    supplier: SupplierRow
    onUpdate: () => void
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}
