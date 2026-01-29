import { NextRequest, NextResponse } from "next/server";

import { checkAuth, validateAppsScriptUrl, filterProductFields, callAppsScriptPopular } from "@/lib/validation"

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

        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
        const branchNameLower = branchName.trim().toLowerCase();

        const requestBody = {
            action: "list",
            sheet: process.env.NEXT_PUBLIC_PRODUCTS,
        };

        const data = await callAppsScriptPopular(requestBody);
        const allProducts: ProductRow[] = Array.isArray(data.data) ? data.data : [];

        const filteredByBranch = allProducts.filter((p) => {
            const productBranchName = String(p.branch_name || "").trim().toLowerCase();
            if (productBranchName !== branchNameLower) return false;

            const sold = Number(p.sold) || 0;
            return sold > 0;
        });

        const sortedBySoldDesc = [...filteredByBranch].sort((a, b) => {
            const soldA = Number(a.sold) || 0;
            const soldB = Number(b.sold) || 0;
            if (soldB !== soldA) return soldB - soldA;

            if (a.updated_at && b.updated_at) {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
            if (a.created_at && b.created_at) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (a.id != null && b.id != null) return Number(b.id) - Number(a.id);
            return 0;
        });

        const top = sortedBySoldDesc.slice(0, limit);

        return NextResponse.json({
            success: true,
            message: "Popular products fetched successfully",
            data: filterProductFields(top),
            meta: {
                branch_name: branchName.trim(),
                limit,
                total_in_branch: filteredByBranch.length,
            },
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