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
            { success: false, message: "Transaction ID is required" },
            { status: 400 }
        );
    }
    return null;
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

    return NextResponse.json({
        success: true,
        data: data.data,
        message: data.message,
    });
}

/**
 * GET /api/transactions/[id] - Get transaction by ID
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
            sheet: "Transactions",
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

/**
 * PUT /api/transactions/[id] - Update transaction
 */
export async function PUT(
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

        const body = await request.json();
        const {
            customer_name,
            discount,
            tax,
            total,
            subtotal,
            paid_amount,
            is_credit,
            branch_name,
            payment_method,
            payment_status,
            status,
        } = body;

        const requestBody: Record<string, unknown> = {
            action: "update",
            sheet: "Transactions",
            id,
        };

        // Only include fields that are provided
        if (customer_name !== undefined) requestBody.customer_name = customer_name;
        if (discount !== undefined) requestBody.discount = Number(discount);
        if (tax !== undefined) requestBody.tax = Number(tax);
        if (total !== undefined) requestBody.total = Number(total);
        if (subtotal !== undefined) requestBody.subtotal = Number(subtotal);
        if (paid_amount !== undefined) requestBody.paid_amount = Number(paid_amount);
        if (is_credit !== undefined) requestBody.is_credit = Boolean(is_credit);
        if (branch_name !== undefined) requestBody.branch_name = branch_name;
        if (payment_method !== undefined) requestBody.payment_method = payment_method;
        if (payment_status !== undefined) requestBody.payment_status = payment_status;
        if (status !== undefined) requestBody.status = status;

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

/**
 * DELETE /api/transactions/[id] - Delete transaction
 */
export async function DELETE(
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
            action: "delete",
            sheet: "Transactions",
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
