import { NextRequest, NextResponse } from "next/server";

import { checkAuth, validateAppsScriptUrl, validateId, callAppsScript } from "@/lib/validation";

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
            sheet: process.env.NEXT_PUBLIC_TRANSACTIONS,
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
