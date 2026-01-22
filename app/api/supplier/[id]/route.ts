import { NextRequest, NextResponse } from 'next/server';

// Ganti dengan Web App URL dari Google Apps Script
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

// Secret untuk otorisasi request ke Apps Script
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

/**
 * GET /api/supplier/[id] - Get supplier by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Auth (header) untuk akses endpoint ini
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

        // Validasi APPS_SCRIPT_URL
        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
            return NextResponse.json(
                { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
                { status: 500 }
            );
        }

        // Panggil Google Apps Script untuk get supplier
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_SECRET}`,
            },
            body: JSON.stringify({ action: 'get', sheet: 'Suppliers', id }),
        });

        // Cek content type
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

/**
 * PUT /api/supplier/[id] - Update supplier
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Auth (header) untuk akses endpoint ini
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

        // Debug logging
        console.log('Update supplier request received:', { id, name, contact_person, phone, email, address, is_active });

        // Validasi APPS_SCRIPT_URL
        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
            return NextResponse.json(
                { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
                { status: 500 }
            );
        }

        // Prepare request body for Apps Script
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
            sheet: 'Suppliers',
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

        console.log('Sending to Apps Script:', requestBody);

        // Panggil Google Apps Script
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_SECRET}`,
            },
            body: JSON.stringify(requestBody),
        });

        // Cek content type
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

        console.log('Apps Script response:', {
            success: data.success,
            message: data.message,
            hasData: !!data.data
        });

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

/**
 * DELETE /api/supplier/[id] - Delete supplier
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Auth (header) untuk akses endpoint ini
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

        // Debug logging
        console.log('Delete supplier request received:', { id });

        // Validasi APPS_SCRIPT_URL
        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
            return NextResponse.json(
                { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
                { status: 500 }
            );
        }

        // Prepare request body for Apps Script
        const requestBody = {
            action: 'delete',
            sheet: 'Suppliers',
            id,
        };

        console.log('Sending to Apps Script:', requestBody);

        // Panggil Google Apps Script
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_SECRET}`,
            },
            body: JSON.stringify(requestBody),
        });

        // Cek content type
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

        console.log('Apps Script response:', {
            success: data.success,
            message: data.message
        });

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