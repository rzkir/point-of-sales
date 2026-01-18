import { NextRequest, NextResponse } from 'next/server';

// Ganti dengan Web App URL dari Google Apps Script
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

/**
 * GET /api/branches/[id] - Get branch by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Branch ID is required' },
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

    // Panggil Google Apps Script untuk get branch
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'get', id }),
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
      console.error('Failed to get branch:', data.message);
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
    console.error('Get branch error:', error);
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
 * PUT /api/branches/[id] - Update branch
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, address } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Branch ID is required' },
        { status: 400 }
      );
    }

    // Debug logging
    console.log('Update branch request received:', { id, name, address });

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
      id: string;
      name?: string;
      address?: string;
    } = {
      action: 'update',
      id,
    };

    if (name !== undefined && name !== null) {
      requestBody.name = String(name).trim();
    }
    if (address !== undefined && address !== null) {
      requestBody.address = String(address).trim();
    }

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
      console.error('Update branch failed from Apps Script:', data.message);
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
    console.error('Update branch error:', error);
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
 * DELETE /api/branches/[id] - Delete branch
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Branch ID is required' },
        { status: 400 }
      );
    }

    // Debug logging
    console.log('Delete branch request received:', { id });

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
      id,
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
      message: data.message
    });

    if (!data.success) {
      console.error('Delete branch failed from Apps Script:', data.message);
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
    console.error('Delete branch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
