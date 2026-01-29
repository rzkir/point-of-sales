import { NextRequest, NextResponse } from "next/server";

import { checkAuth, validateAppsScriptUrl, validateId, callAppsScript } from "@/lib/validation"

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
            sheet: process.env.NEXT_PUBLIC_TRANSACTIONS as string,
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

export async function PUT(
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

        const body = await request.json();
        const {
            customer_name,
            discount,
            tax,
            total,
            subtotal,
            paid_amount,
            is_credit,
            branch_name,
            payment_method,
            payment_status,
            status,
        } = body;

        const requestBody: Record<string, unknown> = {
            action: "update",
            sheet: process.env.NEXT_PUBLIC_TRANSACTIONS as string,
            id,
        };

        if (customer_name !== undefined) requestBody.customer_name = customer_name;
        if (discount !== undefined) requestBody.discount = Number(discount);
        if (tax !== undefined) requestBody.tax = Number(tax);
        if (total !== undefined) requestBody.total = Number(total);
        if (subtotal !== undefined) requestBody.subtotal = Number(subtotal);
        if (paid_amount !== undefined) requestBody.paid_amount = Number(paid_amount);
        if (is_credit !== undefined) requestBody.is_credit = Boolean(is_credit);
        if (branch_name !== undefined) requestBody.branch_name = branch_name;
        if (payment_method !== undefined) requestBody.payment_method = payment_method;
        if (payment_status !== undefined) requestBody.payment_status = payment_status;
        if (status !== undefined) requestBody.status = status;

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

export async function DELETE(
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
            action: "delete",
            sheet: process.env.NEXT_PUBLIC_TRANSACTIONS as string,
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
