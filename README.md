This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- ✅ Authentication dengan Google Sheets
- ✅ Login & Register
- ✅ Password hashing (SHA-256)
- ✅ User management

## Setup Google Sheets Authentication

### 1. Buat Google Spreadsheet

1. Buka [Google Sheets](https://docs.google.com/spreadsheets) dan buat spreadsheet baru
2. Copy **Spreadsheet ID** dari URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy bagian `SPREADSHEET_ID`

### 2. Setup Google Apps Script

1. Buka spreadsheet yang sudah dibuat
2. Klik **Extensions** > **Apps Script**
3. Hapus kode default dan paste kode dari file `appscript.txt`
4. Ganti `YOUR_SPREADSHEET_ID_HERE` dengan Spreadsheet ID Anda (baris 15)
5. Klik **Save** (Ctrl+S)
6. Klik **Deploy** > **New deployment**
7. Pilih **Select type** > **Web app**
8. Set konfigurasi:
   - **Execute as**: Me
   - **Who has access**: Anyone
9. Klik **Deploy**
10. Copy **Web App URL** yang muncul

### 3. Setup Environment Variable

1. Buat file `.env.local` di root project
2. Tambahkan:
   ```
   APPS_SCRIPT_URL=YOUR_WEB_APP_URL_HERE
   ```
3. Ganti `YOUR_WEB_APP_URL_HERE` dengan Web App URL dari Apps Script

### 4. Jalankan Project

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) dengan browser Anda.

## Routes

- `/` - Login page
- `/signup` - Register page
- `/api/auth/login` - Login API endpoint
- `/api/auth/register` - Register API endpoint

## Troubleshooting

### Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

Error ini terjadi ketika Apps Script mengembalikan HTML (biasanya halaman error) bukan JSON. Berikut cara mengatasinya:

1. **Pastikan Apps Script sudah di-deploy dengan benar:**
   - Buka Apps Script editor
   - Klik **Deploy** > **Manage deployments**
   - Pastikan ada deployment dengan type "Web app"
   - Pastikan "Who has access" adalah **Anyone**
   - Jika belum ada atau perlu update, klik **Edit** atau buat deployment baru

2. **Verifikasi URL Apps Script:**
   - URL harus berformat: `https://script.google.com/macros/s/.../exec`
   - Pastikan URL di `.env.local` sudah benar
   - Test URL di browser - harus mengembalikan JSON, bukan HTML

3. **Test Apps Script langsung:**
   - Buka URL Apps Script di browser
   - Harus muncul: `{"success":true,"message":"Google Apps Script API is running",...}`
   - Jika muncul halaman HTML error, berarti Apps Script belum di-deploy dengan benar

4. **Cek Spreadsheet ID:**
   - Pastikan Spreadsheet ID di Apps Script sudah benar
   - Pastikan spreadsheet sudah dibuat dan bisa diakses

5. **Restart development server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

6. **Cek console log:**
   - Lihat terminal untuk error message yang lebih detail
   - Error akan menampilkan response dari Apps Script untuk debugging

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
