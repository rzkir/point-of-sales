import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

export function checkAuth(request: NextRequest): NextResponse | null {
    if (!API_SECRET || request.headers.get("authorization") !== `Bearer ${API_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}

export function validateAppsScriptUrl(): NextResponse | null {
    if (!APPS_SCRIPT_URL) {
        return NextResponse.json(
            {
                success: false,
                message: "Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local",
            },
            { status: 500 }
        );
    }
    return null;
}

export function validateId(id: string | undefined): NextResponse | null {
    if (!id) {
        return NextResponse.json(
            { success: false, message: "Product ID is required" },
            { status: 400 }
        );
    }
    return null;
}

export function getSessionUser(request: NextRequest): User | null {
    const session = request.cookies.get("session")?.value;
    if (session) {
        try {
            return JSON.parse(session) as User;
        } catch {
            return null;
        }
    }
    return null;
}

export async function callAppsScript(requestBody: Record<string, unknown>) {
    const response = await fetch(APPS_SCRIPT_URL!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(API_SECRET && { Authorization: `Bearer ${API_SECRET}` }),
        },
        body: JSON.stringify(requestBody),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        await response.text();
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid response from Apps Script. Please check your Apps Script deployment and URL.'
            },
            { status: 500 }
        );
    }

    const data = await response.json();

    if (!data.success) {
        return NextResponse.json(
            { success: false, message: data.message },
            { status: data.message.includes('not found') ? 404 : 400 }
        );
    }

    return NextResponse.json({
        success: true,
        message: data.message,
        data: data.data,
    });
}

export async function callAppsScriptWithPagination(
    requestBody: Record<string, unknown>,
    includePagination = false,
    clientPage?: number,
    clientLimit?: number
) {
    const isListAction = requestBody.action === "list";

    const branchNameFilter = isListAction ? (requestBody.branch_name as string | undefined) : undefined;
    const categoryIdFilter = isListAction ? (requestBody.category_id as string | undefined) : undefined;
    const categoryNameFilter = isListAction ? (requestBody.category_name as string | undefined) : undefined;
    const supplierNameFilter = isListAction ? (requestBody.supplier_name as string | undefined) : undefined;
    const searchFilter = isListAction ? (requestBody.search as string | undefined) : undefined;

    const appsScriptRequestBody = isListAction
        ? (() => {
            const cloned = { ...requestBody };
            delete cloned.branch_name;
            delete cloned.category_id;
            delete cloned.category_name;
            delete cloned.supplier_name;
            delete cloned.search;
            return cloned;
        })()
        : requestBody;

    const response = await fetch(APPS_SCRIPT_URL!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_SECRET}`,
        },
        body: JSON.stringify(appsScriptRequestBody),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        await response.text();
        return NextResponse.json(
            {
                success: false,
                message: "Invalid response from Apps Script. Please check your Apps Script deployment and URL.",
            },
            { status: 500 }
        );
    }

    const data = await response.json();

    if (!data.success) {
        return NextResponse.json(
            { success: false, message: data.message },
            { status: 400 }
        );
    }

    if (includePagination && isListAction) {
        const allProducts = Array.isArray(data.data) ? data.data : [];

        const sortedProducts = [...allProducts].sort((a: ProductRow, b: ProductRow) => {
            if (a.updated_at && b.updated_at) {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
            if (a.created_at && b.created_at) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (a.id && b.id) {
                return Number(b.id) - Number(a.id);
            }
            return 0;
        });

        let filteredByBranch = sortedProducts;
        if (branchNameFilter) {
            const branchNameLower = branchNameFilter.trim().toLowerCase();
            filteredByBranch = sortedProducts.filter((product: Record<string, unknown>) => {
                const productBranchName = String(product.branch_name || "").trim().toLowerCase();
                return productBranchName === branchNameLower;
            });
        }

        let filteredByCategory = filteredByBranch;
        if (categoryIdFilter) {
            const categoryIdLower = categoryIdFilter.trim().toLowerCase();
            filteredByCategory = filteredByBranch.filter((product: Record<string, unknown>) => {
                const productCategoryId = String(product.category_id || "").trim().toLowerCase();
                return productCategoryId === categoryIdLower;
            });
        } else if (categoryNameFilter) {
            const categoryNameLower = categoryNameFilter.trim().toLowerCase();
            filteredByCategory = filteredByBranch.filter((product: Record<string, unknown>) => {
                const productCategoryName = String(product.category_name || "").trim().toLowerCase();
                return productCategoryName === categoryNameLower;
            });
        }

        let filteredBySupplier = filteredByCategory;
        if (supplierNameFilter) {
            const supplierNameLower = supplierNameFilter.trim().toLowerCase();
            filteredBySupplier = filteredByCategory.filter((product: Record<string, unknown>) => {
                const productSupplierName = String(product.supplier_name || "").trim().toLowerCase();
                return productSupplierName === supplierNameLower;
            });
        }

        let filteredBySearch = filteredBySupplier;
        if (searchFilter) {
            const searchLower = searchFilter.trim().toLowerCase();
            filteredBySearch = filteredBySupplier.filter((product: Record<string, unknown>) => {
                const productName = String(product.name || "").trim().toLowerCase();
                return productName.includes(searchLower);
            });
        }

        const total = filteredBySearch.length;

        const page = clientPage !== undefined ? clientPage : ((requestBody.page as number) || 1);
        const limit = clientLimit !== undefined ? clientLimit : ((requestBody.limit as number) || 10);
        const offset = (page - 1) * limit;

        const startIndex = Math.min(offset, total);
        const endIndex = Math.min(offset + limit, total);
        const products = filteredBySearch.slice(startIndex, endIndex);

        const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return NextResponse.json({
            success: true,
            message: data.message,
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext,
                hasPrev,
            },
        });
    }

    return NextResponse.json({
        success: true,
        message: data.message,
        data: data.data,
    });
}

