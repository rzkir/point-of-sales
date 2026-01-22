/**
 * API Configuration
 * Centralized API endpoints and configuration for easier maintenance
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ""
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET || ""

export const API_CONFIG = {
    ENDPOINTS: {
        base: API_BASE_URL,
        auth: {
            login: `${API_BASE_URL}/api/auth/login`,
            register: `${API_BASE_URL}/api/auth/register`,
            session: `${API_BASE_URL}/api/auth/session`,
        },
        products: {
            base: `${API_BASE_URL}/api/products`,
            upload: `${API_BASE_URL}/api/products/upload`,
            byId: (id: string | number) => `${API_BASE_URL}/api/products/${encodeURIComponent(String(id))}`,
            list: (page: number = 1, limit: number = 10) =>
                `${API_BASE_URL}/api/products?page=${page}&limit=${limit}`,
        },
        branches: {
            base: `${API_BASE_URL}/api/branches`,
            byId: (id: string | number) => `${API_BASE_URL}/api/branches/${encodeURIComponent(String(id))}`,
        },
        categories: {
            base: `${API_BASE_URL}/api/categories`,
            byId: (id: string | number) => `${API_BASE_URL}/api/categories/${encodeURIComponent(String(id))}`,
        },
        employees: {
            base: `${API_BASE_URL}/api/employees`,
            byId: (id: string | number) => `${API_BASE_URL}/api/employees/${encodeURIComponent(String(id))}`,
        },
        suppliers: {
            base: `${API_BASE_URL}/api/supplier`,
            byId: (id: string | number) => `${API_BASE_URL}/api/supplier/${encodeURIComponent(String(id))}`,
        },
    },
    SECRET: API_SECRET,
}

/**
 * Product API Types
 */
export type ProductRow = {
    id: string | number
    uid?: string
    name: string
    price?: number
    modal?: number
    stock?: number
    sold?: number
    unit?: string
    barcode?: string
    is_active?: boolean
    branch_id?: string
    image_url?: string
}

export type ProductsResponse = {
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

export type DeleteProductResponse = {
    success: boolean
    message?: string
}

/**
 * Category API Types
 */
export type CategoryRow = {
    id: string
    uid?: string
    name: string
    is_active?: boolean
    created_at?: string
    updated_at?: string
}

export type CategoriesResponse = {
    success: boolean
    message?: string
    data: CategoryRow[]
}

export type DeleteCategoryResponse = {
    success: boolean
    message?: string
}

/**
 * Branch API Types
 */
export type BranchRow = {
    id: string
    name: string
    address?: string
    createdAt?: string
    updatedAt?: string
}

export type BranchesResponse = {
    success: boolean
    message?: string
    data: BranchRow[]
}

export type DeleteBranchResponse = {
    success: boolean
    message?: string
}

/**
 * Employee API Types
 */
export type EmployeeRow = {
    id: string
    name: string
    email?: string
    roleType?: string
    branchName?: string
    createdAt?: string
    updatedAt?: string
}

export type EmployeesResponse = {
    success: boolean
    message?: string
    data: EmployeeRow[]
}

export type DeleteEmployeeResponse = {
    success: boolean
    message?: string
}

/**
 * Supplier API Types
 */
export type SupplierRow = {
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

export type SuppliersResponse = {
    success: boolean
    message?: string
    data: SupplierRow[]
}

export type DeleteSupplierResponse = {
    success: boolean
    message?: string
}

/**
 * Fetch products with pagination
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise with products data and pagination info
 */
export async function fetchProducts(page: number = 1, limit: number = 10): Promise<ProductsResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.products.list(page, limit), {
            headers: {
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
        })

        if (response.status === 401) {
            throw new Error("Unauthorized")
        }

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.message || "Failed to fetch products")
        }

        return {
            success: true,
            message: data.message,
            data: data.data || [],
            pagination: data.pagination,
        }
    } catch (error) {
        console.error("Fetch products error:", error)
        throw error instanceof Error ? error : new Error("Failed to fetch products")
    }
}

/**
 * Delete a product by ID
 * @param productId - Product ID to delete
 * @returns Promise with delete response
 */
export async function deleteProduct(productId: string | number): Promise<DeleteProductResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.products.byId(productId), {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || !data?.success) {
            throw new Error(data?.message || "Failed to delete product")
        }

        return {
            success: true,
            message: data.message || "Product deleted successfully",
        }
    } catch (error) {
        console.error("Delete product error:", error)
        throw error instanceof Error ? error : new Error("Failed to delete product")
    }
}

