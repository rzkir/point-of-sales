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

type TransactionRow = {
    id?: string | number;
    created_at?: string;
    updated_at?: string;
    transaction_number?: string;
    customer_name?: string;
    branch_name?: string;
    status?: string;
    payment_status?: string;
    total?: number;
    subtotal?: number;
    paid_amount?: number;
    is_credit?: boolean;
    items?: unknown;
};

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
        body: JSON.stringify(appsScriptRequestBody),
    });

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
        return NextResponse.json(
            { success: false, message: data.message },
            { status: 400 }
        );
    }

    if (includePagination) {
        const allTransactions: TransactionRow[] = Array.isArray(data.data) ? data.data : [];

        // Sort newest first (updated_at -> created_at -> id)
        const sortedTransactions = [...allTransactions].sort((a, b) => {
            if (a.updated_at && b.updated_at) {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
            if (a.created_at && b.created_at) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (a.id != null && b.id != null) {
                return Number(b.id) - Number(a.id);
            }
            return 0;
        });

        // Filter by branch_name (case-insensitive)
        let filteredByBranch = sortedTransactions;
        if (branchNameFilter) {
            const branchNameLower = branchNameFilter.trim().toLowerCase();
            filteredByBranch = sortedTransactions.filter((trx) => {
                const trxBranchName = String(trx.branch_name || "").trim().toLowerCase();
                return trxBranchName === branchNameLower;
            });
        }

        const total = filteredByBranch.length;
        const page = clientPage !== undefined ? clientPage : ((requestBody.page as number) || 1);
        const limit = clientLimit !== undefined ? clientLimit : ((requestBody.limit as number) || 10);
        const offset = (page - 1) * limit;
        const startIndex = Math.min(offset, total);
        const endIndex = Math.min(offset + limit, total);
        const paginated = filteredByBranch.slice(startIndex, endIndex);

        const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return NextResponse.json({
            success: true,
            message: data.message,
            data: paginated,
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

    // Non-paginated (not used currently)
    let filteredData = Array.isArray(data.data) ? data.data : data.data;
    if (branchNameFilter && Array.isArray(filteredData)) {
        const branchNameLower = branchNameFilter.trim().toLowerCase();
        filteredData = filteredData.filter((trx: Record<string, unknown>) => {
            const trxBranchName = String(trx.branch_name || "").trim().toLowerCase();
            return trxBranchName === branchNameLower;
        });
    }

    return NextResponse.json({
        success: true,
        message: data.message,
        data: filteredData,
    });
}

/**
 * GET /api/karyawan/transaction - List transactions filtered by branch_name with pagination
 * Query params:
 *   - branch_name: branch name to filter transactions (required)
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

        // Request ALL data from Apps Script, filter + paginate in Next.js
        const requestBody = {
            action: "list",
            sheet: "Transactions",
        };

        const requestBodyWithBranch = {
            ...requestBody,
            branch_name: branchName.trim(), // only for filtering in Next.js, not sent to Apps Script
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

