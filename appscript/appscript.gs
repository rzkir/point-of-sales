const SHEET_NAME = 'Users';
const BRANCHES_SHEET_NAME = 'Branches';
const PRODUCTS_SHEET_NAME = 'Products';
const CATEGORIES_SHEET_NAME = 'Categories';
const SUPPLIERS_SHEET_NAME = 'Suppliers';
const TRANSACTIONS_SHEET_NAME = 'Transactions';

// SPREADSHEET_ID bisa di-set di bagian atas file ini jika ingin menggunakan spreadsheet tertentu
// Jika tidak di-set (undefined), akan menggunakan spreadsheet aktif
// Contoh: const SPREADSHEET_ID = 'AKfycbymvPk5B2pvPzgBZQnHTWAheheD-YshTpDzsRHwqKqrBhDvBL3f_fOJiLWJPg-JpFn_0Q';

/**
 * Mendapatkan spreadsheet
 */
function getSpreadsheet() {
  // Jika SPREADSHEET_ID tidak didefinisikan atau null atau kosong, gunakan spreadsheet aktif
  if (typeof SPREADSHEET_ID === 'undefined' || !SPREADSHEET_ID) {
    try {
      return SpreadsheetApp.getActiveSpreadsheet();
    } catch (error) {
      throw new Error('Tidak dapat mengakses spreadsheet aktif. Pastikan Apps Script dibuat dari Extensions > Apps Script di spreadsheet, atau set SPREADSHEET_ID dengan benar.');
    }
  }
  
  // Jika SPREADSHEET_ID di-set, gunakan openById
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (error) {
    throw new Error('Spreadsheet tidak ditemukan atau tidak dapat diakses. Pastikan Spreadsheet ID benar dan Anda memiliki akses ke spreadsheet tersebut. Error: ' + error.toString());
  }
}

/**
 * Mendapatkan sheet Users
 */
function getUsersSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // Jika sheet belum ada, buat sheet baru
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Set header
    sheet.getRange(1, 1, 1, 8).setValues([[
      'id', 'email', 'name', 'password', 'roleType', 'branchName', 'createdAt', 'updatedAt'
    ]]);
    // Format header
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    sheet.getRange(1, 1, 1, 8).setBackground('#4285f4');
    sheet.getRange(1, 1, 1, 8).setFontColor('#ffffff');
  }
  
  return sheet;
}

/**
 * Generate unique ID
 */
function generateId() {
  return Utilities.getUuid();
}

/**
 * Hash password sederhana (untuk production, gunakan library yang lebih aman)
 */
function hashPassword(password) {
  const rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  return rawHash.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/**
 * Verifikasi password
 */
function verifyPassword(password, hashedPassword) {
  const hashedInput = hashPassword(password);
  return hashedInput === hashedPassword;
}

/**
 * Cari user berdasarkan email
 */
function findUserByEmail(email) {
  const sheet = getUsersSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email) { // email di kolom 1 (index 1)
      return {
        id: data[i][0],
        email: data[i][1],
        name: data[i][2],
        password: data[i][3],
        roleType: data[i][4],
        branchName: data[i][5],
        createdAt: data[i][6],
        updatedAt: data[i][7]
      };
    }
  }
  return null;
}

/**
 * Cari user berdasarkan name
 */
function findUserByName(name) {
  const sheet = getUsersSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === name) { // name di kolom 2 (index 2)
      return {
        id: data[i][0],
        email: data[i][1],
        name: data[i][2],
        password: data[i][3],
        roleType: data[i][4],
        branchName: data[i][5],
        createdAt: data[i][6],
        updatedAt: data[i][7]
      };
    }
  }
  return null;
}

/**
 * Cari user berdasarkan ID
 */
function findUserById(id) {
  const sheet = getUsersSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) { // id di kolom 0 (index 0)
      return {
        id: data[i][0],
        email: data[i][1],
        name: data[i][2],
        password: data[i][3],
        roleType: data[i][4],
        branchName: data[i][5],
        createdAt: data[i][6],
        updatedAt: data[i][7]
      };
    }
  }
  return null;
}

/**
 * Handler untuk doPost - menerima request dari Next.js
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const sheet = requestData.sheet; // Baca parameter sheet untuk menentukan Users, Products, atau Branches
    
    let response;
    
    switch(action) {
      // Authentication actions (tidak perlu parameter sheet)
      case 'register':
        response = handleRegister(requestData);
        break;
      case 'login':
        response = handleLogin(requestData);
        break;
      // CRUD actions - cek parameter sheet untuk menentukan Users, Products, Branches, atau Suppliers
      case 'create':
        if (sheet === 'Users') {
          response = handleCreateUser(requestData);
        } else if (sheet === 'Products') {
          response = handleCreateProduct(requestData);
        } else if (sheet === 'Categories') {
          response = handleCreateCategory(requestData);
        } else if (sheet === 'Suppliers') {
          response = handleCreateSupplier(requestData);
        } else if (sheet === 'Transactions') {
          response = handleCreateTransaction(requestData);
        } else {
          // Default ke Branches untuk backward compatibility
          response = handleCreateBranch(requestData);
        }
        break;
      case 'list':
        if (sheet === 'Users') {
          response = handleListUsers(requestData);
        } else if (sheet === 'Products') {
          response = handleListProducts(requestData);
        } else if (sheet === 'Categories') {
          response = handleListCategories(requestData);
        } else if (sheet === 'Suppliers') {
          response = handleListSuppliers(requestData);
        } else if (sheet === 'Transactions') {
          response = handleListTransactions(requestData);
        } else {
          // Default ke Branches untuk backward compatibility
          response = handleListBranches(requestData);
        }
        break;
      case 'get':
        if (sheet === 'Users') {
          response = handleGetUser(requestData);
        } else if (sheet === 'Products') {
          response = handleGetProduct(requestData);
        } else if (sheet === 'Categories') {
          response = handleGetCategory(requestData);
        } else if (sheet === 'Suppliers') {
          response = handleGetSupplier(requestData);
        } else if (sheet === 'Transactions') {
          response = handleGetTransaction(requestData);
        } else {
          // Default ke Branches untuk backward compatibility
          response = handleGetBranch(requestData);
        }
        break;
      case 'update':
        if (sheet === 'Users') {
          response = handleUpdateUser(requestData);
        } else if (sheet === 'Products') {
          response = handleUpdateProduct(requestData);
        } else if (sheet === 'Categories') {
          response = handleUpdateCategory(requestData);
        } else if (sheet === 'Suppliers') {
          response = handleUpdateSupplier(requestData);
        } else {
          // Default ke Branches untuk backward compatibility
          response = handleUpdateBranch(requestData);
        }
        break;
      case 'delete':
        if (sheet === 'Users') {
          response = handleDeleteUser(requestData);
        } else if (sheet === 'Products') {
          response = handleDeleteProduct(requestData);
        } else if (sheet === 'Categories') {
          response = handleDeleteCategory(requestData);
        } else if (sheet === 'Suppliers') {
          response = handleDeleteSupplier(requestData);
        } else if (sheet === 'Transactions') {
          response = handleDeleteTransaction(requestData);
        } else {
          // Default ke Branches untuk backward compatibility
          response = handleDeleteBranch(requestData);
        }
        break;
      default:
        response = {
          success: false,
          message: 'Invalid action. Supported actions: register, login, create, list, get, update, delete'
        };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handler untuk doGet - untuk testing
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Google Apps Script API is running',
      features: ['Authentication', 'Branches Management'],
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle register
 */
