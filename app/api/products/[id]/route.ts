import { NextRequest, NextResponse } from 'next/server';

// Ganti dengan Web App URL dari Google Apps Script
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

type AppsScriptProductUpdateRequest = {
  action: 'update';
  sheet: 'Products';
  id: string;
  name?: string;
  price?: number;
  modal?: number;
  stock?: number;
  sold?: number;
  unit?: string;
  image_url?: string;
  category_id?: string;
  barcode?: string;
  is_active?: boolean;
  min_stock?: number;
  description?: string;
  supplier_id?: string;
  expiration_date?: string;
  updated_by?: string;
  branch_id?: string;
};

/**
 * GET /api/products/[id] - Get product by ID
 */
export async function GET(
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

    // Panggil Google Apps Script untuk get product
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'get', sheet: 'Products', id }),
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
      console.error('Failed to get product:', data.message);
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
    console.error('Get product error:', error);
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

    // Ambil user dari cookie session (httpOnly) supaya updated_by tidak kosong
    let sessionUser: User | null = null;
    const session = request.cookies.get("session")?.value;
    if (session) {
      try {
        sessionUser = JSON.parse(session) as User;
      } catch {
        // ignore invalid JSON
      }
    }

    const body = await request.json();
    const {
      name,
      price,
      modal,
      stock,
      sold,
      unit,
      image_url,
      category_id,
      barcode,
      is_active,
      min_stock,
      description,
      supplier_id,
      expiration_date,
      updated_by,
      branch_id,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Debug logging
    console.log('Update product request received:', { id, name, price });

    // Validasi APPS_SCRIPT_URL
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      return NextResponse.json(
        { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
        { status: 500 }
      );
    }

    // Prepare request body for Apps Script
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
    if (unit !== undefined && unit !== null) {
      requestBody.unit = String(unit).trim();
    }
    if (image_url !== undefined && image_url !== null) {
      requestBody.image_url = String(image_url).trim();
    }
    if (category_id !== undefined && category_id !== null) {
      requestBody.category_id = String(category_id).trim();
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
    if (expiration_date !== undefined && expiration_date !== null) {
      requestBody.expiration_date = String(expiration_date).trim();
    }
    {
      const resolvedUpdatedBy =
        updated_by !== undefined && updated_by !== null && String(updated_by).trim() !== ""
          ? String(updated_by).trim()
          : sessionUser?.name
            ? String(sessionUser.name).trim()
            : sessionUser?.email
              ? String(sessionUser.email).trim()
              : "";
      if (resolvedUpdatedBy) requestBody.updated_by = resolvedUpdatedBy;
    }
    if (branch_id !== undefined && branch_id !== null) {
      requestBody.branch_id = String(branch_id).trim();
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
      console.error('Update product failed from Apps Script:', data.message);
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
    console.error('Update product error:', error);
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

    // Debug logging
    console.log('Delete product request received:', { id });

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
      sheet: 'Products',
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