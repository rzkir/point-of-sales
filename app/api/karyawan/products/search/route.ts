import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

import { checkAuth, validateAppsScriptUrl, filterKaryawanProductFields } from "@/lib/validation"

export async function GET(request: NextRequest) {
    try {
        const authError = checkAuth(request);
        if (authError) return authError;

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        const { searchParams } = new URL(request.url);
        const branchName = searchParams.get("branch_name");
        const search = searchParams.get("search");
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

        if (!branchName || branchName.trim() === "") {
            return NextResponse.json(
                { success: false, message: "branch_name query parameter is required" },
                { status: 400 }
            );
        }

        const requestBody = {
            action: "list",
            sheet: process.env.NEXT_PUBLIC_PRODUCTS,
        };

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

        const allProducts = Array.isArray(data.data) ? data.data : [];

        let filtered = allProducts;
        if (branchName) {
            const branchLower = branchName.trim().toLowerCase();
            filtered = filtered.filter((product: Record<string, unknown>) => {
                const productBranchName = String(product.branch_name || "").trim().toLowerCase();
                return productBranchName === branchLower;
            });
        }

        if (search && search.trim() !== "") {
            const searchLower = search.trim().toLowerCase();
            filtered = filtered.filter((product: Record<string, unknown>) => {
                const productName = String(product.name || "").trim().toLowerCase();
                return productName.includes(searchLower);
            });
        }

        const total = filtered.length;
        const offset = (page - 1) * limit;
        const startIndex = Math.min(offset, total);
        const endIndex = Math.min(offset + limit, total);
        const paginated = filtered.slice(startIndex, endIndex);
        const shapedData = filterKaryawanProductFields(paginated);

        const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return NextResponse.json({
            success: true,
            message: "Products fetched successfully",
            data: shapedData,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext,
                hasPrev,
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