function handleRegister(data) {
  const { email, name, password, roleType = 'karyawan', branchName = '' } = data;
  
  // Validasi
  if (!email || !name || !password) {
    return {
      success: false,
      message: 'Email, name, and password are required'
    };
  }
  
  // Validasi email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: 'Invalid email format'
    };
  }
  
  // Validasi password length
  if (password.length < 8) {
    return {
      success: false,
      message: 'Password must be at least 8 characters'
    };
  }
  
  // Cek apakah email sudah terdaftar
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return {
      success: false,
      message: 'Email already registered'
    };
  }
  
  // Hash password
  const hashedPassword = hashPassword(password);
  
  // Generate ID dan timestamp
  const id = generateId();
  const now = new Date().toISOString();
  
  // Simpan ke sheet
  const sheet = getUsersSheet();
  sheet.appendRow([
    id,
    email,
    name,
    hashedPassword,
    roleType,
    branchName,
    now,
    now
  ]);
  
  return {
    success: true,
    message: 'Registration successful',
    data: {
      id: id,
      email: email,
      name: name,
      roleType: roleType,
      branchName: branchName
    }
  };
}

/**
 * Handle login
 * 
 * PENTING - Login dengan EMAIL atau NAME:
 * Jika Anda dapat error "Email and password are required" saat login pakai name,
 * artinya deployment Apps Script masih memakai kode lama. Ganti handleLogin
 * di Apps Script dengan versi ini, lalu Deploy > Manage deployments > Edit > Deploy.
 */
function handleLogin(data) {
  const { email, name, password } = data || {};
  
  // Validasi: butuh (email ATAU name) DAN password
  // Trim supaya string kosong/whitespace dianggap tidak ada
  const hasEmail = email && String(email).trim() !== '';
  const hasName = name && String(name).trim() !== '';
  const hasPassword = password && String(password).trim() !== '';
  
  if ((!hasEmail && !hasName) || !hasPassword) {
    return {
      success: false,
      message: 'Email or name, and password are required'
    };
  }
  
  // Cari user: jika "email" tidak mengandung @, artinya Next.js mengirim name di field email
  // (workaround script lama). Gunakan findUserByName untuk kolom name di sheet.
  var user = null;
  var emailStr = hasEmail ? String(email).trim() : '';
  var nameStr = hasName ? String(name).trim() : '';
  var isEmailFormat = emailStr.indexOf('@') !== -1;
  
  if (hasEmail && isEmailFormat) {
    user = findUserByEmail(emailStr);
  } else if (hasName) {
    user = findUserByName(nameStr);
  } else if (hasEmail) {
    user = findUserByName(emailStr);
  }
  
  if (!user) {
    return {
      success: false,
      message: 'Invalid email/name or password'
    };
  }
  
  // Verifikasi password
  if (!verifyPassword(password, user.password)) {
    return {
      success: false,
      message: 'Invalid email/name or password'
    };
  }
  
  // Update updatedAt di sheet
  var now = new Date().toISOString();
  var sheet = getUsersSheet();
  var dataRange = sheet.getDataRange().getValues();
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][1] === user.email) {
      sheet.getRange(i + 1, 8).setValue(now);
      break;
    }
  }
  
  // Return user data (tanpa password)
  return {
    success: true,
    message: 'Login successful',
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      roleType: user.roleType,
      branchName: user.branchName,
      createdAt: user.createdAt,
      updatedAt: now
    }
  };
}

// ============================================
// USERS/EMPLOYEES MANAGEMENT FUNCTIONS
// ============================================

/**
 * Handle create user/employee
 */
function handleCreateUser(data) {
  const { name, email, password = '', roleType = 'karyawan', branchName = '' } = data;
  
  // Validasi
  if (!name || String(name).trim() === '') {
    return {
      success: false,
      message: 'Employee name is required'
    };
  }
  
  if (!email || String(email).trim() === '') {
    return {
      success: false,
      message: 'Email is required'
    };
  }
  
  // Validasi email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).trim())) {
    return {
      success: false,
      message: 'Invalid email format'
    };
  }
  
  // Cek apakah email sudah terdaftar
  const existingUser = findUserByEmail(String(email).trim());
  if (existingUser) {
    return {
      success: false,
      message: 'Email already registered'
    };
  }
  
  // Hash password jika ada
  const hashedPassword = password ? hashPassword(String(password).trim()) : '';
  
  // Generate ID dan timestamp
  const id = generateId();
  const now = new Date().toISOString();
  
  // Simpan ke sheet Users
  const sheet = getUsersSheet();
  sheet.appendRow([
    id,
    String(email).trim(),
    String(name).trim(),
    hashedPassword,
    String(roleType).trim(),
    String(branchName).trim(),
    now,
    now
  ]);
  
  return {
    success: true,
    message: 'Employee created successfully',
    data: {
      id: id,
      email: String(email).trim(),
      name: String(name).trim(),
      roleType: String(roleType).trim(),
      branchName: String(branchName).trim(),
      createdAt: now,
      updatedAt: now
    }
  };
}

/**
 * Handle list users/employees
 */
function handleListUsers(data) {
  const sheet = getUsersSheet();
  const dataRange = sheet.getDataRange().getValues();
  
  // Skip header
  const users = [];
  for (let i = 1; i < dataRange.length; i++) {
    users.push({
      id: dataRange[i][0],
      email: dataRange[i][1],
      name: dataRange[i][2],
      roleType: dataRange[i][4],
      branchName: dataRange[i][5],
      createdAt: dataRange[i][6],
      updatedAt: dataRange[i][7]
    });
  }
  
  return {
    success: true,
    message: 'Users retrieved successfully',
    data: users
  };
}

/**
 * Handle get user/employee by ID
 */