export function filterProductFields(product: unknown): {
    id?: number;
    price?: number;
    name?: string;
    image_url?: string;
    category_name?: string;
    barcode?: string;
    size?: number;
    unit?: string;
    stock?: number;
    sold?: number;
    min_stock?: number;
    description?: string;
    branch_name?: string;
    supplier_name?: string;
    expiration_date?: string;
} {
    const p = product as Record<string, unknown>;
    return {
        id: p.id as number | undefined,
        price: p.price as number | undefined,
        name: p.name as string | undefined,
        image_url: p.image_url as string | undefined,
        category_name: p.category_name as string | undefined,
        barcode: p.barcode as string | undefined,
        size: p.size as number | undefined,
        unit: p.unit as string | undefined,
        stock: p.stock as number | undefined,
        sold: p.sold as number | undefined,
        min_stock: p.min_stock as number | undefined,
        description: p.description as string | undefined,
        branch_name: p.branch_name as string | undefined,
        supplier_name: p.supplier_name as string | undefined,
        expiration_date: p.expiration_date as string | undefined,
    };
}

export function filterPopularProductFields(products: ProductRow[]) {
    return products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image_url: p.image_url,
        category_name: p.category_name,
        barcode: p.barcode,
        branch_name: p.branch_name,
        unit: p.unit,
        sold: p.sold,
        stock: p.stock,
    }));
}

