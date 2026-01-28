import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

type User = {
  name?: string;
  email?: string;
};

type AppsScriptProductUpdateRequest = {
  action: 'update';
  sheet: 'Products';
  id: string;
  name?: string;
  price?: number;
  modal?: number;
  stock?: number;
  sold?: number;
  size?: number;
  unit?: string;
  image_url?: string;
  category_id?: string;
  category_name?: string;
  barcode?: string;
  is_active?: boolean;
  min_stock?: number;
  description?: string;
  supplier_id?: string;
  supplier_name?: string;
  expiration_date?: string;
  updated_by?: string;
  branch_id?: string;
  branch_name?: string;
};

// Helper: Validate Apps Script URL
function validateAppsScriptUrl(): NextResponse | null {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
    return NextResponse.json(
      { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
      { status: 500 }
    );
  }
  return null;
}

// Helper: Validate ID
function validateId(id: string | undefined): NextResponse | null {
  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Product ID is required' },
      { status: 400 }
    );
  }
  return null;
}

// Helper: Get session user from cookie
function getSessionUser(request: NextRequest): User | null {
  const session = request.cookies.get("session")?.value;
  if (session) {
    try {
      return JSON.parse(session) as User;
    } catch {
      return null;
    }
  }
  return null;
}

// Helper: Call Apps Script API and handle response
async function callAppsScript(requestBody: Record<string, unknown>) {
  const response = await fetch(APPS_SCRIPT_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_SECRET && { Authorization: `Bearer ${API_SECRET}` }),
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

/**
 * GET /api/products/[id] - Get product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idError = validateId(id);
    if (idError) return idError;

    const urlError = validateAppsScriptUrl();
    if (urlError) return urlError;

    const requestBody = { action: 'get', sheet: 'Products', id };
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

/**
 * PUT /api/products/[id] - Update product
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idError = validateId(id);
    if (idError) return idError;

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
      updated_by,
      branch_id,
      branch_name,
    } = body;

    const urlError = validateAppsScriptUrl();
    if (urlError) return urlError;

    const requestBody: AppsScriptProductUpdateRequest = {
      action: 'update',
      sheet: 'Products',
      id,
    };

    if (name !== undefined && name !== null) {
      requestBody.name = String(name).trim();
    }
    if (price !== undefined && price !== null) {
      requestBody.price = Number(price);
    }
    if (modal !== undefined && modal !== null) {
      requestBody.modal = Number(modal);
    }
    if (stock !== undefined && stock !== null) {
      requestBody.stock = Number(stock);
    }
    if (sold !== undefined && sold !== null) {
      requestBody.sold = Number(sold);
    }
    if (size !== undefined && size !== null) {
      requestBody.size = Number(size);
    }
    if (unit !== undefined && unit !== null) {
      requestBody.unit = String(unit).trim();
    }
    if (image_url !== undefined && image_url !== null) {
      requestBody.image_url = String(image_url).trim();
    }
    if (category_id !== undefined && category_id !== null) {
      requestBody.category_id = String(category_id).trim();
    }
    if (category_name !== undefined && category_name !== null) {
      requestBody.category_name = String(category_name).trim();
    }
    if (barcode !== undefined && barcode !== null) {
      requestBody.barcode = String(barcode).trim();
    }
    if (is_active !== undefined && is_active !== null) {
      requestBody.is_active = typeof is_active === 'boolean' ? is_active : String(is_active) !== 'false';
    }
    if (min_stock !== undefined && min_stock !== null) {
      requestBody.min_stock = Number(min_stock);
    }
    if (description !== undefined && description !== null) {
      requestBody.description = String(description).trim();
    }
    if (supplier_id !== undefined && supplier_id !== null) {
      requestBody.supplier_id = String(supplier_id).trim();
    }
    if (supplier_name !== undefined && supplier_name !== null) {
      requestBody.supplier_name = String(supplier_name).trim();
    }
    if (expiration_date !== undefined && expiration_date !== null) {
      requestBody.expiration_date = String(expiration_date).trim();
    }
    const resolvedUpdatedBy =
      updated_by !== undefined && updated_by !== null && String(updated_by).trim() !== ""
        ? String(updated_by).trim()
        : sessionUser?.name
          ? String(sessionUser.name).trim()
          : sessionUser?.email
            ? String(sessionUser.email).trim()
            : "";
    if (resolvedUpdatedBy) requestBody.updated_by = resolvedUpdatedBy;
    if (branch_id !== undefined && branch_id !== null) {
      requestBody.branch_id = String(branch_id).trim();
    }
    if (branch_name !== undefined && branch_name !== null) {
      requestBody.branch_name = String(branch_name).trim();
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

/**
 * DELETE /api/products/[id] - Delete product
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
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

    const requestBody = {
      action: 'delete',
      sheet: 'Products',
      id,
    };

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
      console.error('Delete product failed from Apps Script:', data.message);
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
    console.error('Delete product error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}