function handleGetUser(data) {
  const { id } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'User ID is required'
    };
  }
  
  const user = findUserById(id);
  
  if (!user) {
    return {
      success: false,
      message: 'User not found'
    };
  }
  
  // Return tanpa password
  return {
    success: true,
    message: 'User retrieved successfully',
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      roleType: user.roleType,
      branchName: user.branchName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  };
}

/**
 * Handle update user/employee
 */
function handleUpdateUser(data) {
  const { id, name, email, roleType, branchName } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'User ID is required'
    };
  }
  
  const user = findUserById(id);
  
  if (!user) {
    return {
      success: false,
      message: 'User not found'
    };
  }
  
  // Validasi email jika diubah
  if (email !== undefined && email !== null) {
    const emailStr = String(email).trim();
    if (emailStr === '') {
      return {
        success: false,
        message: 'Email cannot be empty'
      };
    }
    
    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      return {
        success: false,
        message: 'Invalid email format'
      };
    }
    
    // Cek apakah email sudah digunakan oleh user lain
    const existingUser = findUserByEmail(emailStr);
    if (existingUser && existingUser.id !== id) {
      return {
        success: false,
        message: 'Email already exists'
      };
    }
  }
  
  // Validasi name jika diubah
  if (name !== undefined && name !== null) {
    const nameStr = String(name).trim();
    if (nameStr === '') {
      return {
        success: false,
        message: 'Name cannot be empty'
      };
    }
  }
  
  // Update data
  const sheet = getUsersSheet();
  const dataRange = sheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === id) {
      const row = i + 1; // +1 karena index sheet dimulai dari 1
      const now = new Date().toISOString();
      
      // Update hanya field yang diubah
      if (name !== undefined && name !== null) {
        sheet.getRange(row, 3).setValue(String(name).trim());
      }
      if (email !== undefined && email !== null) {
        sheet.getRange(row, 2).setValue(String(email).trim());
      }
      if (roleType !== undefined && roleType !== null) {
        sheet.getRange(row, 5).setValue(String(roleType).trim());
      }
      if (branchName !== undefined && branchName !== null) {
        sheet.getRange(row, 6).setValue(String(branchName).trim());
      }
      
      // Update updatedAt
      sheet.getRange(row, 8).setValue(now);
      
      // Ambil data terbaru
      const updatedUser = findUserById(id);
      
      // Return tanpa password
      return {
        success: true,
        message: 'User updated successfully',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          roleType: updatedUser.roleType,
          branchName: updatedUser.branchName,
          createdAt: updatedUser.createdAt,
          updatedAt: now
        }
      };
    }
  }
  
  return {
    success: false,
    message: 'User not found'
  };
}

/**
 * Handle delete user/employee
 */
function handleDeleteUser(data) {
  const { id } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'User ID is required'
    };
  }
  
  const user = findUserById(id);
  
  if (!user) {
    return {
      success: false,
      message: 'User not found'
    };
  }
  
  // Hapus dari sheet
  const sheet = getUsersSheet();
  const dataRange = sheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === id) {
      sheet.deleteRow(i + 1); // +1 karena index sheet dimulai dari 1
      
      return {
        success: true,
        message: 'User deleted successfully'
      };
    }
  }
  
  return {
    success: false,
    message: 'User not found'
  };
}

// ============================================
// PRODUCTS MANAGEMENT FUNCTIONS
// ============================================

/**
 * Schema kolom Products (canonical).
 * Kalau kamu tambah/hapus field, cukup edit list ini — sheet akan auto update.
 */
const PRODUCTS_COLUMNS = [
  'id',
  'uid',
  'name',
  'price',
  'modal',
  'stock',
  'sold',
  'unit',
  'size',
  'image_url',
  'category_id',
  'category_name',
  'barcode',
  'is_active',
  'min_stock',
  'description',
  'supplier_id',
  'supplier_name',
  'expiration_date',
  'created_by',
  'updated_by',
  'created_at',
  'updated_at',
  'branch_id',
  'branch_name'
];

/**
 * Pastikan header sheet sesuai schema:
 * - kalau header kosong / sheet baru: set semua header
 * - kalau ada kolom baru di schema: otomatis ditambahkan di paling kanan
 * Return: map namaKolom -> index (0-based)
 */
function ensureSheetColumns_(sheet, columns) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const headerValues = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const header = headerValues.map(v => String(v || '').trim());

  const hasAnyHeader = header.some(h => h);

  // Jika belum ada header sama sekali, set langsung sesuai schema.
  if (!hasAnyHeader) {
    sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
    sheet.getRange(1, 1, 1, columns.length).setFontWeight('bold');
    sheet.getRange(1, 1, 1, columns.length).setBackground('#4285f4');
    sheet.getRange(1, 1, 1, columns.length).setFontColor('#ffffff');
    return columns.reduce((acc, col, idx) => { acc[col] = idx; return acc; }, {});
  }

  // Kalau ada kolom schema yang belum ada di sheet, tambahkan di kanan.
  const existingSet = {};
  header.forEach(h => { if (h) existingSet[h] = true; });
  const missing = columns.filter(col => !existingSet[col]);
  if (missing.length) {
    const startCol = sheet.getLastColumn() + 1;
    sheet.insertColumnsAfter(sheet.getLastColumn(), missing.length);
    sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
    // format header untuk kolom baru
    sheet.getRange(1, startCol, 1, missing.length).setFontWeight('bold');
    sheet.getRange(1, startCol, 1, missing.length).setBackground('#4285f4');
    sheet.getRange(1, startCol, 1, missing.length).setFontColor('#ffffff');
  }

  // Build map terbaru berdasarkan header row sekarang
  const finalHeader = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(v => String(v || '').trim());
  const map = {};
  finalHeader.forEach((h, idx) => { if (h) map[h] = idx; });
  return map;
}

function getProductsColumnMap_() {
  const sheet = getProductsSheet();
  return ensureSheetColumns_(sheet, PRODUCTS_COLUMNS);
}

/**
 * Mendapatkan sheet Products
 */
function getProductsSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(PRODUCTS_SHEET_NAME);
  
  // Jika sheet belum ada, buat sheet baru
  if (!sheet) {
    sheet = ss.insertSheet(PRODUCTS_SHEET_NAME);
    // Header akan di-set otomatis oleh ensureSheetColumns_()
  }

  // Pastikan header selalu up-to-date walaupun schema berubah
  ensureSheetColumns_(sheet, PRODUCTS_COLUMNS);
  
  return sheet;
}

/**
 * Cari produk berdasarkan ID
 */
function findProductById(id) {
  const sheet = getProductsSheet();
  const col = getProductsColumnMap_();
  const data = sheet.getDataRange().getValues();
  
  // Skip header
  for (let i = 1; i < data.length; i++) {
    if (data[i][col.id] === id) {
      const row = data[i];
      const product = {};
      PRODUCTS_COLUMNS.forEach((key) => {
        product[key] = row[col[key]];
      });
      return product;
    }
  }
  return null;
}

