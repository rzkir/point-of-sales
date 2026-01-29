import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

import { checkAuth, validateAppsScriptUrl } from "@/lib/validation"

async function callAppsScript(requestBody: Record<string, unknown>) {
    const response = await fetch(APPS_SCRIPT_URL!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_SECRET}`,
        },
        body: JSON.stringify(requestBody),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        await response.text();
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid response from Apps Script. Please check your Apps Script deployment and URL.'
            },
            { status: 500 }
        );
    }

    const data = await response.json();

    if (!data.success) {
        return NextResponse.json(
            { success: false, message: data.message },
            { status: data.message.includes('not found') ? 404 : 400 }
        );
    }

    return NextResponse.json({
        success: true,
        message: data.message,
        data: data.data,
    });
}

export async function GET(request: NextRequest) {
    try {
        const authError = checkAuth(request);
        if (authError) return authError;

        const session = request.cookies.get("session")?.value;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const userId = url.searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'User ID is required' },
                { status: 400 }
            );
        }

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        const requestBody = { action: 'get', sheet: 'Users', id: userId };
        return await callAppsScript(requestBody);
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error'
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const authError = checkAuth(request);
        if (authError) return authError;

        const body = await request.json();
        const { id, name, email, avatar } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'User ID is required' },
                { status: 400 }
            );
        }

        const urlError = validateAppsScriptUrl();
        if (urlError) return urlError;

        const requestBody: {
            action: string;
            sheet: string;
            id: string;
            name?: string;
            email?: string;
            avatar?: string;
        } = {
            action: 'update',
            sheet: 'Users',
            id,
        };

        if (name !== undefined && name !== null) {
            requestBody.name = String(name).trim();
        }
        if (email !== undefined && email !== null) {
            requestBody.email = String(email).trim();
        }
        if (avatar !== undefined && avatar !== null) {
            requestBody.avatar = String(avatar).trim();
        }

        return await callAppsScript(requestBody);
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error'
            },
            { status: 500 }
        );
    }
}
