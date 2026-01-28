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

type ProductRow = {
    id?: string | number;
    name?: string;
    price?: number;
    image_url?: string;
    category_name?: string;
    barcode?: string;
    branch_name?: string;
    unit?: string;
    sold?: number;
    stock?: number;
    updated_at?: string;
    created_at?: string;
};

function filterPopularProductFields(products: ProductRow[]) {
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

async function callAppsScript(requestBody: Record<string, unknown>) {
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

/**
 * GET /api/karyawan/products/popular - List top sold products per branch
 * Query params:
 *   - branch_name: branch name to filter products (required)
 *   - limit: number of products to return (default: 10, max: 100)
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

        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
        const branchNameLower = branchName.trim().toLowerCase();

        const requestBody = {
            action: "list",
            sheet: "Products",
        };

        const data = await callAppsScript(requestBody);
        const allProducts: ProductRow[] = Array.isArray(data.data) ? data.data : [];

        const filteredByBranch = allProducts.filter((p) => {
            const productBranchName = String(p.branch_name || "").trim().toLowerCase();
            if (productBranchName !== branchNameLower) return false;

            // Only show products that actually have sales
            const sold = Number(p.sold) || 0;
            return sold > 0;
        });

        const sortedBySoldDesc = [...filteredByBranch].sort((a, b) => {
            const soldA = Number(a.sold) || 0;
            const soldB = Number(b.sold) || 0;
            if (soldB !== soldA) return soldB - soldA;

            // Tie-breaker: newest updated_at/created_at/id
            if (a.updated_at && b.updated_at) {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
            if (a.created_at && b.created_at) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (a.id != null && b.id != null) return Number(b.id) - Number(a.id);
            return 0;
        });

        const top = sortedBySoldDesc.slice(0, limit);

        return NextResponse.json({
            success: true,
            message: "Popular products fetched successfully",
            data: filterPopularProductFields(top),
            meta: {
                branch_name: branchName.trim(),
                limit,
                total_in_branch: filteredByBranch.length,
            },
        });
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