/**
 * Handle create product
 */
function handleCreateProduct(data) {
  const {
    name,
    price,
    modal,
    stock,
    sold,
    unit,
    size,
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
    created_by,
    branch_id,
    branch_name
  } = data;
  
  // Validasi
  if (!name || String(name).trim() === '') {
    return {
      success: false,
      message: 'Product name is required'
    };
  }
  
  // Generate ID, UID, dan timestamp
  const id = generateId();
  const uid = generateId();
  const now = new Date().toISOString();
  
  // Simpan ke sheet
  const sheet = getProductsSheet();
  const col = getProductsColumnMap_();
  const row = new Array(sheet.getLastColumn()).fill('');
  row[col.id] = id;
  row[col.uid] = uid;
  row[col.name] = String(name).trim();
  row[col.price] = price || 0;
  row[col.modal] = modal || 0;
  row[col.stock] = stock || 0;
  row[col.sold] = sold || 0;
  row[col.unit] = unit || '';
  row[col.size] = size || '';
  row[col.image_url] = image_url || '';
  row[col.category_id] = category_id || '';
  row[col.category_name] = category_name || '';
  row[col.barcode] = barcode || '';
  row[col.is_active] = (is_active === false ? false : true);
  row[col.min_stock] = min_stock || '';
  row[col.description] = description || '';
  row[col.supplier_id] = supplier_id || '';
  row[col.supplier_name] = supplier_name || '';
  row[col.expiration_date] = expiration_date || '';
  row[col.created_by] = created_by || '';
  row[col.updated_by] = '';
  row[col.created_at] = now;
  row[col.updated_at] = now;
  row[col.branch_id] = branch_id || '';
  row[col.branch_name] = branch_name || '';
  sheet.appendRow(row);
  
  return {
    success: true,
    message: 'Product created successfully',
    data: findProductById(id)
  };
}

/**
 * Handle list products
 */
function handleListProducts(data) {
  const sheet = getProductsSheet();
  const col = getProductsColumnMap_();
  const dataRange = sheet.getDataRange().getValues();
  
  const products = [];
  for (let i = 1; i < dataRange.length; i++) {
    const row = dataRange[i];
    const product = {};
    PRODUCTS_COLUMNS.forEach((key) => {
      product[key] = row[col[key]];
    });
    products.push(product);
  }
  
  return {
    success: true,
    message: 'Products retrieved successfully',
    data: products
  };
}

/**
 * Handle get product by ID
 */
function handleGetProduct(data) {
  const { id } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'Product ID is required'
    };
  }
  
  const product = findProductById(id);
  
  if (!product) {
    return {
      success: false,
      message: 'Product not found'
    };
  }
  
  return {
    success: true,
    message: 'Product retrieved successfully',
    data: product
  };
}

/**
 * Handle update product
 */
function handleUpdateProduct(data) {
  const {
    id,
    name,
    price,
    modal,
    stock,
    sold,
    unit,
    size,
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
    branch_name
  } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'Product ID is required'
    };
  }
  
  const existing = findProductById(id);
  if (!existing) {
    return {
      success: false,
      message: 'Product not found'
    };
  }
  
  const sheet = getProductsSheet();
  const col = getProductsColumnMap_();
  const dataRange = sheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][col.id] === id) {
      const row = i + 1; // +1 karena index sheet dimulai dari 1
      const now = new Date().toISOString();
      
      if (name !== undefined && name !== null) sheet.getRange(row, col.name + 1).setValue(name);
      if (price !== undefined && price !== null) sheet.getRange(row, col.price + 1).setValue(price);
      if (modal !== undefined && modal !== null) sheet.getRange(row, col.modal + 1).setValue(modal);
      if (stock !== undefined && stock !== null) sheet.getRange(row, col.stock + 1).setValue(stock);
      if (sold !== undefined && sold !== null) sheet.getRange(row, col.sold + 1).setValue(sold);
      if (unit !== undefined && unit !== null) sheet.getRange(row, col.unit + 1).setValue(unit);
      if (size !== undefined && size !== null) sheet.getRange(row, col.size + 1).setValue(size);
      if (image_url !== undefined && image_url !== null) sheet.getRange(row, col.image_url + 1).setValue(image_url);
      if (category_id !== undefined && category_id !== null) sheet.getRange(row, col.category_id + 1).setValue(category_id);
      if (category_name !== undefined && category_name !== null) sheet.getRange(row, col.category_name + 1).setValue(category_name);
      if (barcode !== undefined && barcode !== null) sheet.getRange(row, col.barcode + 1).setValue(barcode);
      if (is_active !== undefined && is_active !== null) sheet.getRange(row, col.is_active + 1).setValue(is_active);
      if (min_stock !== undefined && min_stock !== null) sheet.getRange(row, col.min_stock + 1).setValue(min_stock);
      if (description !== undefined && description !== null) sheet.getRange(row, col.description + 1).setValue(description);
      if (supplier_id !== undefined && supplier_id !== null) sheet.getRange(row, col.supplier_id + 1).setValue(supplier_id);
      if (supplier_name !== undefined && supplier_name !== null) sheet.getRange(row, col.supplier_name + 1).setValue(supplier_name);
      if (expiration_date !== undefined && expiration_date !== null) sheet.getRange(row, col.expiration_date + 1).setValue(expiration_date);
      
      if (updated_by !== undefined && updated_by !== null) {
        sheet.getRange(row, col.updated_by + 1).setValue(updated_by);
      }
      if (branch_id !== undefined && branch_id !== null) {
        sheet.getRange(row, col.branch_id + 1).setValue(branch_id);
      }
      if (branch_name !== undefined && branch_name !== null) {
        sheet.getRange(row, col.branch_name + 1).setValue(branch_name);
      }
      sheet.getRange(row, col.updated_at + 1).setValue(now); // updated_at
      
      return {
        success: true,
        message: 'Product updated successfully',
        data: findProductById(id)
      };
    }
  }
  
  return {
    success: false,
    message: 'Product not found'
  };
}

/**
 * Handle delete product
 */
function handleDeleteProduct(data) {
  const { id } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'Product ID is required'
    };
  }
  
  const sheet = getProductsSheet();
  const col = getProductsColumnMap_();
  const dataRange = sheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][col.id] === id) {
      sheet.deleteRow(i + 1); // +1 karena index sheet dimulai dari 1
      
      return {
        success: true,
        message: 'Product deleted successfully'
      };
    }
  }
  
  return {
    success: false,
    message: 'Product not found'
  };
}

// ============================================
// CATEGORIES MANAGEMENT FUNCTIONS
// ============================================

