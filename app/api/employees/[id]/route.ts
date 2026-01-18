import { NextRequest, NextResponse } from 'next/server';

// Ganti dengan Web App URL dari Google Apps Script
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

/**
 * GET /api/employees/[id] - Get employee by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Employee ID is required' },
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

    // Panggil Google Apps Script untuk get user
    // Menggunakan action 'get' dengan parameter sheet untuk membedakan dari branches
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'get', sheet: 'Users', id }),
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
      console.error('Failed to get employee:', data.message);
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
    console.error('Get employee error:', error);
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
 * PUT /api/employees/[id] - Update employee
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, email, roleType } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Debug logging
    console.log('Update employee request received:', { id, name, email, roleType });

    // Validasi APPS_SCRIPT_URL
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      return NextResponse.json(
        { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
        { status: 500 }
      );
    }

    // Prepare request body for Apps Script
    // Menggunakan action 'update' dengan parameter sheet untuk membedakan dari branches
    const requestBody: {
      action: string;
      sheet: string;
      id: string;
      name?: string;
      email?: string;
      roleType?: string;
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
    if (roleType !== undefined && roleType !== null) {
      requestBody.roleType = String(roleType).trim();
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
      console.error('Update employee failed from Apps Script:', data.message);
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
    console.error('Update employee error:', error);
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
 * DELETE /api/employees/[id] - Delete employee
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Debug logging
    console.log('Delete employee request received:', { id });

    // Validasi APPS_SCRIPT_URL
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      return NextResponse.json(
        { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
        { status: 500 }
      );
    }

    // Prepare request body for Apps Script
    // Menggunakan action 'delete' dengan parameter sheet untuk membedakan dari branches
    const requestBody = {
      action: 'delete',
      sheet: 'Users',
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
      console.error('Delete employee failed from Apps Script:', data.message);
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
    console.error('Delete employee error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
