import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

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

// Helper: Filter product fields to only return specified fields
function filterProductFields(products: unknown[]): Array<{
    id?: number;
    price?: number;
    name?: string;
    image_url?: string;
    category_name?: string;
    barcode?: string;
    branch_name?: string;
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
        };
    });
}

// Helper: Call Apps Script API and handle response
async function callAppsScript(
    requestBody: Record<string, unknown>,
    includePagination = false,
    clientPage?: number,
    clientLimit?: number
) {
    // Extract branch_name for filtering in Next.js (don't send to Apps Script)
    const branchNameFilter = requestBody.branch_name as string | undefined;
    const appsScriptRequestBody = { ...requestBody };
    delete appsScriptRequestBody.branch_name;

    const response = await fetch(APPS_SCRIPT_URL!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_SECRET}`,
        },
        body: JSON.stringify(appsScriptRequestBody), // Don't send branch_name to Apps Script
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

        // Sort products by created_at or updated_at (newest first), fallback to id
        const sortedProducts = [...products].sort((a: ProductRow, b: ProductRow) => {
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
        // Use the branchNameFilter that was extracted earlier (not from requestBody since it was removed)
        let filteredByBranch = sortedProducts;
        if (branchNameFilter) {
            const branchNameLower = branchNameFilter.trim().toLowerCase();
            filteredByBranch = sortedProducts.filter((product: Record<string, unknown>) => {
                const productBranchName = String(product.branch_name || "").trim().toLowerCase();
                return productBranchName === branchNameLower;
            });
        }

        // Total count is based on filtered data (after branch filter)
        // This ensures pagination works correctly for filtered results
        const total = filteredByBranch.length;

        // Use client-side pagination parameters if provided, otherwise use requestBody
        const page = clientPage !== undefined ? clientPage : ((requestBody.page as number) || 1);
        const limit = clientLimit !== undefined ? clientLimit : ((requestBody.limit as number) || 10);
        const offset = (page - 1) * limit;

        // Apply pagination to filtered results BEFORE filtering fields
        // Make sure we don't go beyond the array length
        const startIndex = Math.min(offset, total);
        const endIndex = Math.min(offset + limit, total);
        const paginatedByBranch = filteredByBranch.slice(startIndex, endIndex);

        // Filter fields after pagination
        const filteredProducts = filterProductFields(paginatedByBranch);

        // Calculate pagination metadata
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

    // Filter by branch_name if provided (case-insensitive)
    // Use the branchNameFilter that was extracted earlier (not from requestBody since it was removed)
    let filteredData = Array.isArray(data.data) ? data.data : data.data;
    if (branchNameFilter && Array.isArray(filteredData)) {
        const branchNameLower = branchNameFilter.trim().toLowerCase();
        filteredData = filteredData.filter((product: Record<string, unknown>) => {
            const productBranchName = String(product.branch_name || "").trim().toLowerCase();
            return productBranchName === branchNameLower;
        });
    }

    const finalData = Array.isArray(filteredData) ? filterProductFields(filteredData) : filteredData;

    return NextResponse.json({
        success: true,
        message: data.message,
        data: finalData,
    });
}

/**
 * GET /api/karyawan/products - List products filtered by branch_name with pagination
 * Query params:
 *   - branch_name: branch name to filter products (required)
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 10, max: 100)
 */
export async function GET(request: NextRequest) {
    try {
        const authError = checkAuth(request);
        if (authError) return authError;

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        const { searchParams } = new URL(request.url);
        const branchName = searchParams.get("branch_name");

        if (!branchName || branchName.trim() === "") {
            return NextResponse.json(
                { success: false, message: "branch_name query parameter is required" },
                { status: 400 }
            );
        }

        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

        // Request ALL data from Apps Script without pagination parameters
        // Don't send page, limit, offset, or branch_name to Apps Script
        // We'll do filtering and pagination in Next.js after getting all data
        const requestBody = {
            action: "list",
            sheet: "Products",
            // Don't send pagination params - we want ALL data
        };

        // Pass branch_name separately for filtering in Next.js (not to Apps Script)
        // This ensures we get ALL products first, then filter by branch in Next.js
        const requestBodyWithBranch = {
            ...requestBody,
            branch_name: branchName.trim(), // Only used for filtering in Next.js, not sent to Apps Script
        };

        return await callAppsScript(requestBodyWithBranch, true, page, limit);
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
