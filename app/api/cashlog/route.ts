import { NextRequest, NextResponse } from "next/server";

import { checkAuth, validateAppsScriptUrl, callAppsScript, getSessionUser } from "@/lib/validation";

const CASHLOG_SHEET = process.env.NEXT_PUBLIC_CASHLOG;

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

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

        const requestBody: Record<string, unknown> = {
            action: "list",
            sheet: CASHLOG_SHEET,
            page,
            limit,
        };
        if (branchName && branchName.trim() !== "") {
            requestBody.branch_name = branchName.trim();
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
            amount,
            cashier_name = "",
            branch_name = "",
            type = "opening_cash",
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
        // Nama kasir dan cabang dari user login (session), fallback ke body
        const cashierName = String(
            sessionUser?.name || sessionUser?.email || cashier_name || ""
        ).trim();
        const branchName = String(
            sessionUser?.branchName || branch_name || ""
        ).trim();
        if (!branchName) {
            return NextResponse.json(
                { success: false, message: "Branch name is required (from session or body)" },
                { status: 400 }
            );
        }
        const validTypes = ["opening_cash", "closing_cash"];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { success: false, message: "Type must be opening_cash or closing_cash" },
                { status: 400 }
            );
        }

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        const status = type === "opening_cash" ? "approved" : "pending";
        const requestBody = {
            action: "create",
            sheet: CASHLOG_SHEET,
            date: String(date).trim(),
            amount: Number(amount),
            cashier_name: cashierName,
            branch_name: branchName,
            type,
            status,
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