export async function callAppsScriptPopular(requestBody: Record<string, unknown>) {
    const response = await fetch(APPS_SCRIPT_URL!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_SECRET}`,
        },
        body: JSON.stringify(requestBody),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        await response.text();
        return NextResponse.json(
            {
                success: false,
                message: "Invalid response from Apps Script. Please check your Apps Script deployment and URL.",
            },
            { status: 500 }
        );
    }

    const data = await response.json();
    if (!data.success) {
        return NextResponse.json(
            { success: false, message: data.message },
            { status: 400 }
        );
    }

    return data;
}

export function filterKaryawanProductFields(products: unknown[]): Array<{
    id?: number;
    price?: number;
    name?: string;
    image_url?: string;
    category_name?: string;
    barcode?: string;
    branch_name?: string;
    unit?: string;
    sold?: number;
    stock?: number;
}> {
    return products.map((product) => {
        const p = product as Record<string, unknown>;
        return {
            id: p.id as number | undefined,
            price: p.price as number | undefined,
            name: p.name as string | undefined,
            image_url: p.image_url as string | undefined,
            category_name: p.category_name as string | undefined,
            barcode: p.barcode as string | undefined,
            branch_name: p.branch_name as string | undefined,
            unit: p.unit as string | undefined,
            sold: p.sold as number | undefined,
            stock: p.stock as number | undefined,
        };
    });
}

export async function callAppsScriptKaryawan(
    requestBody: Record<string, unknown>,
    includePagination = false,
    clientPage?: number,
    clientLimit?: number
) {
    const branchNameFilter = requestBody.branch_name as string | undefined;
    const appsScriptRequestBody = { ...requestBody };
    delete appsScriptRequestBody.branch_name;

    const response = await fetch(APPS_SCRIPT_URL!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_SECRET}`,
        },
        body: JSON.stringify(appsScriptRequestBody),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        await response.text();
        return NextResponse.json(
            {
                success: false,
                message: "Invalid response from Apps Script. Please check your Apps Script deployment and URL.",
            },
            { status: 500 }
        );
    }

    const data = await response.json();

    if (!data.success) {
        return NextResponse.json(
            { success: false, message: data.message },
            { status: 400 }
        );
    }

    if (includePagination) {
        const products = Array.isArray(data.data) ? data.data : [];

        const sortedProducts = [...products].sort((a: ProductRow, b: ProductRow) => {
            if (a.updated_at && b.updated_at) {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
            if (a.created_at && b.created_at) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (a.id && b.id) {
                return Number(b.id) - Number(a.id);
            }
            return 0;
        });

        let filteredByBranch = sortedProducts;
        if (branchNameFilter) {
            const branchNameLower = branchNameFilter.trim().toLowerCase();
            filteredByBranch = sortedProducts.filter((product: Record<string, unknown>) => {
                const productBranchName = String(product.branch_name || "").trim().toLowerCase();
                return productBranchName === branchNameLower;
            });
        }

        const total = filteredByBranch.length;

        const page = clientPage !== undefined ? clientPage : ((requestBody.page as number) || 1);
        const limit = clientLimit !== undefined ? clientLimit : ((requestBody.limit as number) || 10);
        const offset = (page - 1) * limit;

        const startIndex = Math.min(offset, total);
        const endIndex = Math.min(offset + limit, total);
        const paginatedByBranch = filteredByBranch.slice(startIndex, endIndex);

        const filteredProducts = filterKaryawanProductFields(paginatedByBranch);

        const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return NextResponse.json({
            success: true,
            message: data.message,
            data: filteredProducts,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext,
                hasPrev,
            },
        });
    }

    let filteredData = Array.isArray(data.data) ? data.data : data.data;
    if (branchNameFilter && Array.isArray(filteredData)) {
        const branchNameLower = branchNameFilter.trim().toLowerCase();
        filteredData = filteredData.filter((product: Record<string, unknown>) => {
            const productBranchName = String(product.branch_name || "").trim().toLowerCase();
            return productBranchName === branchNameLower;
        });
    }

    const finalData = Array.isArray(filteredData) ? filterKaryawanProductFields(filteredData) : filteredData;

    return NextResponse.json({
        success: true,
        message: data.message,
        data: finalData,
    });
}

export function jsonError(message: string, status: number) {
    return NextResponse.json({ success: false, message }, { status });
}