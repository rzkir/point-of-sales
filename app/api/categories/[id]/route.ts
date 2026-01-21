import { NextRequest, NextResponse } from "next/server"

// Ganti dengan Web App URL dari Google Apps Script
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE"

/**
 * GET /api/categories/[id] - Get category by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Category ID is required" },
                { status: 400 },
            )
        }

        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE") {
            return NextResponse.json(
                { success: false, message: "Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local" },
                { status: 500 },
            )
        }

        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "get", sheet: "Categories", id }),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text()
            console.error("Apps Script returned non-JSON response:", textResponse.substring(0, 500))
            return NextResponse.json(
                { success: false, message: "Invalid response from Apps Script. Please check your Apps Script deployment and URL." },
                { status: 500 },
            )
        }

        const data = await response.json()

        if (!data.success) {
            console.error("Failed to get category:", data.message)
            return NextResponse.json(
                { success: false, message: data.message },
                { status: data.message.includes("not found") ? 404 : 400 },
            )
        }

        return NextResponse.json({
            success: true,
            message: data.message,
            data: data.data,
        })
    } catch (error) {
        console.error("Get category error:", error)
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 },
        )
    }
}

/**
 * PUT /api/categories/[id] - Update category
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name, is_active } = body

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Category ID is required" },
                { status: 400 },
            )
        }

        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE") {
            return NextResponse.json(
                { success: false, message: "Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local" },
                { status: 500 },
            )
        }

        const requestBody: {
            action: "update"
            sheet: "Categories"
            id: string
            name?: string
            is_active?: boolean
        } = {
            action: "update",
            sheet: "Categories",
            id,
        }

        if (name !== undefined && name !== null) {
            requestBody.name = String(name).trim()
        }

        if (is_active !== undefined && is_active !== null) {
            requestBody.is_active = Boolean(is_active)
        }

        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text()
            console.error("Apps Script returned non-JSON response:", textResponse.substring(0, 500))
            return NextResponse.json(
                { success: false, message: "Invalid response from Apps Script. Please check your Apps Script deployment and URL." },
                { status: 500 },
            )
        }

        const data = await response.json()

        if (!data.success) {
            console.error("Update category failed from Apps Script:", data.message)
            return NextResponse.json(
                { success: false, message: data.message },
                { status: data.message.includes("not found") ? 404 : 400 },
            )
        }

        return NextResponse.json({
            success: true,
            message: data.message,
            data: data.data,
        })
    } catch (error) {
        console.error("Update category error:", error)
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 },
        )
    }
}

/**
 * DELETE /api/categories/[id] - Delete category
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Category ID is required" },
                { status: 400 },
            )
        }

        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE") {
            return NextResponse.json(
                { success: false, message: "Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local" },
                { status: 500 },
            )
        }

        const requestBody = {
            action: "delete",
            sheet: "Categories",
            id,
        }

        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text()
            console.error("Apps Script returned non-JSON response:", textResponse.substring(0, 500))
            return NextResponse.json(
                { success: false, message: "Invalid response from Apps Script. Please check your Apps Script deployment and URL." },
                { status: 500 },
            )
        }

        const data = await response.json()

        if (!data.success) {
            console.error("Delete category failed from Apps Script:", data.message)
            return NextResponse.json(
                { success: false, message: data.message },
                { status: data.message.includes("not found") ? 404 : 400 },
            )
        }

        return NextResponse.json({
            success: true,
            message: data.message,
        })
    } catch (error) {
        console.error("Delete category error:", error)
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 },
        )
    }
}