const CATEGORIES_COLUMNS = [
  'id',
  'uid',
  'name',
  'is_active',
  'created_at',
  'updated_at'
];

function getCategoriesColumnMap_() {
  const sheet = getCategoriesSheet();
  return ensureSheetColumns_(sheet, CATEGORIES_COLUMNS);
}

function getCategoriesSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(CATEGORIES_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CATEGORIES_SHEET_NAME);
  }

  ensureSheetColumns_(sheet, CATEGORIES_COLUMNS);
  return sheet;
}

function findCategoryById(id) {
  const sheet = getCategoriesSheet();
  const col = getCategoriesColumnMap_();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][col.id] === id) {
      const row = data[i];
      const category = {};
      CATEGORIES_COLUMNS.forEach((key) => {
        category[key] = row[col[key]];
      });
      return category;
    }
  }
  return null;
}

function handleCreateCategory(data) {
  const { name, is_active } = data;

  if (!name || String(name).trim() === '') {
    return {
      success: false,
      message: 'Category name is required'
    };
  }

  const id = generateId();
  const uid = generateId();
  const now = new Date().toISOString();

  const sheet = getCategoriesSheet();
  const col = getCategoriesColumnMap_();
  const row = new Array(sheet.getLastColumn()).fill('');
  row[col.id] = id;
  row[col.uid] = uid;
  row[col.name] = String(name).trim();
  row[col.is_active] = (is_active === false ? false : true);
  row[col.created_at] = now;
  row[col.updated_at] = now;
  sheet.appendRow(row);

  return {
    success: true,
    message: 'Category created successfully',
    data: findCategoryById(id)
  };
}

function handleListCategories(data) {
  const sheet = getCategoriesSheet();
  const col = getCategoriesColumnMap_();
  const dataRange = sheet.getDataRange().getValues();

  const categories = [];
  for (let i = 1; i < dataRange.length; i++) {
    const row = dataRange[i];
    const category = {};
    CATEGORIES_COLUMNS.forEach((key) => {
      category[key] = row[col[key]];
    });
    categories.push(category);
  }

  return {
    success: true,
    message: 'Categories retrieved successfully',
    data: categories
  };
}

function handleGetCategory(data) {
  const { id } = data;

  if (!id) {
    return {
      success: false,
      message: 'Category ID is required'
    };
  }

  const category = findCategoryById(id);

  if (!category) {
    return {
      success: false,
      message: 'Category not found'
    };
  }

  return {
    success: true,
    message: 'Category retrieved successfully',
    data: category
  };
}

function handleUpdateCategory(data) {
  const { id, name, is_active } = data;

  if (!id) {
    return {
      success: false,
      message: 'Category ID is required'
    };
  }

  if (name !== undefined && name !== null) {
    const trimmed = String(name).trim();
    if (trimmed === '') {
      return {
        success: false,
        message: 'Category name cannot be empty'
      };
    }
  }

  const existing = findCategoryById(id);
  if (!existing) {
    return {
      success: false,
      message: 'Category not found'
    };
  }

  const sheet = getCategoriesSheet();
  const col = getCategoriesColumnMap_();
  const dataRange = sheet.getDataRange().getValues();

  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][col.id] === id) {
      const row = i + 1;
      const now = new Date().toISOString();

      if (name !== undefined && name !== null) {
        sheet.getRange(row, col.name + 1).setValue(String(name).trim());
      }
      if (is_active !== undefined && is_active !== null) {
        sheet.getRange(row, col.is_active + 1).setValue(is_active ? true : false);
      }

      sheet.getRange(row, col.updated_at + 1).setValue(now);

      return {
        success: true,
        message: 'Category updated successfully',
        data: findCategoryById(id)
      };
    }
  }

  return {
    success: false,
    message: 'Category not found'
  };
}

function handleDeleteCategory(data) {
  const { id } = data;

  if (!id) {
    return {
      success: false,
      message: 'Category ID is required'
    };
  }

  const sheet = getCategoriesSheet();
  const col = getCategoriesColumnMap_();
  const dataRange = sheet.getDataRange().getValues();

  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][col.id] === id) {
      sheet.deleteRow(i + 1);

      return {
        success: true,
        message: 'Category deleted successfully'
      };
    }
  }

  return {
    success: false,
    message: 'Category not found'
  };
}

// ============================================
// BRANCHES MANAGEMENT FUNCTIONS
// ============================================

/**
 * Mendapatkan sheet Branches
 */
function getBranchesSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(BRANCHES_SHEET_NAME);
  
  // Jika sheet belum ada, buat sheet baru
  if (!sheet) {
    sheet = ss.insertSheet(BRANCHES_SHEET_NAME);
    // Set header
    sheet.getRange(1, 1, 1, 5).setValues([[
      'id', 'name', 'address', 'createdAt', 'updatedAt'
    ]]);
    // Format header
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    sheet.getRange(1, 1, 1, 5).setBackground('#4285f4');
    sheet.getRange(1, 1, 1, 5).setFontColor('#ffffff');
  }
  
  return sheet;
}

/**
 * Cari branch berdasarkan ID
 */
function findBranchById(id) {
  const sheet = getBranchesSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) { // id di kolom 0 (index 0)
      return {
        id: data[i][0],
        name: data[i][1],
        address: data[i][2],
        createdAt: data[i][3],
        updatedAt: data[i][4]
      };
    }
  }
  return null;
}

/**
 * Cari branch berdasarkan name
 */
function findBranchByName(name) {
  const sheet = getBranchesSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === name) { // name di kolom 1 (index 1)
      return {
        id: data[i][0],
        name: data[i][1],
        address: data[i][2],
        createdAt: data[i][3],
        updatedAt: data[i][4]
      };
    }
  }
  return null;
}

/**
 * Handle create branch
 */
function handleCreateBranch(data) {
  const { name, address = '' } = data;
  
  // Validasi
  if (!name || String(name).trim() === '') {
    return {
      success: false,
      message: 'Branch name is required'
    };
  }
  
  // Cek apakah name sudah ada
  const existingBranch = findBranchByName(String(name).trim());
  if (existingBranch) {
    return {
      success: false,
      message: 'Branch name already exists'
    };
  }
  
  // Generate ID dan timestamp
  const id = generateId();
  const now = new Date().toISOString();
  
  // Simpan ke sheet
  const sheet = getBranchesSheet();
  sheet.appendRow([
    id,
    String(name).trim(),
    String(address).trim(),
    now,
    now
  ]);
  
  return {
    success: true,
    message: 'Branch created successfully',
    data: {
      id: id,
      name: String(name).trim(),
      address: String(address).trim(),
      createdAt: now,
      updatedAt: now
    }
  };
}

