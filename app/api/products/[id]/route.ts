import { NextRequest, NextResponse } from 'next/server';

import { validateAppsScriptUrl, validateId, callAppsScript, getSessionUser, checkAuth } from "@/lib/validation"

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
      action: 'delete',
      sheet: 'Products',
      id,
    };

    return await callAppsScript(requestBody);
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