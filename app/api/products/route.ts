import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

type User = {
    name?: string;
    email?: string;
};

// Helper: Check authorization
function checkAuth(request: NextRequest): NextResponse | null {
    if (!API_SECRET || request.headers.get("authorization") !== `Bearer ${API_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}

// Helper: Validate Apps Script URL
function validateAppsScriptUrl(): NextResponse | null {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE") {
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

// Helper: Get session user from cookie
function getSessionUser(request: NextRequest): User | null {
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

// Helper: Call Apps Script API and handle response
async function callAppsScript(
    requestBody: Record<string, unknown>,
    includePagination = false,
    clientPage?: number,
    clientLimit?: number
) {
    /**
     * IMPORTANT:
     * - For "list" action we treat branch_name, category_id, category_name, supplier_name, search
     *   as client-side filters only, so we REMOVE them before sending to Apps Script and
     *   apply filtering/pagination here.
     * - For non-"list" actions (create/update/etc.) we MUST NOT strip these fields,
     *   otherwise Apps Script will never receive branch/category/supplier values.
     */

    const isListAction = requestBody.action === "list";

    // Extract filters only for list action (used later for in-memory filtering)
    const branchNameFilter = isListAction ? (requestBody.branch_name as string | undefined) : undefined;
    const categoryIdFilter = isListAction ? (requestBody.category_id as string | undefined) : undefined;
    const categoryNameFilter = isListAction ? (requestBody.category_name as string | undefined) : undefined;
    const supplierNameFilter = isListAction ? (requestBody.supplier_name as string | undefined) : undefined;
    const searchFilter = isListAction ? (requestBody.search as string | undefined) : undefined;

    // Only strip filter fields when we're doing a list operation
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
        body: JSON.stringify(appsScriptRequestBody), // Don't send filters (branch_name, category_id, category_name, supplier_name, search) to Apps Script
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

        // Sort products by created_at or updated_at (newest first), fallback to id
        const sortedProducts = [...allProducts].sort((a: ProductRow, b: ProductRow) => {
            // Try updated_at first (most recent update)
            if (a.updated_at && b.updated_at) {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
            // Fallback to created_at
            if (a.created_at && b.created_at) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            // Fallback to id (higher id = newer, assuming auto-increment)
            if (a.id && b.id) {
                return Number(b.id) - Number(a.id);
            }
            return 0;
        });

        // Filter by branch_name if provided (case-insensitive)
        let filteredByBranch = sortedProducts;
        if (branchNameFilter) {
            const branchNameLower = branchNameFilter.trim().toLowerCase();
            filteredByBranch = sortedProducts.filter((product: Record<string, unknown>) => {
                const productBranchName = String(product.branch_name || "").trim().toLowerCase();
                return productBranchName === branchNameLower;
            });
        }

        // Filter by category_id or category_name if provided
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

        // Filter by supplier_name if provided (case-insensitive)
        let filteredBySupplier = filteredByCategory;
        if (supplierNameFilter) {
            const supplierNameLower = supplierNameFilter.trim().toLowerCase();
            filteredBySupplier = filteredByCategory.filter((product: Record<string, unknown>) => {
                const productSupplierName = String(product.supplier_name || "").trim().toLowerCase();
                return productSupplierName === supplierNameLower;
            });
        }

        // Filter by search (product name) if provided (case-insensitive, partial match)
        let filteredBySearch = filteredBySupplier;
        if (searchFilter) {
            const searchLower = searchFilter.trim().toLowerCase();
            filteredBySearch = filteredBySupplier.filter((product: Record<string, unknown>) => {
                const productName = String(product.name || "").trim().toLowerCase();
                return productName.includes(searchLower);
            });
        }

        // Total count is based on filtered data (after all filters)
        const total = filteredBySearch.length;

        // Use client-side pagination parameters if provided, otherwise use requestBody
        const page = clientPage !== undefined ? clientPage : ((requestBody.page as number) || 1);
        const limit = clientLimit !== undefined ? clientLimit : ((requestBody.limit as number) || 10);
        const offset = (page - 1) * limit;

        // Apply pagination to filtered results
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

/**
 * GET /api/products - List all products with pagination
 * Query params:
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 10, max: 100)
 *   - branch_name: filter by branch name (optional)
 *   - category_id: filter by category id (optional)
 *   - category_name: filter by category name (optional)
 *   - supplier_name: filter by supplier name (optional)
 *   - search: search by product name (optional, partial match)
 */
export async function GET(request: NextRequest) {
    try {
        const authError = checkAuth(request);
        if (authError) return authError;

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
        const branchName = searchParams.get("branch_name");
        const categoryId = searchParams.get("category_id");
        const categoryName = searchParams.get("category_name");
        const supplierName = searchParams.get("supplier_name");
        const search = searchParams.get("search");

        // If any filter is provided, request ALL data from Apps Script without pagination
        // We'll do filtering and pagination in Next.js after getting all data
        const requestBody: Record<string, unknown> = {
            action: "list",
            sheet: "Products",
        };

        const hasFilter = (branchName && branchName.trim() !== "") ||
            (categoryId && categoryId.trim() !== "") ||
            (categoryName && categoryName.trim() !== "") ||
            (supplierName && supplierName.trim() !== "") ||
            (search && search.trim() !== "");

        // Only send pagination params to Apps Script if no filters
        if (!hasFilter) {
            const offset = (page - 1) * limit;
            requestBody.page = page;
            requestBody.limit = limit;
            requestBody.offset = offset;
        } else {
            // Pass filters separately for filtering in Next.js (not to Apps Script)
            if (branchName && branchName.trim() !== "") {
                requestBody.branch_name = branchName.trim();
            }
            if (categoryId && categoryId.trim() !== "") {
                requestBody.category_id = categoryId.trim();
            }
            if (categoryName && categoryName.trim() !== "") {
                requestBody.category_name = categoryName.trim();
            }
            if (supplierName && supplierName.trim() !== "") {
                requestBody.supplier_name = supplierName.trim();
            }
            if (search && search.trim() !== "") {
                requestBody.search = search.trim();
            }
        }

        return await callAppsScript(requestBody, true, page, limit);
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/products - Create a new product
 */
export async function POST(request: NextRequest) {
    try {
        const authError = checkAuth(request);
        if (authError) return authError;

        const sessionUser = getSessionUser(request);
        const body = await request.json();

        const {
            name,
            price,
            modal,
            stock,
            sold,
            size,
            unit,
            image_url,
            category_id,
            category_name,
            barcode,
            is_active,
            min_stock,
            description,
            supplier_id,
            supplier_name,
            expiration_date,
            created_by,
            branch_id,
            branch_name,
        } = body;

        if (!name || String(name).trim() === "") {
            return NextResponse.json(
                { success: false, message: "Product name is required" },
                { status: 400 }
            );
        }

        if (price === undefined || price === null || isNaN(Number(price))) {
            return NextResponse.json(
                { success: false, message: "Product price is required" },
                { status: 400 }
            );
        }

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        const requestBody = {
            action: "create",
            sheet: "Products",
            name: String(name).trim(),
            price: Number(price),
            modal: modal !== undefined && modal !== null ? Number(modal) : 0,
            stock: stock !== undefined && stock !== null ? Number(stock) : 0,
            sold: sold !== undefined && sold !== null ? Number(sold) : 0,
            size: size !== undefined && size !== null ? Number(size) : "",
            unit: unit ? String(unit).trim() : "",
            image_url: image_url ? String(image_url).trim() : "",
            category_id:
                category_id !== undefined && category_id !== null
                    ? String(category_id).trim()
                    : "",
            category_name: category_name ? String(category_name).trim() : "",
            barcode: barcode ? String(barcode).trim() : "",
            is_active:
                typeof is_active === "boolean"
                    ? is_active
                    : String(is_active ?? "true") !== "false",
            min_stock:
                min_stock !== undefined && min_stock !== null ? Number(min_stock) : "",
            description: description ? String(description).trim() : "",
            supplier_id:
                supplier_id !== undefined && supplier_id !== null
                    ? String(supplier_id).trim()
                    : "",
            supplier_name: supplier_name ? String(supplier_name).trim() : "",
            expiration_date: expiration_date
                ? String(expiration_date).trim()
                : "",
            created_by: created_by
                ? String(created_by).trim()
                : sessionUser?.name
                    ? String(sessionUser.name).trim()
                    : sessionUser?.email
                        ? String(sessionUser.email).trim()
                        : "",
            branch_id: branch_id ? String(branch_id).trim() : "",
            branch_name: branch_name ? String(branch_name).trim() : "",
        };

        return await callAppsScript(requestBody);
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}

