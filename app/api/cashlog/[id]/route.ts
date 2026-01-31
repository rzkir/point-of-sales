import { NextRequest, NextResponse } from "next/server";

import { checkAuth, validateAppsScriptUrl, getSessionUser } from "@/lib/validation";

const CASHLOG_SHEET = process.env.NEXT_PUBLIC_CASHLOG;

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authError = checkAuth(request);
        if (authError) return authError;

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        const { id } = await params;
        if (!id) {
            return NextResponse.json(
                { success: false, message: "Cash log ID is required" },
                { status: 400 }
            );
        }

        const response = await fetch(APPS_SCRIPT_URL!, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_SECRET}`,
            },
            body: JSON.stringify({ action: "get", sheet: CASHLOG_SHEET, id }),
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
            data: data.data,
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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authError = checkAuth(request);
        if (authError) return authError;

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        const { id } = await params;
        if (!id) {
            return NextResponse.json(
                { success: false, message: "Cash log ID is required" },
                { status: 400 }
            );
        }

        const sessionUser = getSessionUser(request);
        const body = await request.json();
        const status = body.status;
        let approved_by = body.approved_by;
        let approved_at = body.approved_at;

        const validStatuses = ["pending", "approved", "rejected"];
        if (status !== undefined && status !== "" && !validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, message: "Status must be pending, approved, or rejected" },
                { status: 400 }
            );
        }

        if ((status === "approved" || status === "rejected") && approved_by === undefined && sessionUser?.name) {
            approved_by = sessionUser.name;
        }
        if ((status === "approved" || status === "rejected") && approved_at === undefined) {
            approved_at = new Date().toISOString();
        }

        const requestBody: Record<string, unknown> = {
            action: "update",
            sheet: CASHLOG_SHEET,
            id,
        };
        if (status !== undefined) requestBody.status = status;
        if (approved_by !== undefined) requestBody.approved_by = approved_by;
        if (approved_at !== undefined) requestBody.approved_at = approved_at;

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
            data: data.data,
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
