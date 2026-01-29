import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!API_SECRET || request.headers.get("authorization") !== `Bearer ${API_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Supplier ID is required' },
                { status: 400 }
            );
        }

        if (!APPS_SCRIPT_URL) {
            return NextResponse.json(
                { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
                { status: 500 }
            );
        }

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_SECRET}`,
            },
            body: JSON.stringify({ action: 'get', sheet: process.env.NEXT_PUBLIC_SUPPLIERS, id }),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('Apps Script returned non-JSON response:', textResponse.substring(0, 500));
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
            console.error('Failed to get supplier:', data.message);
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
    } catch (error) {
        console.error('Get supplier error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error'
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
        if (!API_SECRET || request.headers.get("authorization") !== `Bearer ${API_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, contact_person, phone, email, address, is_active } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Supplier ID is required' },
                { status: 400 }
            );
        }

        if (!APPS_SCRIPT_URL) {
            return NextResponse.json(
                { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
                { status: 500 }
            );
        }

        const requestBody: {
            action: string;
            sheet: string;
            id: string;
            name?: string;
            contact_person?: string;
            phone?: string;
            email?: string;
            address?: string;
            is_active?: boolean;
        } = {
            action: 'update',
            sheet: process.env.NEXT_PUBLIC_SUPPLIERS as string,
            id,
        };

        if (name !== undefined && name !== null) {
            requestBody.name = String(name).trim();
        }
        if (contact_person !== undefined && contact_person !== null) {
            requestBody.contact_person = String(contact_person).trim();
        }
        if (phone !== undefined && phone !== null) {
            requestBody.phone = String(phone).trim();
        }
        if (email !== undefined && email !== null) {
            requestBody.email = String(email).trim();
        }
        if (address !== undefined && address !== null) {
            requestBody.address = String(address).trim();
        }
        if (is_active !== undefined && is_active !== null) {
            requestBody.is_active = is_active;
        }

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_SECRET}`,
            },
            body: JSON.stringify(requestBody),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('Apps Script returned non-JSON response:', textResponse.substring(0, 500));
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
            console.error('Update supplier failed from Apps Script:', data.message);
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
    } catch (error) {
        console.error('Update supplier error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error'
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
        if (!API_SECRET || request.headers.get("authorization") !== `Bearer ${API_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Supplier ID is required' },
                { status: 400 }
            );
        }

        if (!APPS_SCRIPT_URL) {
            return NextResponse.json(
                { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
                { status: 500 }
            );
        }

        const requestBody = {
            action: 'delete',
            sheet: process.env.NEXT_PUBLIC_SUPPLIERS,
            id,
        };

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_SECRET}`,
            },
            body: JSON.stringify(requestBody),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('Apps Script returned non-JSON response:', textResponse.substring(0, 500));
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
            console.error('Delete supplier failed from Apps Script:', data.message);
            return NextResponse.json(
                { success: false, message: data.message },
                { status: data.message.includes('not found') ? 404 : 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: data.message,
        });
    } catch (error) {
        console.error('Delete supplier error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error'
            },
            { status: 500 }
        );
    }
}