/**
 * Fetch all categories
 * @returns Promise with categories data
 */
export async function fetchCategories(): Promise<CategoriesResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.categories.base, {
            headers: {
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
        })

        if (response.status === 401) {
            throw new Error("Unauthorized")
        }

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.message || "Failed to fetch categories")
        }

        return {
            success: true,
            message: data.message,
            data: data.data || [],
        }
    } catch (error) {
        console.error("Fetch categories error:", error)
        throw error instanceof Error ? error : new Error("Failed to fetch categories")
    }
}

/**
 * Delete a category by ID
 * @param categoryId - Category ID to delete
 * @returns Promise with delete response
 */
export async function deleteCategory(categoryId: string | number): Promise<DeleteCategoryResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.categories.byId(categoryId), {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || !data?.success) {
            throw new Error(data?.message || "Failed to delete category")
        }

        return {
            success: true,
            message: data.message || "Category deleted successfully",
        }
    } catch (error) {
        console.error("Delete category error:", error)
        throw error instanceof Error ? error : new Error("Failed to delete category")
    }
}

/**
 * Fetch all branches
 * @returns Promise with branches data
 */
export async function fetchBranches(): Promise<BranchesResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.branches.base, {
            headers: {
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
        })

        if (response.status === 401) {
            throw new Error("Unauthorized")
        }

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.message || "Failed to fetch branches")
        }

        return {
            success: true,
            message: data.message,
            data: data.data || [],
        }
    } catch (error) {
        console.error("Fetch branches error:", error)
        throw error instanceof Error ? error : new Error("Failed to fetch branches")
    }
}

/**
 * Delete a branch by ID
 * @param branchId - Branch ID to delete
 * @returns Promise with delete response
 */
export async function deleteBranch(branchId: string | number): Promise<DeleteBranchResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.branches.byId(branchId), {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || !data?.success) {
            throw new Error(data?.message || "Failed to delete branch")
        }

        return {
            success: true,
            message: data.message || "Branch deleted successfully",
        }
    } catch (error) {
        console.error("Delete branch error:", error)
        throw error instanceof Error ? error : new Error("Failed to delete branch")
    }
}

/**
 * Fetch all employees
 * @returns Promise with employees data
 */
export async function fetchEmployees(): Promise<EmployeesResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.employees.base, {
            headers: {
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
        })

        if (response.status === 401) {
            throw new Error("Unauthorized")
        }

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.message || "Failed to fetch employees")
        }

        return {
            success: true,
            message: data.message,
            data: data.data || [],
        }
    } catch (error) {
        console.error("Fetch employees error:", error)
        throw error instanceof Error ? error : new Error("Failed to fetch employees")
    }
}

/**
 * Delete an employee by ID
 * @param employeeId - Employee ID to delete
 * @returns Promise with delete response
 */
export async function deleteEmployee(employeeId: string | number): Promise<DeleteEmployeeResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.employees.byId(employeeId), {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || !data?.success) {
            throw new Error(data?.message || "Failed to delete employee")
        }

        return {
            success: true,
            message: data.message || "Employee deleted successfully",
        }
    } catch (error) {
        console.error("Delete employee error:", error)
        throw error instanceof Error ? error : new Error("Failed to delete employee")
    }
}

/**
 * Fetch all suppliers
 * @returns Promise with suppliers data
 */
export async function fetchSuppliers(): Promise<SuppliersResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.suppliers.base, {
            headers: {
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
        })

        if (response.status === 401) {
            throw new Error("Unauthorized")
        }

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.message || "Failed to fetch suppliers")
        }

        return {
            success: true,
            message: data.message,
            data: data.data || [],
        }
    } catch (error) {
        console.error("Fetch suppliers error:", error)
        throw error instanceof Error ? error : new Error("Failed to fetch suppliers")
    }
}

/**
 * Delete a supplier by ID
 * @param supplierId - Supplier ID to delete
 * @returns Promise with delete response
 */
export async function deleteSupplier(supplierId: string | number): Promise<DeleteSupplierResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.suppliers.byId(supplierId), {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || !data?.success) {
            throw new Error(data?.message || "Failed to delete supplier")
        }

        return {
            success: true,
            message: data.message || "Supplier deleted successfully",
        }
    } catch (error) {
        console.error("Delete supplier error:", error)
        throw error instanceof Error ? error : new Error("Failed to delete supplier")
    }
}
