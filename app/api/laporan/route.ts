import { NextRequest, NextResponse } from "next/server";

import { checkAuth, validateAppsScriptUrl, callAppsScript, getSessionUser } from "@/lib/validation";

const STORE_EXPENSE_SHEET = process.env.NEXT_PUBLIC_STORE_EXPENSE;

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

const VALID_CATEGORIES = ["operasional", "listrik", "air", "pembelian", "lainnya"];

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

        const requestBody: Record<string, unknown> = {
            action: "list",
            sheet: STORE_EXPENSE_SHEET,
            page,
            limit,
        };
        if (branchName && branchName.trim() !== "") {
            requestBody.branch_name = branchName.trim();
        }
        if (status && status.trim() !== "") {
            requestBody.status = status.trim();
        }

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
                { success: false, message: "Invalid response from Apps Script." },
                { status: 500 }
            );
        }

        const data = await response.json();
        if (!data.success) {
            return NextResponse.json(
                { success: false, message: data.message },
                { status: data.message?.includes("not found") ? 404 : 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: data.message,
            data: data.data ?? [],
            pagination: data.pagination,
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

export async function POST(request: NextRequest) {
    try {
        const authError = checkAuth(request);
        if (authError) return authError;

        const sessionUser = getSessionUser(request);
        const body = await request.json();

        const {
            date,
            category = "lainnya",
            amount,
            description = "",
            branch_name,
            receipt_url = "",
        } = body;

        if (!date || String(date).trim() === "") {
            return NextResponse.json(
                { success: false, message: "Date is required" },
                { status: 400 }
            );
        }
        if (amount === undefined || amount === null || isNaN(Number(amount))) {
            return NextResponse.json(
                { success: false, message: "Amount is required" },
                { status: 400 }
            );
        }
        const branchName = String(
            sessionUser?.branchName ?? branch_name ?? ""
        ).trim();
        if (!branchName) {
            return NextResponse.json(
                { success: false, message: "Branch name is required (from session or body)" },
                { status: 400 }
            );
        }
        if (!VALID_CATEGORIES.includes(category)) {
            return NextResponse.json(
                { success: false, message: "Invalid category" },
                { status: 400 }
            );
        }

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        const requestBody = {
            action: "create",
            sheet: STORE_EXPENSE_SHEET,
            date: String(date).trim(),
            category,
            amount: Number(amount),
            description: String(description || "").trim(),
            branch_name: branchName,
            cashier_name: sessionUser?.name || sessionUser?.email || "",
            receipt_url: String(receipt_url || "").trim(),
            status: "pending",
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
