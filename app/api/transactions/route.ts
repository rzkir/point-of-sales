import { NextRequest, NextResponse } from "next/server";

import { checkAuth, validateAppsScriptUrl, callAppsScriptWithPagination, getSessionUser } from "@/lib/validation"

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

        const requestBody: Record<string, unknown> = {
            action: "list",
            sheet: process.env.NEXT_PUBLIC_TRANSACTIONS as string,
        };

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

        return await callAppsScriptWithPagination(requestBody, true, page, limit);
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
            items = [],
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

        const totalAmount = Number(total);
        const paidAmount = Number(paid_amount) || 0;
        const isCredit = Boolean(is_credit);

        let finalStatus = status;
        if (!finalStatus || finalStatus === "pending") {
            if (!isCredit) {
                finalStatus = "completed";
            } else {
                if (paidAmount >= totalAmount) {
                    finalStatus = "completed";
                } else {
                    finalStatus = "pending";
                }
            }
        }

        let paymentStatus: "paid" | "unpaid" | "partial";
        if (paidAmount <= 0) {
            paymentStatus = "unpaid";
        } else if (paidAmount >= totalAmount) {
            paymentStatus = "paid";
        } else {
            paymentStatus = "partial";
        }

        const formattedItems = Array.isArray(items) ? items.map((item: {
            product_id?: string | number;
            product_name?: string;
            image_url?: string;
            quantity?: number;
            price?: number;
            subtotal?: number;
            unit?: string;
        }) => ({
            product_id: String(item.product_id || ""),
            product_name: item.product_name || "",
            image_url: item.image_url ? String(item.image_url) : "",
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            subtotal: Number(item.subtotal) || (Number(item.quantity) * Number(item.price)),
            unit: item.unit ? String(item.unit) : "",
        })) : [];

        const requestBody = {
            action: "create",
            sheet: process.env.NEXT_PUBLIC_TRANSACTIONS as string,
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

        const transactionResponse = await callAppsScriptWithPagination(requestBody, true, 1, 100);

        const responseClone = transactionResponse.clone();
        const transactionResponseData = await responseClone.json();

        const shouldUpdateStock = finalStatus === "completed" ||
            (finalStatus === "pending" && paymentStatus === "partial");

        if (transactionResponseData.success && shouldUpdateStock && Array.isArray(items) && items.length > 0) {
            const stockUpdatePromises = items.map(async (item: {
                product_id?: string | number;
                quantity?: number;
            }) => {
                if (!item.product_id || !item.quantity || item.quantity <= 0) {
                    return null;
                }

                try {
                    const getProductResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${item.product_id}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`,
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

                            await fetch(
                                `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${item.product_id}`,
                                {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`,
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
                }
                return null;
            });

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
