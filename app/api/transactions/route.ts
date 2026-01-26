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
async function callAppsScript(
    requestBody: Record<string, unknown>,
    includePagination = false,
    clientPage?: number,
    clientLimit?: number
) {
    // Extract filters for filtering in Next.js (don't send to Apps Script)
    // Only remove these for GET/list operations, not for create/update operations
    const branchNameFilter = requestBody.branch_name as string | undefined;
    const statusFilter = requestBody.status as string | undefined;
    const paymentStatusFilter = requestBody.payment_status as string | undefined;
    const searchFilter = requestBody.search as string | undefined;
    const appsScriptRequestBody = { ...requestBody };

    // Only remove filters for list operations (when action is "list")
    // For create/update operations, keep branch_name and status
    if (requestBody.action === "list") {
        delete appsScriptRequestBody.branch_name;
        delete appsScriptRequestBody.status;
        delete appsScriptRequestBody.payment_status;
        delete appsScriptRequestBody.search;
    }

    const response = await fetch(APPS_SCRIPT_URL!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_SECRET}`,
        },
        body: JSON.stringify(appsScriptRequestBody), // Don't send filters to Apps Script
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

    if (includePagination) {
        const allTransactions = Array.isArray(data.data) ? data.data : [];

        // Filter by branch_name if provided (case-insensitive)
        let filteredByBranch = allTransactions;
        if (branchNameFilter) {
            const branchNameLower = branchNameFilter.trim().toLowerCase();
            filteredByBranch = allTransactions.filter((transaction: Record<string, unknown>) => {
                const transactionBranchName = String(transaction.branch_name || "").trim().toLowerCase();
                return transactionBranchName === branchNameLower;
            });
        }

        // Filter by status if provided (case-insensitive)
        let filteredByStatus = filteredByBranch;
        if (statusFilter) {
            const statusLower = statusFilter.trim().toLowerCase();
            filteredByStatus = filteredByBranch.filter((transaction: Record<string, unknown>) => {
                const transactionStatus = String(transaction.status || "").trim().toLowerCase();
                return transactionStatus === statusLower;
            });
        }

        // Filter by payment_status if provided (case-insensitive)
        let filteredByPaymentStatus = filteredByStatus;
        if (paymentStatusFilter) {
            const paymentStatusLower = paymentStatusFilter.trim().toLowerCase();
            filteredByPaymentStatus = filteredByStatus.filter((transaction: Record<string, unknown>) => {
                const transactionPaymentStatus = String(transaction.payment_status || "").trim().toLowerCase();
                return transactionPaymentStatus === paymentStatusLower;
            });
        }

        // Filter by search (transaction_number or customer_name) if provided (case-insensitive, partial match)
        let filteredBySearch = filteredByPaymentStatus;
        if (searchFilter) {
            const searchLower = searchFilter.trim().toLowerCase();
            filteredBySearch = filteredByPaymentStatus.filter((transaction: Record<string, unknown>) => {
                const transactionNumber = String(transaction.transaction_number || "").trim().toLowerCase();
                const customerName = String(transaction.customer_name || "").trim().toLowerCase();
                return transactionNumber.includes(searchLower) || customerName.includes(searchLower);
            });
        }

        // Total count is based on filtered data (after all filters)
        const total = filteredBySearch.length;

        // Use client-side pagination parameters if provided, otherwise use requestBody
        const page = clientPage || (requestBody.page as number) || 1;
        const limit = clientLimit || (requestBody.limit as number) || 10;
        const totalPages = Math.ceil(total / limit);

        // Apply pagination to filtered data
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredBySearch.slice(startIndex, endIndex);

        return NextResponse.json({
            success: true,
            data: paginatedData,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    }

    return NextResponse.json({
        success: true,
        data: data.data,
    });
}

/**
 * GET /api/transactions - Get all transactions with pagination
 * Query params:
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 10, max: 100)
 *   - branch_name: filter by branch name (optional)
 *   - status: filter by transaction status (optional: pending, completed, cancelled, return)
 *   - payment_status: filter by payment status (optional: paid, unpaid, partial)
 *   - search: search by transaction number or customer name (optional, partial match)
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
        const status = searchParams.get("status");
        const paymentStatus = searchParams.get("payment_status");
        const search = searchParams.get("search");

        // If any filter is provided, request ALL data from Apps Script without pagination
        // We'll do filtering and pagination in Next.js after getting all data
        const requestBody: Record<string, unknown> = {
            action: "list",
            sheet: "Transactions",
        };

        const hasFilter = (branchName && branchName.trim() !== "") ||
            (status && status.trim() !== "") ||
            (paymentStatus && paymentStatus.trim() !== "") ||
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
            if (status && status.trim() !== "") {
                requestBody.status = status.trim();
            }
            if (paymentStatus && paymentStatus.trim() !== "") {
                requestBody.payment_status = paymentStatus.trim();
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
            total,
            subtotal,
            branch_name,
            payment_method = "cash",
            status = "pending",
            paid_amount = 0,
            is_credit = false,
            items = [], // Array of items/products in the transaction
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

        if (!branch_name || branch_name.trim() === "") {
            return NextResponse.json(
                { success: false, message: "Branch name is required" },
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

        // Hitung payment_status berdasarkan paid_amount dan total
        let paymentStatus: "paid" | "unpaid" | "partial";
        if (paidAmount <= 0) {
            paymentStatus = "unpaid";
        } else if (paidAmount >= totalAmount) {
            paymentStatus = "paid";
        } else {
            paymentStatus = "partial";
        }

        // Format items untuk disimpan sebagai array
        const formattedItems = Array.isArray(items) ? items.map((item: {
            product_id?: string | number;
            product_name?: string;
            quantity?: number;
            price?: number;
            subtotal?: number;
        }) => ({
            product_id: String(item.product_id || ""),
            product_name: item.product_name || "",
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            subtotal: Number(item.subtotal) || (Number(item.quantity) * Number(item.price)),
        })) : [];

        const requestBody = {
            action: "create",
            sheet: "Transactions",
            customer_name: customer_name || "",
            discount: Number(discount) || 0,
            total: totalAmount,
            subtotal: Number(subtotal),
            paid_amount: paidAmount,
            is_credit: isCredit,
            branch_name: branch_name || "",
            payment_method: payment_method || "cash",
            payment_status: paymentStatus,
            status: finalStatus,
            created_by: sessionUser?.name || sessionUser?.email || "",
            items: formattedItems,
        };

        // Create transaction first (items akan disimpan sebagai JSON string di kolom items)
        const transactionResponse = await callAppsScript(requestBody);

        // Clone response to read data without consuming the original
        const responseClone = transactionResponse.clone();
        const transactionResponseData = await responseClone.json();

        // Update product stock if transaction is completed OR if status is pending but payment_status is partial
        // Stock should be reduced when:
        // 1. Status is completed (fully paid or credit fully paid)
        // 2. Status is pending but payment_status is partial (partially paid credit)
        const shouldUpdateStock = finalStatus === "completed" ||
            (finalStatus === "pending" && paymentStatus === "partial");

        // If transaction created successfully and items are provided, update product stock
        // Items sudah disimpan sebagai array di kolom items di Transactions sheet, tidak perlu disimpan ke TransactionItems sheet terpisah
        if (transactionResponseData.success && shouldUpdateStock && Array.isArray(items) && items.length > 0) {
            // Update stock for each item
            const stockUpdatePromises = items.map(async (item: {
                product_id?: string | number;
                quantity?: number;
            }) => {
                if (!item.product_id || !item.quantity || item.quantity <= 0) {
                    return null; // Skip invalid items
                }

                try {
                    // Get current product stock
                    const getProductResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${item.product_id}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${API_SECRET}`,
                            },
                        }
                    );

                    if (getProductResponse.ok) {
                        const productData = await getProductResponse.json();
                        if (productData.success && productData.data) {
                            const currentStock = Number(productData.data.stock) || 0;
                            const soldQuantity = Number(productData.data.sold) || 0;
                            const newStock = Math.max(0, currentStock - Number(item.quantity));
                            const newSold = soldQuantity + Number(item.quantity);

                            // Update product stock
                            await fetch(
                                `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${item.product_id}`,
                                {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${API_SECRET}`,
                                    },
                                    body: JSON.stringify({
                                        stock: newStock,
                                        sold: newSold,
                                    }),
                                }
                            );
                        }
                    }
                } catch (stockError) {
                    console.error("Error updating product stock:", stockError);
                    // Don't fail transaction if stock update fails
                }
                return null;
            });

            // Wait for all stock updates to complete
            await Promise.all(stockUpdatePromises);
        }

        return transactionResponse;
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