/**
 * Handle list branches
 */
function handleListBranches(data) {
  const sheet = getBranchesSheet();
  const dataRange = sheet.getDataRange().getValues();
  
  // Skip header
  const branches = [];
  for (let i = 1; i < dataRange.length; i++) {
    branches.push({
      id: dataRange[i][0],
      name: dataRange[i][1],
      address: dataRange[i][2],
      createdAt: dataRange[i][3],
      updatedAt: dataRange[i][4]
    });
  }
  
  return {
    success: true,
    message: 'Branches retrieved successfully',
    data: branches
  };
}

/**
 * Handle get branch by ID
 */
function handleGetBranch(data) {
  const { id } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'Branch ID is required'
    };
  }
  
  const branch = findBranchById(id);
  
  if (!branch) {
    return {
      success: false,
      message: 'Branch not found'
    };
  }
  
  return {
    success: true,
    message: 'Branch retrieved successfully',
    data: branch
  };
}

/**
 * Handle update branch
 */
function handleUpdateBranch(data) {
  const { id, name, address } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'Branch ID is required'
    };
  }
  
  const branch = findBranchById(id);
  
  if (!branch) {
    return {
      success: false,
      message: 'Branch not found'
    };
  }
  
  // Validasi name jika diubah
  if (name !== undefined && name !== null) {
    const nameStr = String(name).trim();
    if (nameStr === '') {
      return {
        success: false,
        message: 'Branch name cannot be empty'
      };
    }
    
    // Cek apakah name sudah digunakan oleh branch lain
    const existingBranch = findBranchByName(nameStr);
    if (existingBranch && existingBranch.id !== id) {
      return {
        success: false,
        message: 'Branch name already exists'
      };
    }
  }
  
  // Update data
  const sheet = getBranchesSheet();
  const dataRange = sheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === id) {
      const row = i + 1; // +1 karena index sheet dimulai dari 1
      const now = new Date().toISOString();
      
      // Update hanya field yang diubah
      if (name !== undefined && name !== null) {
        sheet.getRange(row, 2).setValue(String(name).trim());
      }
      if (address !== undefined && address !== null) {
        sheet.getRange(row, 3).setValue(String(address).trim());
      }
      
      // Update updatedAt
      sheet.getRange(row, 5).setValue(now);
      
      // Ambil data terbaru
      const updatedBranch = findBranchById(id);
      
      return {
        success: true,
        message: 'Branch updated successfully',
        data: updatedBranch
      };
    }
  }
  
  return {
    success: false,
    message: 'Branch not found'
  };
}

/**
 * Handle delete branch
 */
function handleDeleteBranch(data) {
  const { id } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'Branch ID is required'
    };
  }
  
  const branch = findBranchById(id);
  
  if (!branch) {
    return {
      success: false,
      message: 'Branch not found'
    };
  }
  
  // Hapus dari sheet
  const sheet = getBranchesSheet();
  const dataRange = sheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === id) {
      sheet.deleteRow(i + 1); // +1 karena index sheet dimulai dari 1
      
      return {
        success: true,
        message: 'Branch deleted successfully'
      };
    }
  }
  
  return {
    success: false,
    message: 'Branch not found'
  };
}

// ============================================
// SUPPLIERS MANAGEMENT FUNCTIONS
// ============================================

/**
 * Mendapatkan sheet Suppliers
 */
function getSuppliersSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SUPPLIERS_SHEET_NAME);
  
  // Jika sheet belum ada, buat sheet baru
  if (!sheet) {
    sheet = ss.insertSheet(SUPPLIERS_SHEET_NAME);
    // Set header sesuai interface Supplier
    sheet.getRange(1, 1, 1, 9).setValues([[
      'id', 'name', 'contact_person', 'phone', 'email', 'address', 'is_active', 'created_at', 'updated_at'
    ]]);
    // Format header
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    sheet.getRange(1, 1, 1, 9).setBackground('#4285f4');
    sheet.getRange(1, 1, 1, 9).setFontColor('#ffffff');
  }
  
  return sheet;
}

/**
 * Cari supplier berdasarkan ID
 */
function findSupplierById(id) {
  const sheet = getSuppliersSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) { // id di kolom 0 (index 0)
      return {
        id: data[i][0],
        name: data[i][1],
        contact_person: data[i][2],
        phone: data[i][3],
        email: data[i][4],
        address: data[i][5],
        is_active: data[i][6],
        created_at: data[i][7],
        updated_at: data[i][8]
      };
    }
  }
  return null;
}

/**
 * Handle create supplier
 */
function handleCreateSupplier(data) {
  const { name, contact_person = '', phone = '', email = '', address = '', is_active = true } = data;
  
  // Validasi
  if (!name || String(name).trim() === '') {
    return {
      success: false,
      message: 'Supplier name is required'
    };
  }
  
  // Generate ID dan timestamp
  const id = generateId();
  const now = new Date().toISOString();
  
  // Simpan ke sheet
  const sheet = getSuppliersSheet();
  sheet.appendRow([
    id,
    String(name).trim(),
    String(contact_person).trim(),
    String(phone).trim(),
    String(email).trim(),
    String(address).trim(),
    is_active ? true : false,
    now,
    now
  ]);
  
  return {
    success: true,
    message: 'Supplier created successfully',
    data: {
      id: id,
      name: String(name).trim(),
      contact_person: String(contact_person).trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      address: String(address).trim(),
      is_active: is_active ? true : false,
      created_at: now,
      updated_at: now
    }
  };
}

/**
 * Handle list suppliers
 */
function handleListSuppliers(data) {
  const sheet = getSuppliersSheet();
  const dataRange = sheet.getDataRange().getValues();
  
  // Skip header
  const suppliers = [];
  for (let i = 1; i < dataRange.length; i++) {
    suppliers.push({
      id: dataRange[i][0],
      name: dataRange[i][1],
      contact_person: dataRange[i][2],
      phone: dataRange[i][3],
      email: dataRange[i][4],
      address: dataRange[i][5],
      is_active: dataRange[i][6],
      created_at: dataRange[i][7],
      updated_at: dataRange[i][8]
    });
  }
  
  return {
    success: true,
    message: 'Suppliers retrieved successfully',
    data: suppliers
  };
}

/**
 * Handle get supplier by ID
 */
function handleGetSupplier(data) {
  const { id } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'Supplier ID is required'
    };
  }
  
  const supplier = findSupplierById(id);
  
  if (!supplier) {
    return {
      success: false,
      message: 'Supplier not found'
    };
  }
  
  return {
    success: true,
    message: 'Supplier retrieved successfully',
    data: supplier
  };
}

/**
 * Handle update supplier
 */
