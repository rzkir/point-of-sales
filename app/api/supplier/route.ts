import { NextRequest, NextResponse } from 'next/server';

// Ganti dengan Web App URL dari Google Apps Script
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

/**
 * GET /api/supplier - Get all suppliers
 */
export async function GET(request: NextRequest) {
    try {
        // Validasi APPS_SCRIPT_URL
        if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
            return NextResponse.json(
                { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
                { status: 500 }
            );
        }

        // Panggil Google Apps Script untuk list suppliers
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'list', sheet: 'Suppliers' }),
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
            console.error('Failed to get suppliers:', data.message);
            return NextResponse.json(
                { success: false, message: data.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: data.message,
            data: data.data,
        });
    } catch (error) {
        console.error('Get suppliers error:', error);
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
 * POST /api/supplier - Create a new supplier
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, contact_person, phone, email, address, is_active } = body;

        // Debug logging
        console.log('Create supplier request received:', { name, contact_person, phone, email, address, is_active });

        // Validasi
        if (!name || String(name).trim() === '') {
            return NextResponse.json(
                { success: false, message: 'Supplier name is required' },
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

        // Prepare request body for Apps Script
        const requestBody = {
            action: 'create',
            sheet: 'Suppliers',
            name: String(name).trim(),
            contact_person: contact_person ? String(contact_person).trim() : '',
            phone: phone ? String(phone).trim() : '',
            email: email ? String(email).trim() : '',
            address: address ? String(address).trim() : '',
            is_active: is_active !== undefined ? is_active : true,
        };

        console.log('Sending to Apps Script:', requestBody);

        // Panggil Google Apps Script
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
            console.error('Create supplier failed from Apps Script:', data.message);
            return NextResponse.json(
                { success: false, message: data.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: data.message,
            data: data.data,
        });
    } catch (error) {
        console.error('Create supplier error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error'
            },
            { status: 500 }
        );
    }
}