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
        const categoryId = searchParams.get("category_id");
        const categoryName = searchParams.get("category_name");
        const supplierName = searchParams.get("supplier_name");
        const search = searchParams.get("search");

        const requestBody: Record<string, unknown> = {
            action: "list",
            sheet: process.env.NEXT_PUBLIC_PRODUCTS,
        };

        const hasFilter = (branchName && branchName.trim() !== "") ||
            (categoryId && categoryId.trim() !== "") ||
            (categoryName && categoryName.trim() !== "") ||
            (supplierName && supplierName.trim() !== "") ||
            (search && search.trim() !== "");

        if (!hasFilter) {
            const offset = (page - 1) * limit;
            requestBody.page = page;
            requestBody.limit = limit;
            requestBody.offset = offset;
        } else {
            if (branchName && branchName.trim() !== "") {
                requestBody.branch_name = branchName.trim();
            }
            if (categoryId && categoryId.trim() !== "") {
                requestBody.category_id = categoryId.trim();
            }
            if (categoryName && categoryName.trim() !== "") {
                requestBody.category_name = categoryName.trim();
            }
            if (supplierName && supplierName.trim() !== "") {
                requestBody.supplier_name = supplierName.trim();
            }
            if (search && search.trim() !== "") {
                requestBody.search = search.trim();
            }
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
            name,
            price,
            modal,
            stock,
            sold,
            size,
            unit,
            image_url,
            category_id,
            category_name,
            barcode,
            is_active,
            min_stock,
            description,
            supplier_id,
            supplier_name,
            expiration_date,
            created_by,
            branch_id,
            branch_name,
        } = body;

        if (!name || String(name).trim() === "") {
            return NextResponse.json(
                { success: false, message: "Product name is required" },
                { status: 400 }
            );
        }

        if (price === undefined || price === null || isNaN(Number(price))) {
            return NextResponse.json(
                { success: false, message: "Product price is required" },
                { status: 400 }
            );
        }

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        const requestBody = {
            action: "create",
            sheet: process.env.NEXT_PUBLIC_PRODUCTS,
            name: String(name).trim(),
            price: Number(price),
            modal: modal !== undefined && modal !== null ? Number(modal) : 0,
            stock: stock !== undefined && stock !== null ? Number(stock) : 0,
            sold: sold !== undefined && sold !== null ? Number(sold) : 0,
            size: size !== undefined && size !== null ? Number(size) : "",
            unit: unit ? String(unit).trim() : "",
            image_url: image_url ? String(image_url).trim() : "",
            category_id:
                category_id !== undefined && category_id !== null
                    ? String(category_id).trim()
                    : "",
            category_name: category_name ? String(category_name).trim() : "",
            barcode: barcode ? String(barcode).trim() : "",
            is_active:
                typeof is_active === "boolean"
                    ? is_active
                    : String(is_active ?? "true") !== "false",
            min_stock:
                min_stock !== undefined && min_stock !== null ? Number(min_stock) : "",
            description: description ? String(description).trim() : "",
            supplier_id:
                supplier_id !== undefined && supplier_id !== null
                    ? String(supplier_id).trim()
                    : "",
            supplier_name: supplier_name ? String(supplier_name).trim() : "",
            expiration_date: expiration_date
                ? String(expiration_date).trim()
                : "",
            created_by: created_by
                ? String(created_by).trim()
                : sessionUser?.name
                    ? String(sessionUser.name).trim()
                    : sessionUser?.email
                        ? String(sessionUser.email).trim()
                        : "",
            branch_id: branch_id ? String(branch_id).trim() : "",
            branch_name: branch_name ? String(branch_name).trim() : "",
        };

        return await callAppsScriptWithPagination(requestBody);
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

