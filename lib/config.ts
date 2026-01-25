/**
 * API Configuration
 * Centralized API endpoints and configuration for easier maintenance
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET

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
 * @returns Promise with products data and pagination info
 */
export async function fetchProducts(
    page: number = 1,
    limit: number = 10,
    branchName?: string,
    categoryId?: string,
    categoryName?: string,
    supplierName?: string,
    search?: string
): Promise<ProductsResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.products.list(page, limit, branchName, categoryId, categoryName, supplierName, search), {
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
 * Fetch a branch by ID
 * @param branchId - Branch ID to fetch
 * @returns Promise with branch data
 */
export async function fetchBranchById(branchId: string | number): Promise<BranchResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.branches.byId(branchId), {
            headers: {
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
        })

        if (response.status === 401) {
            throw new Error("Unauthorized")
        }

        const data = await response.json()

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
 * Fetch a supplier by ID
 * @param supplierId - Supplier ID to fetch
 * @returns Promise with supplier data
 */
export async function fetchSupplierById(supplierId: string | number): Promise<SupplierResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.suppliers.byId(supplierId), {
            headers: {
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
        })

        if (response.status === 401) {
            throw new Error("Unauthorized")
        }

        const data = await response.json()

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
 * @returns Promise with transactions data and pagination info
 */
export async function fetchTransactions(page: number = 1, limit: number = 10): Promise<TransactionsResponse> {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.transactions.list(page, limit), {
            headers: {
                Authorization: `Bearer ${API_CONFIG.SECRET}`,
            },
        })

        if (response.status === 401) {
            throw new Error("Unauthorized")
        }

        const data = await response.json()

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
        throw error instanceof Error ? error : new Error("Failed to fetch transactions")
    }
}
