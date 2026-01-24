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

// Helper: Validate ID
function validateId(id: string | undefined): NextResponse | null {
    if (!id) {
        return NextResponse.json(
            { success: false, message: "Product ID is required" },
            { status: 400 }
        );
    }
    return null;
}

// Helper: Filter product fields to only return specified fields
function filterProductFields(product: unknown): {
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

// Helper: Call Apps Script API and handle response
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
            { status: data.message.includes("not found") ? 404 : 400 }
        );
    }

    // Filter product fields
    const filteredProduct = filterProductFields(data.data);

    return NextResponse.json({
        success: true,
        message: data.message,
        data: filteredProduct,
    });
}

/**
 * GET /api/karyawan/products/[id] - Get product by ID
 * Returns only: id, price, name, image_url, category_name, barcode
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authError = checkAuth(request);
        if (authError) return authError;

        const { id } = await params;
        const idError = validateId(id);
        if (idError) return idError;

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        const requestBody = {
            action: "get",
            sheet: "Products",
            id,
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
