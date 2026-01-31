/**
 * API Configuration
 * Centralized API endpoints and configuration for easier maintenance
 */

import { apiFetch } from "./apiFetch"

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET

export const API_CONFIG = {
    ENDPOINTS: {
        base: API_BASE_URL,
        auth: {
            login: `${API_BASE_URL}/api/auth/login`,
            register: `${API_BASE_URL}/api/auth/register`,
            session: `${API_BASE_URL}/api/auth/session`,
            profile: `${API_BASE_URL}/api/profile`,
        },
        products: {
            base: `${API_BASE_URL}/api/products`,
            upload: `${API_BASE_URL}/api/products/upload`,
            byId: (id: string | number) => `${API_BASE_URL}/api/products/${encodeURIComponent(String(id))}`,
            list: (page: number = 1, limit: number = 10, branchName?: string, categoryId?: string, categoryName?: string, supplierName?: string, search?: string) => {
                const params = new URLSearchParams({
                    page: String(page),
                    limit: String(limit),
                });
                if (branchName && branchName.trim() !== "") {
                    params.append("branch_name", branchName.trim());
                }
                if (categoryId && categoryId.trim() !== "") {
                    params.append("category_id", categoryId.trim());
                }
                if (categoryName && categoryName.trim() !== "") {
                    params.append("category_name", categoryName.trim());
                }
                if (supplierName && supplierName.trim() !== "") {
                    params.append("supplier_name", supplierName.trim());
                }
                if (search && search.trim() !== "") {
                    params.append("search", search.trim());
                }
                return `${API_BASE_URL}/api/products?${params.toString()}`;
            },
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
        transactions: {
            base: `${API_BASE_URL}/api/transactions`,
            byId: (id: string | number) => `${API_BASE_URL}/api/transactions/${encodeURIComponent(String(id))}`,
            list: (page: number = 1, limit: number = 10) =>
                `${API_BASE_URL}/api/transactions?page=${page}&limit=${limit}`,
        },
        cashlog: {
            base: `${API_BASE_URL}/api/cashlog`,
            byId: (id: string | number) => `${API_BASE_URL}/api/cashlog/${encodeURIComponent(String(id))}`,
            list: (page: number = 1, limit: number = 10, branchName?: string) => {
                const params = new URLSearchParams({ page: String(page), limit: String(limit) });
                if (branchName && branchName.trim() !== "") params.append("branch_name", branchName.trim());
                return `${API_BASE_URL}/api/cashlog?${params.toString()}`;
            },
        },
        laporan: {
            base: `${API_BASE_URL}/api/laporan`,
            upload: `${API_BASE_URL}/api/laporan/upload`,
            byId: (id: string | number) => `${API_BASE_URL}/api/laporan/${encodeURIComponent(String(id))}`,
            list: (page: number = 1, limit: number = 10, branchName?: string, status?: string) => {
                const params = new URLSearchParams({ page: String(page), limit: String(limit) });
                if (branchName && branchName.trim() !== "") params.append("branch_name", branchName.trim());
                if (status && status.trim() !== "") params.append("status", status.trim());
                return `${API_BASE_URL}/api/laporan?${params.toString()}`;
            },
        },
        karyawan: {
            products: {
                list: (branchName: string, page: number = 1, limit: number = 100) => {
                    const params = new URLSearchParams({
                        branch_name: branchName.trim(),
                        page: String(page),
                        limit: String(limit),
                    });
                    return `${API_BASE_URL}/api/karyawan/products?${params.toString()}`;
                },
            },
        },
    },
    SECRET: API_SECRET,
}

/**
 * Fetch products with pagination
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param branchName - Optional branch name to filter products
 * @param categoryId - Optional category id to filter products
 * @param categoryName - Optional category name to filter products
 * @param supplierName - Optional supplier name to filter products
 * @param search - Optional search term to filter products by name
 * @param revalidate - Optional revalidate time in seconds
 * @returns Promise with products data and pagination info
 */
export async function fetchProducts(
    page: number = 1,
    limit: number = 10,
    branchName?: string,
    categoryId?: string,
    categoryName?: string,
    supplierName?: string,
    search?: string,
    revalidate?: number
): Promise<ProductsResponse> {
    try {
        const data = await apiFetch<ProductsResponse>(API_CONFIG.ENDPOINTS.products.list(page, limit, branchName, categoryId, categoryName, supplierName, search), {
            revalidate,
        })

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
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            throw new Error("Unauthorized")
        }
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
 * @param revalidate - Optional revalidate time in seconds
 * @returns Promise with categories data
 */
export async function fetchCategories(revalidate?: number): Promise<CategoriesResponse> {
    try {
        const data = await apiFetch<CategoriesResponse>(API_CONFIG.ENDPOINTS.categories.base, {
            revalidate,
        })

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
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            throw new Error("Unauthorized")
        }
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
 * @param revalidate - Optional revalidate time in seconds
 * @returns Promise with branches data
 */
export async function fetchBranches(revalidate?: number): Promise<BranchesResponse> {
    try {
        const data = await apiFetch<BranchesResponse>(API_CONFIG.ENDPOINTS.branches.base, {
            revalidate,
        })

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
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            throw new Error("Unauthorized")
        }
        throw error instanceof Error ? error : new Error("Failed to fetch branches")
    }
}

/**
 * Fetch a branch by ID
 * @param branchId - Branch ID to fetch
 * @returns Promise with branch data
 */
export async function fetchBranchById(branchId: string | number): Promise<BranchResponse> {
    try {
        const data = await apiFetch<BranchResponse>(API_CONFIG.ENDPOINTS.branches.byId(branchId))

        if (!data.success) {
            throw new Error(data.message || "Failed to fetch branch")
        }

        return {
            success: true,
            message: data.message,
            data: data.data,
        }
    } catch (error) {
        console.error("Fetch branch error:", error)
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            throw new Error("Unauthorized")
        }
        throw error instanceof Error ? error : new Error("Failed to fetch branch")
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
 * @param revalidate - Optional revalidate time in seconds
 * @returns Promise with employees data
 */
export async function fetchEmployees(revalidate?: number): Promise<EmployeesResponse> {
    try {
        const data = await apiFetch<EmployeesResponse>(API_CONFIG.ENDPOINTS.employees.base, {
            revalidate,
        })

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
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            throw new Error("Unauthorized")
        }
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
        const data = await apiFetch<SuppliersResponse>(API_CONFIG.ENDPOINTS.suppliers.base)

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
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            throw new Error("Unauthorized")
        }
        throw error instanceof Error ? error : new Error("Failed to fetch suppliers")
    }
}

/**
 * Fetch a supplier by ID
 * @param supplierId - Supplier ID to fetch
 * @param revalidate - Optional revalidate time in seconds
 * @returns Promise with supplier data
 */
export async function fetchSupplierById(supplierId: string | number, revalidate?: number): Promise<SupplierResponse> {
    try {
        const data = await apiFetch<SupplierResponse>(API_CONFIG.ENDPOINTS.suppliers.byId(supplierId), {
            revalidate,
        })

        if (!data.success) {
            throw new Error(data.message || "Failed to fetch supplier")
        }

        return {
            success: true,
            message: data.message,
            data: data.data,
        }
    } catch (error) {
        console.error("Fetch supplier error:", error)
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            throw new Error("Unauthorized")
        }
        throw error instanceof Error ? error : new Error("Failed to fetch supplier")
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

/**
 * Fetch transactions with pagination
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param revalidate - Optional revalidate time in seconds
 * @returns Promise with transactions data and pagination info
 */
export async function fetchTransactions(page: number = 1, limit: number = 10, revalidate?: number): Promise<TransactionsResponse> {
    try {
        const data = await apiFetch<TransactionsResponse>(API_CONFIG.ENDPOINTS.transactions.list(page, limit), {
            revalidate,
        })

        if (!data.success) {
            throw new Error(data.message || "Failed to fetch transactions")
        }

        return {
            success: true,
            message: data.message,
            data: data.data || [],
            pagination: data.pagination,
        }
    } catch (error) {
        console.error("Fetch transactions error:", error)
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            throw new Error("Unauthorized")
        }
        throw error instanceof Error ? error : new Error("Failed to fetch transactions")
    }
}

/**
 * Fetch cash logs with pagination
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param branchName - Optional branch name to filter
 * @param revalidate - Optional revalidate time in seconds
 * @returns Promise with cash logs data and pagination info
 */
export async function fetchCashLogs(
    page: number = 1,
    limit: number = 10,
    branchName?: string,
    revalidate?: number
): Promise<CashLogsResponse> {
    try {
        const data = await apiFetch<CashLogsResponse>(API_CONFIG.ENDPOINTS.cashlog.list(page, limit, branchName), {
            revalidate,
        })

        if (!data.success) {
            throw new Error(data.message || "Failed to fetch cash logs")
        }

        return {
            success: true,
            message: data.message,
            data: data.data || [],
            pagination: data.pagination,
        }
    } catch (error) {
        console.error("Fetch cash logs error:", error)
        if (error && typeof error === "object" && "status" in error && (error as { status?: number }).status === 401) {
            throw new Error("Unauthorized")
        }
        throw error instanceof Error ? error : new Error("Failed to fetch cash logs")
    }
}

/**
 * Fetch laporan (store expenses) with pagination
 */
export async function fetchLaporan(
    page: number = 1,
    limit: number = 10,
    branchName?: string,
    status?: string,
    revalidate?: number
): Promise<LaporanResponse> {
    try {
        const data = await apiFetch<LaporanResponse>(
            API_CONFIG.ENDPOINTS.laporan.list(page, limit, branchName, status),
            { revalidate }
        )

        if (!data.success) {
            throw new Error(data.message || "Failed to fetch laporan")
        }

        return {
            success: true,
            message: data.message,
            data: data.data || [],
            pagination: data.pagination,
        }
    } catch (error) {
        console.error("Fetch laporan error:", error)
        if (error && typeof error === "object" && "status" in error && (error as { status?: number }).status === 401) {
            throw new Error("Unauthorized")
        }
        throw error instanceof Error ? error : new Error("Failed to fetch laporan")
    }
}

/**
 * Create a new transaction
 * @param transactionData - Transaction data including items
 * @returns Promise with created transaction data
 */
export async function createTransaction(transactionData: {
    branch_name: string
    subtotal: number
    discount?: number
    tax?: number
    total: number
    paid_amount?: number
    is_credit?: boolean
    customer_name?: string
    payment_method?: "cash"
    status?: "pending" | "completed" | "cancelled" | "return"
    items: Array<{
        product_id: string | number
        product_name: string
        quantity: number
        price: number
        subtotal: number
    }>
}): Promise<{ success: boolean; message?: string; data?: TransactionRow }> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.transactions.base, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
            body: JSON.stringify({
                branch_name: transactionData.branch_name,
                subtotal: transactionData.subtotal,
                discount: transactionData.discount || 0,
                tax: transactionData.tax || 0,
                total: transactionData.total,
                paid_amount: transactionData.paid_amount || transactionData.total,
                is_credit: transactionData.is_credit || false,
                customer_name: transactionData.customer_name || "",
                payment_method: transactionData.payment_method || "cash",
                status: transactionData.status || "pending",
                items: transactionData.items,
            }),
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || !data?.success) {
            throw new Error(data?.message || "Failed to create transaction")
        }

        return {
            success: true,
            message: data.message || "Transaction created successfully",
            data: data.data,
        }
    } catch (error) {
        console.error("Create transaction error:", error)
        throw error instanceof Error ? error : new Error("Failed to create transaction")
    }
}

/**
 * Fetch products for karyawan (employee) view
 * @param branchName - Branch name to filter products (required)
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 100, max: 100)
 * @param revalidate - Optional revalidate time in seconds
 * @returns Promise with products data and pagination info
 */
export async function fetchKaryawanProducts(
    branchName: string,
    page: number = 1,
    limit: number = 100,
    revalidate?: number
): Promise<KaryawanProductsResponse> {
    try {
        if (!branchName || branchName.trim() === "") {
            throw new Error("Branch name is required")
        }

        const data = await apiFetch<KaryawanProductsResponse>(
            API_CONFIG.ENDPOINTS.karyawan.products.list(branchName, page, limit),
            { revalidate }
        )

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
        console.error("Fetch karyawan products error:", error)
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            throw new Error("Unauthorized")
        }
        throw error instanceof Error ? error : new Error("Failed to fetch products")
    }
}
