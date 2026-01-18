# Resi Checker - Technical Documentation

## Overview

Aplikasi web mobile-first untuk mencocokkan barcode resi Shopee dengan data pesanan.
Membantu owner toko menghindari pesanan terlewat kirim.

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React + Vite | React 18, Vite 5 |
| Styling | Tailwind CSS | 3.4 |
| Database | IndexedDB (Dexie.js) | Dexie 4 |
| CSV Parser | Papa Parse | 5.4 |
| XLSX Parser | SheetJS | 0.18 |

---

## Project Structure

```
resi_checker/
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main application component
│   ├── components/
│   │   ├── CsvUploader.jsx # Upload & column mapping
│   │   ├── ScanInput.jsx   # Barcode scan input
│   │   ├── Dashboard.jsx   # Counter stats & progress
│   │   └── PendingList.jsx # Pending orders list
│   ├── db/
│   │   └── database.js     # Dexie.js setup & operations
│   ├── utils/
│   │   └── csvParser.js    # CSV/XLSX parsing logic
│   └── styles/
│       └── index.css       # Tailwind imports
└── tech_doc.md             # This file
```

---

## Data Model

### Order Schema (IndexedDB)

```javascript
{
  id: number,              // Auto-increment primary key
  orderId: string,         // Order ID dari CSV (order_sn)
  trackingNumber: string,  // Tracking number (unique index)
  status: string,          // "pending" | "scanned"
  scannedAt: Date | null,  // Timestamp saat discan
  createdAt: Date          // Timestamp saat diimport
}
```

### Indexes
- `id` - Primary key (auto-increment)
- `trackingNumber` - Unique index untuk fast lookup saat scan

---

## Core Features

### 1. CSV/XLSX Upload

**File:** `src/components/CsvUploader.jsx`, `src/utils/csvParser.js`

**Flow:**
1. User pilih file CSV atau XLSX
2. Parser membaca file dan extract headers
3. Auto-detect kolom `tracking_number` dan `order_sn`
4. User bisa override mapping jika perlu
5. Preview 5 baris pertama
6. Import ke IndexedDB dengan validasi

**Validasi:**
- Tracking number tidak boleh kosong
- Duplicate dalam file → ditolak
- Duplicate dengan data existing → ditolak

**Auto-detect columns:**
- Tracking: `tracking_number`, `tracking_no`, `no_resi`, `resi`, `awb`
- Order ID: `order_sn`, `order_id`, `orderid`, `no_pesanan`

### 2. Barcode Scan

**File:** `src/components/ScanInput.jsx`

**Flow:**
1. Input text dengan permanent autofocus
2. External scanner mengetik barcode + Enter
3. System lookup tracking number di IndexedDB
4. Update status jika ditemukan
5. Tampilkan feedback visual

**Feedback States:**
- Success (hijau): Berhasil discan
- Warning (kuning): Sudah pernah discan
- Error (merah): Tidak ditemukan

**Behavior:**
- Auto-clear input setelah proses
- Auto-refocus setelah proses
- Feedback auto-hide setelah 2 detik

### 3. Dashboard

**File:** `src/components/Dashboard.jsx`

**Features:**
- Progress bar visual
- Counter: Total | Scanned | Pending
- Reset button dengan konfirmasi

### 4. Pending List

**File:** `src/components/PendingList.jsx`

**Features:**
- List pesanan dengan status pending
- Expandable (default 5, bisa lihat semua)
- Tampilkan tracking number + order ID

---

## Database Operations

**File:** `src/db/database.js`

```javascript
// Add orders dari CSV/XLSX
addOrders(orders) → { success, duplicates, errors }

// Get order by tracking number
getByTracking(trackingNumber) → Order | undefined

// Mark order as scanned
markAsScanned(trackingNumber) → { success, reason?, order? }

// Get stats
getStats() → { total, scanned, pending }

// Get pending orders
getPendingOrders() → Order[]

// Clear all data
clearAllOrders() → void
```

---

## Edge Cases

| Case | Handling |
|------|----------|
| File XLSX | SheetJS library untuk parsing |
| CSV dengan BOM | Papa Parse handle otomatis |
| Tracking dengan spasi | Trim sebelum simpan & compare |
| Browser refresh | Data persist di IndexedDB |
| Scan tidak ditemukan | Error feedback |
| Scan duplicate | Warning feedback |
| CSV kolom tidak standar | Manual mapping |
| File besar (>10k rows) | Process semua, loading indicator |

---

## Running the Application

### Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Usage Flow

1. **Upload Data**
   - Buka aplikasi di browser
   - Klik "Choose File" dan pilih file CSV/XLSX dari Shopee
   - Verify kolom mapping (biasanya auto-detect)
   - Klik "Import Data"

2. **Scan Barcode**
   - Pastikan cursor ada di input scan
   - Arahkan scanner ke barcode resi
   - Scanner akan mengetik tracking number + Enter
   - Lihat feedback (hijau = berhasil)

3. **Monitor Progress**
   - Lihat dashboard untuk progress
   - Lihat pending list untuk pesanan yang belum discan

4. **Reset (jika perlu)**
   - Klik "Reset" di dashboard
   - Konfirmasi untuk hapus semua data

---

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

IndexedDB didukung di semua browser modern.

---

## Limitations

- Single device (tidak ada sync)
- Tidak ada authentication
- Data hilang jika clear browser data
- Tidak ada export functionality (MVP)
