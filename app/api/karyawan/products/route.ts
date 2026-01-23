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
        };
    });
}

// Helper: Call Apps Script API and handle response
async function callAppsScript(requestBody: Record<string, unknown>, includePagination = false) {
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

    if (includePagination) {
        const products = Array.isArray(data.data) ? data.data : [];
        const filteredProducts = filterProductFields(products);
        const total = data.total !== undefined ? data.total : products.length;
        const page = (requestBody.page as number) || 1;
        const limit = (requestBody.limit as number) || 10;
        const totalPages = Math.ceil(total / limit);
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

    const filteredData = Array.isArray(data.data) ? filterProductFields(data.data) : data.data;

    return NextResponse.json({
        success: true,
        message: data.message,
        data: filteredData,
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
        const offset = (page - 1) * limit;

        const requestBody = {
            action: "list",
            sheet: "Products",
            page,
            limit,
            offset,
            branch_name: branchName.trim(),
        };

        return await callAppsScript(requestBody, true);
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
