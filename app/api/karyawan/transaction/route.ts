import { NextRequest, NextResponse } from "next/server";

import { checkAuth, validateAppsScriptUrl, callAppsScriptKaryawan } from "@/lib/validation"

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

        const requestBody = {
            action: "list",
            sheet: process.env.NEXT_PUBLIC_TRANSACTIONS,
        };

        const requestBodyWithBranch = {
            ...requestBody,
            branch_name: branchName.trim(),
        };

        return await callAppsScriptKaryawan(requestBodyWithBranch, true, page, limit);
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

