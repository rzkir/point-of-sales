import { NextRequest, NextResponse } from "next/server";

// Ganti dengan Web App URL dari Google Apps Script
const APPS_SCRIPT_URL =
    process.env.APPS_SCRIPT_URL || "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

// Secret untuk otorisasi request ke Apps Script
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

/**
 * GET /api/products - List all products with pagination
 * Query params:
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 10, max: 100)
 */
export async function GET(request: NextRequest) {
    try {
        // Auth (header) untuk akses endpoint ini
        if (!API_SECRET || request.headers.get("authorization") !== `Bearer ${API_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Validasi APPS_SCRIPT_URL
        if (
            !APPS_SCRIPT_URL ||
            APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local",
                },
                { status: 500 }
            );
        }

        // Parse query parameters untuk pagination
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
        const offset = (page - 1) * limit;

        const requestBody = {
            action: "list",
            sheet: "Products",
            page: page,
            limit: limit,
            offset: offset,
        };
        console.log("GET /api/products - Request body:", JSON.stringify(requestBody));

        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_SECRET}`,
            },
            body: JSON.stringify(requestBody),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text();
            console.error(
                "Apps Script returned non-JSON response:",
                textResponse.substring(0, 500)
            );
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid response from Apps Script. Please check your Apps Script deployment and URL.",
                },
                { status: 500 }
            );
        }

        const data = await response.json();

        if (!data.success) {
            console.error("Failed to get products:", data.message);
            return NextResponse.json(
                { success: false, message: data.message },
                { status: 400 }
            );
        }

        // Jika Apps Script sudah return pagination metadata, gunakan itu
        // Jika belum, kita hitung sendiri dari data yang dikembalikan
        const products = Array.isArray(data.data) ? data.data : [];
        const total = data.total !== undefined ? data.total : products.length;
        const totalPages = Math.ceil(total / limit);
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
    } catch (error) {
        console.error("Get products error:", error);
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error ? error.message : "Internal server error",
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
        // Auth (header) untuk akses endpoint ini
        if (!API_SECRET || request.headers.get("authorization") !== `Bearer ${API_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Ambil user dari cookie session (httpOnly) supaya created_by tidak kosong
        // Cookie ini di-set saat login di /api/auth/login
        let sessionUser: User | null = null
        const session = request.cookies.get("session")?.value
        if (session) {
            try {
                sessionUser = JSON.parse(session) as User
            } catch {
                // ignore invalid JSON
            }
        }

        const body = await request.json();

        const {
            name,
            price,
            modal,
            stock,
            sold,
            unit,
            image_url,
            category_id,
            barcode,
            is_active,
            min_stock,
            description,
            supplier_id,
            expiration_date,
            created_by,
            branch_id,
        } = body;

        // Minimal validation
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

        // Validasi APPS_SCRIPT_URL
        if (
            !APPS_SCRIPT_URL ||
            APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local",
                },
                { status: 500 }
            );
        }

        const requestBody = {
            action: "create",
            sheet: "Products",
            name: String(name).trim(),
            price: Number(price),
            modal: modal !== undefined && modal !== null ? Number(modal) : 0,
            stock: stock !== undefined && stock !== null ? Number(stock) : 0,
            sold: sold !== undefined && sold !== null ? Number(sold) : 0,
            unit: unit ? String(unit).trim() : "",
            image_url: image_url ? String(image_url).trim() : "",
            // category_id sekarang mengikuti Categories.id (UUID string)
            category_id:
                category_id !== undefined && category_id !== null
                    ? String(category_id).trim()
                    : "",
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
            expiration_date: expiration_date
                ? String(expiration_date).trim()
                : "",
            // Prioritas: payload -> session user.name -> session user.email
            created_by: created_by
                ? String(created_by).trim()
                : sessionUser?.name
                    ? String(sessionUser.name).trim()
                    : sessionUser?.email
                        ? String(sessionUser.email).trim()
                        : "",
            branch_id: branch_id ? String(branch_id).trim() : "",
        };

        console.log(
            "POST /api/products - Sending to Apps Script:",
            JSON.stringify(requestBody)
        );

        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_SECRET}`,
            },
            body: JSON.stringify(requestBody),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text();
            console.error(
                "Apps Script returned non-JSON response:",
                textResponse.substring(0, 500)
            );
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid response from Apps Script. Please check your Apps Script deployment and URL.",
                },
                { status: 500 }
            );
        }

        const data = await response.json();

        console.log("Apps Script response (products):", {
            success: data.success,
            message: data.message,
            hasData: !!data.data,
        });

        if (!data.success) {
            console.error("Create product failed from Apps Script:", data.message);
            return NextResponse.json(
                { success: false, message: data.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: data.message,
            data: data.data,
        });
    } catch (error) {
        console.error("Create product error:", error);
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}