function handleUpdateSupplier(data) {
  const { id, name, contact_person, phone, email, address, is_active } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'Supplier ID is required'
    };
  }
  
  const supplier = findSupplierById(id);
  
  if (!supplier) {
    return {
      success: false,
      message: 'Supplier not found'
    };
  }
  
  // Validasi name jika diubah
  if (name !== undefined && name !== null) {
    const nameStr = String(name).trim();
    if (nameStr === '') {
      return {
        success: false,
        message: 'Supplier name cannot be empty'
      };
    }
  }
  
  // Update data
  const sheet = getSuppliersSheet();
  const dataRange = sheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === id) {
      const row = i + 1; // +1 karena index sheet dimulai dari 1
      const now = new Date().toISOString();
      
      // Update hanya field yang diubah
      if (name !== undefined && name !== null) {
        sheet.getRange(row, 2).setValue(String(name).trim());
      }
      if (contact_person !== undefined && contact_person !== null) {
        sheet.getRange(row, 3).setValue(String(contact_person).trim());
      }
      if (phone !== undefined && phone !== null) {
        sheet.getRange(row, 4).setValue(String(phone).trim());
      }
      if (email !== undefined && email !== null) {
        sheet.getRange(row, 5).setValue(String(email).trim());
      }
      if (address !== undefined && address !== null) {
        sheet.getRange(row, 6).setValue(String(address).trim());
      }
      if (is_active !== undefined && is_active !== null) {
        sheet.getRange(row, 7).setValue(is_active ? true : false);
      }
      
      // Update updated_at
      sheet.getRange(row, 9).setValue(now);
      
      // Ambil data terbaru
      const updatedSupplier = findSupplierById(id);
      
      return {
        success: true,
        message: 'Supplier updated successfully',
        data: updatedSupplier
      };
    }
  }
  
  return {
    success: false,
    message: 'Supplier not found'
  };
}

/**
 * Handle delete supplier
 */
function handleDeleteSupplier(data) {
  const { id } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'Supplier ID is required'
    };
  }
  
  const supplier = findSupplierById(id);
  
  if (!supplier) {
    return {
      success: false,
      message: 'Supplier not found'
    };
  }
  
  // Hapus dari sheet
  const sheet = getSuppliersSheet();
  const dataRange = sheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === id) {
      sheet.deleteRow(i + 1); // +1 karena index sheet dimulai dari 1
      
      return {
        success: true,
        message: 'Supplier deleted successfully'
      };
    }
  }
  
  return {
    success: false,
    message: 'Supplier not found'
  };
}

// ==================== TRANSACTIONS ====================

const TRANSACTIONS_COLUMNS = [
  'id',
  'transaction_number',
  'customer_name',
  'subtotal',
  'discount',
  'total',
  'paid_amount',
  'due_amount',
  'is_credit',
  'payment_method',
  'payment_status',
  'status',
  'branch_name',
  'items',
  'created_by',
  'created_at',
  'updated_at'
];

/**
 * Get Transactions column map
 */
function getTransactionsColumnMap_() {
  const sheet = getTransactionsSheet();
  return ensureSheetColumns_(sheet, TRANSACTIONS_COLUMNS);
}

/**
 * Mendapatkan sheet Transactions
 */
function getTransactionsSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(TRANSACTIONS_SHEET_NAME);
  
  // Jika sheet belum ada, buat sheet baru
  if (!sheet) {
    sheet = ss.insertSheet(TRANSACTIONS_SHEET_NAME);
    // Header akan di-set otomatis oleh ensureSheetColumns_()
  }

  // Pastikan header selalu up-to-date walaupun schema berubah
  ensureSheetColumns_(sheet, TRANSACTIONS_COLUMNS);
  
  return sheet;
}

/**
 * Generate transaction number
 */
function generateTransactionNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TRX-${year}${month}${day}-${random}`;
}

/**
 * Cari transaction berdasarkan ID
 */
function findTransactionById(id) {
  const sheet = getTransactionsSheet();
  const col = getTransactionsColumnMap_();
  const data = sheet.getDataRange().getValues();
  
  // Skip header
  for (let i = 1; i < data.length; i++) {
    if (data[i][col.id] === id) {
      const row = data[i];
      const transaction = {};
      TRANSACTIONS_COLUMNS.forEach((key) => {
        transaction[key] = row[col[key]];
      });
      return transaction;
    }
  }
  return null;
}

/**
 * Handle create transaction
 */
function handleCreateTransaction(data) {
  const {
    customer_name,
    discount = 0,
    total,
    subtotal,
    paid_amount = 0,
    is_credit = false,
    branch_name = '',
    payment_method = 'cash',
    payment_status = 'paid',
    status = 'pending',
    created_by,
    items = []
  } = data;

  if (!subtotal || subtotal === undefined || isNaN(Number(subtotal))) {
    return {
      success: false,
      message: 'Subtotal is required'
    };
  }

  if (!total || total === undefined || isNaN(Number(total))) {
    return {
      success: false,
      message: 'Total is required'
    };
  }

  // Validasi kasbon: jika is_credit = true, customer_name wajib
  if (is_credit && (!customer_name || String(customer_name).trim() === '')) {
    return {
      success: false,
      message: 'Customer name is required for credit transactions'
    };
  }

  // Hitung paid_amount dan due_amount
  // Jika bukan kasbon, paid_amount = total
  const totalAmount = Number(total);
  const paid = is_credit ? (Number(paid_amount) || 0) : totalAmount;
  const due = Math.max(0, totalAmount - paid);

  // Set payment_status: gunakan yang dikirim dari Next.js jika ada, jika tidak hitung otomatis
  let finalPaymentStatus = payment_status;
  if (!finalPaymentStatus || finalPaymentStatus === '') {
    // Hitung otomatis berdasarkan paid_amount
    if (paid === 0) {
      finalPaymentStatus = 'unpaid';
    } else if (paid >= totalAmount) {
      finalPaymentStatus = 'paid';
    } else {
      finalPaymentStatus = 'partial';
    }
  }

  // Normalisasi items + pastikan ada field unit per item
  // Jika client tidak kirim unit, ambil dari Products sheet berdasarkan product_id
  const normalizedItems = Array.isArray(items)
    ? items.map((it) => {
        if (!it || typeof it !== 'object') return it;
        const pid = it.product_id !== undefined && it.product_id !== null ? String(it.product_id) : '';
        const qty = Number(it.quantity) || 0;
        const priceNum = Number(it.price) || 0;
        let unitVal = it.unit ? String(it.unit) : '';
        let imageUrl = it.image_url ? String(it.image_url) : '';

        if (!unitVal && pid) {
          const prod = findProductById(pid);
          if (prod && prod.unit) unitVal = String(prod.unit);
        }

        // Jika image_url tidak dikirim, ambil dari Products sheet
        if (!imageUrl && pid) {
          const prod = findProductById(pid);
          if (prod && prod.image_url) imageUrl = String(prod.image_url);
        }

        return {
          product_id: pid,
          product_name: it.product_name ? String(it.product_name) : '',
          image_url: imageUrl,
          quantity: qty,
          price: priceNum,
          subtotal: it.subtotal !== undefined && it.subtotal !== null
            ? Number(it.subtotal) || (qty * priceNum)
            : (qty * priceNum),
          unit: unitVal
        };
      })
    : [];

  const sheet = getTransactionsSheet();
  const col = getTransactionsColumnMap_();
  
  const id = generateId();
  const transaction_number = generateTransactionNumber();
  const now = new Date().toISOString();
  
  const newRow = [];
  TRANSACTIONS_COLUMNS.forEach((key) => {
    if (key === 'id') {
      newRow.push(id);
    } else if (key === 'transaction_number') {
      newRow.push(transaction_number);
    } else if (key === 'customer_name') {
      newRow.push(customer_name || '');
    } else if (key === 'subtotal') {
      newRow.push(subtotal);
    } else if (key === 'discount') {
      newRow.push(discount || 0);
    } else if (key === 'total') {
      newRow.push(total);
    } else if (key === 'paid_amount') {
      newRow.push(paid);
    } else if (key === 'due_amount') {
      newRow.push(due);
    } else if (key === 'is_credit') {
      newRow.push(is_credit || false);
    } else if (key === 'payment_method') {
      newRow.push(payment_method);
    } else if (key === 'payment_status') {
      newRow.push(finalPaymentStatus);
    } else if (key === 'status') {
      newRow.push(status);
    } else if (key === 'branch_name') {
      newRow.push(branch_name || '');
    } else if (key === 'items') {
      // Simpan items sebagai JSON string
      newRow.push(JSON.stringify(normalizedItems));
    } else if (key === 'created_by') {
      newRow.push(created_by || '');
    } else if (key === 'created_at') {
      newRow.push(now);
    } else if (key === 'updated_at') {
      newRow.push(now);
    } else {
      newRow.push('');
    }
  });
  
  sheet.appendRow(newRow);
  
  const transaction = findTransactionById(id);
  
  return {
    success: true,
    message: 'Transaction created successfully',
    data: transaction
  };
}

/**
 * Handle list transactions
 */
function handleListTransactions(data) {
  const hasPagination = data && (data.page !== undefined || data.limit !== undefined);
  const page = hasPagination ? (data.page || 1) : 1;
  const limit = hasPagination ? (data.limit || 10) : undefined;
  
  const sheet = getTransactionsSheet();
  const col = getTransactionsColumnMap_();
  const dataRange = sheet.getDataRange().getValues();
  
  // Skip header
  const allTransactions = [];
  for (let i = 1; i < dataRange.length; i++) {
    const row = dataRange[i];
    const transaction = {};
    TRANSACTIONS_COLUMNS.forEach((key) => {
      transaction[key] = row[col[key]];
    });
    allTransactions.push(transaction);
  }
  
  // Reverse untuk mendapatkan yang terbaru di atas
  allTransactions.reverse();
  
  // Jika tidak ada pagination, kembalikan semua data
  if (!hasPagination || limit === undefined) {
    return {
      success: true,
      data: allTransactions
    };
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(allTransactions.length / limit);
  
  return {
    success: true,
    data: paginatedTransactions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: allTransactions.length,
      totalPages: totalPages,
      hasNext: Number(page) < totalPages,
      hasPrev: Number(page) > 1
    }
  };
}

/**
 * Handle get transaction
 */
function handleGetTransaction(data) {
  const { id } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'Transaction ID is required'
    };
  }
  
  const transaction = findTransactionById(id);
  
  if (!transaction) {
    return {
      success: false,
      message: 'Transaction not found'
    };
  }
  
  return {
    success: true,
    data: transaction
  };
}

/**
 * Handle update transaction
 */
function handleUpdateTransaction(data) {
  const { id } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'Transaction ID is required'
    };
  }
  
  const sheet = getTransactionsSheet();
  const col = getTransactionsColumnMap_();
  const dataRange = sheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][col.id] === id) {
      const now = new Date().toISOString();
      
      // Get current total
      const currentTotal = data.total !== undefined ? Number(data.total) : Number(dataRange[i][col.total]);
      
      // Jika paid_amount diupdate, hitung ulang due_amount dan payment_status
      if (data.paid_amount !== undefined) {
        const paid = Number(data.paid_amount);
        const due = Math.max(0, currentTotal - paid);
        
        // Set due_amount
        sheet.getRange(i + 1, col.due_amount + 1).setValue(due);
        
        // Update payment_status berdasarkan paid_amount
        let finalPaymentStatus = data.payment_status;
        if (paid === 0) {
          finalPaymentStatus = 'unpaid';
        } else if (paid >= currentTotal) {
          finalPaymentStatus = 'paid';
        } else {
          finalPaymentStatus = 'partial';
        }
        sheet.getRange(i + 1, col.payment_status + 1).setValue(finalPaymentStatus);
      }
      
      // Update fields yang ada di data
      TRANSACTIONS_COLUMNS.forEach((key) => {
        if (key !== 'id' && key !== 'transaction_number' && key !== 'created_at' && key !== 'due_amount' && key !== 'payment_status' && data[key] !== undefined) {
          let value = data[key];
          // Simpan items sebagai JSON string
          if (key === 'items' && Array.isArray(value)) {
            value = JSON.stringify(value);
          }
          sheet.getRange(i + 1, col[key] + 1).setValue(value);
        }
      });
      
      // Update updated_at
      sheet.getRange(i + 1, col.updated_at + 1).setValue(now);
      
      const updatedTransaction = findTransactionById(id);
      
      return {
        success: true,
        message: 'Transaction updated successfully',
        data: updatedTransaction
      };
    }
  }
  
  return {
    success: false,
    message: 'Transaction not found'
  };
}

/**
 * Handle delete transaction
 */
function handleDeleteTransaction(data) {
  const { id } = data;
  
  if (!id) {
    return {
      success: false,
      message: 'Transaction ID is required'
    };
  }
  
  const sheet = getTransactionsSheet();
  const col = getTransactionsColumnMap_();
  const dataRange = sheet.getDataRange().getValues();
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][col.id] === id) {
      sheet.deleteRow(i + 1); // +1 karena index sheet dimulai dari 1
      
      return {
        success: true,
        message: 'Transaction deleted successfully'
      };
    }
  }
  
  return {
    success: false,
    message: 'Transaction not found'
  };
}
