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

// Helper: Get session user from cookie
function getSessionUser(request: NextRequest): { name?: string; email?: string } | null {
    const session = request.cookies.get("session")?.value;
    if (session) {
        try {
            return JSON.parse(session) as { name?: string; email?: string };
        } catch {
            return null;
        }
    }
    return null;
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

    // Cek content type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("Apps Script returned non-JSON response:", textResponse.substring(0, 500));
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
        console.error("Failed to call Apps Script:", data.message);
        return NextResponse.json(
            {
                success: false,
                message: data.message || "Failed to process request",
            },
            { status: 400 }
        );
    }

    if (includePagination && data.pagination) {
        return NextResponse.json({
            success: true,
            data: data.data,
            pagination: data.pagination,
        });
    }

    return NextResponse.json({
        success: true,
        data: data.data,
    });
}

/**
 * GET /api/transactions - Get all transactions with pagination
 */
export async function GET(request: NextRequest) {
    try {
        const authError = checkAuth(request);
        if (authError) return authError;

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("limit") || "10";

        const requestBody = {
            action: "list",
            sheet: "Transactions",
            page: Number(page),
            limit: Number(limit),
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

/**
 * POST /api/transactions - Create a new transaction
 */
export async function POST(request: NextRequest) {
    try {
        const authError = checkAuth(request);
        if (authError) return authError;

        const sessionUser = getSessionUser(request);
        const body = await request.json();

        const {
            customer_name,
            discount = 0,
            tax = 0,
            total,
            subtotal,
            branch_name,
            payment_method = "cash",
            status = "pending",
            paid_amount = 0,
            is_credit = false,
        } = body;

        if (!subtotal || subtotal === undefined || isNaN(Number(subtotal))) {
            return NextResponse.json(
                { success: false, message: "Subtotal is required" },
                { status: 400 }
            );
        }

        if (!total || total === undefined || isNaN(Number(total))) {
            return NextResponse.json(
                { success: false, message: "Total is required" },
                { status: 400 }
            );
        }

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        // Hitung nilai numerik
        const totalAmount = Number(total);
        const paidAmount = Number(paid_amount) || 0;
        const isCredit = Boolean(is_credit);

        // Tentukan status berdasarkan pembayaran
        // Jika bukan kasbon, otomatis dibayar penuh (status = completed)
        // Jika kasbon, cek apakah sudah dibayar penuh atau belum
        let finalStatus = status;
        if (!finalStatus || finalStatus === "pending") {
            if (!isCredit) {
                // Bukan kasbon = sudah dibayar penuh
                finalStatus = "completed";
            } else {
                // Kasbon: cek apakah sudah dibayar penuh
                if (paidAmount >= totalAmount) {
                    finalStatus = "completed";
                } else {
                    finalStatus = "pending";
                }
            }
        }

        const requestBody = {
            action: "create",
            sheet: "Transactions",
            customer_name: customer_name || "",
            discount: Number(discount) || 0,
            tax: Number(tax) || 0,
            total: totalAmount,
            subtotal: Number(subtotal),
            paid_amount: paidAmount,
            is_credit: isCredit,
            branch_name: branch_name || "",
            payment_method: payment_method || "cash",
            status: finalStatus,
            created_by: sessionUser?.name || sessionUser?.email || "",
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
