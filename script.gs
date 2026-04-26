/**
 * =========================================================================
 * KONFIGURASI UTAMA (Ubah bagian ini sesuai dengan format Spreadsheet Anda)
 * =========================================================================
 */
const CONFIG = {
  // Pengaturan Umum
  TIMEZONE: 'Asia/Jakarta',
  PDF_FILENAME: 'Bukti-Pengajuan-Cuti.pdf',

  // Nama-nama Sheet di Spreadsheet
  SHEETS: {
    RESPONSES: 'Form Responses 1',
    KARYAWAN: 'Data Karyawan',
    TEMPLATE: 'Template'
  },

  // Pengaturan Formula pada onFormSubmit
  ON_SUBMIT: {
    COL_ROW_NUMBER: 'R',
    COL_DURATION: 'L',
    COL_JENIS_CUTI: 'I:I',
    COL_START_DATE: 'J:J',
    COL_END_DATE: 'K:K',
    TEXT_ALASAN_PENTING: 'Cuti karena Alasan Penting'
  },

  // Indeks Kolom pada Data Pengajuan (Ingat: Index Array dimulai dari 0)
  // Contoh: Kolom A = 0, Kolom B = 1, Kolom C = 2, dst.
  DATA_INDEX: {
    TIMESTAMP: 0,
    NAMA: 2,
    NIP: 3,
    JABATAN: 4,
    UNIT_KERJA: 5,
    ALAMAT_CUTI: 7,
    JENIS_CUTI: 8,
    MULAI_CUTI: 9,
    SELESAI_CUTI: 10,
    ALASAN: 12,
    STATUS_1: 14,
    STATUS_2: 15,
    STATUS_3: 16,
  },

  // Indeks Kolom pada Data Karyawan
  KARYAWAN_INDEX: {
    NAMA: 0
  },

  // Pemetaan Posisi Sel pada Sheet Template PDF
  TEMPLATE_CELLS: {
    TANGGAL_CETAK: 'G7',
    NAMA: 'B19',
    NAMA_BAWAH: 'G45',
    JABATAN: 'B20',
    UNIT_KERJA: 'B21',
    NIP: 'F19',
    NIP_BAWAH: 'G46',
    ALASAN_ATAS: 'A29',
    ALASAN_BAWAH: 'A44',
    MULAI_CUTI: 'F32',
    SELESAI_CUTI: 'H32',
    ALAMAT_CUTI: 'A42'
  },

  // Pemetaan Centang (√) Berdasarkan Jenis Cuti (Gunakan huruf kecil semua)
  CHECKBOX_CUTI: {
    'cuti tahunan': 'D24',
    'cuti sakit': 'D25',
    'cuti karena alasan penting': 'D26',
    'cuti besar': 'H24',
    'cuti melahirkan': 'H25',
    'cuti diluar tanggungan negara': 'H26',
    'cuti pengganti cuti bersama': 'H27'
  }
};

/**
 * =========================================================================
 * LOGIKA SISTEM (Pengguna tidak perlu mengubah kode di bawah ini)
 * =========================================================================
 */

function onFormSubmit(e) {
  const sheet = e.source.getActiveSheet();
  const rowIndex = e.range.getRowIndex();
  const cfg = CONFIG.ON_SUBMIT;
  
  sheet.getRange(cfg.COL_ROW_NUMBER + rowIndex).setValue('=ROW()');
  
  // Formula dinamis berdasarkan konfigurasi
  const formulaDurasi = `=IF(INDEX(${cfg.COL_JENIS_CUTI}; ROW())="${cfg.TEXT_ALASAN_PENTING}"; DAYS(INDEX(${cfg.COL_END_DATE}; ROW()); INDEX(${cfg.COL_START_DATE}; ROW())) + 1; NETWORKDAYS(INDEX(${cfg.COL_START_DATE}; ROW()); INDEX(${cfg.COL_END_DATE}; ROW())))`;
  sheet.getRange(cfg.COL_DURATION + rowIndex).setValue(formulaDurasi);
}

function doGet(e) {
  if (!e || !e.parameter || !e.parameter.ts || !e.parameter.name) {
    return buildHtmlUI("Parameter URL tidak lengkap.", "error");
  }

  const { ts, name } = e.parameter;
  const tz = CONFIG.TIMEZONE;
  const idx = CONFIG.DATA_INDEX;

  try {
    const timestamp = Utilities.formatDate(new Date(ts), tz, 'yyyy-MM-dd HH:mm:ss');
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Ambil Data Pengajuan
    const pengajuan = ss.getSheetByName(CONFIG.SHEETS.RESPONSES);
    const pLastRow = pengajuan.getLastRow();
    if (pLastRow < 2) return buildHtmlUI("Data pengajuan kosong.", "error");

    const dataPengajuan = pengajuan.getRange(2, 1, pLastRow - 1, 18).getValues();
    const pengajuanUser = dataPengajuan.find(row => 
      Utilities.formatDate(row[idx.TIMESTAMP], tz, 'yyyy-MM-dd HH:mm:ss') === timestamp && 
      row[idx.NAMA].toString().trim() === name.trim() &&
      row[idx.STATUS_1].toString().trim() === 'Terverifikasi' &&
      row[idx.STATUS_2].toString().trim() === 'Terverifikasi' &&
      row[idx.STATUS_3].toString().trim() === 'ACC'
    );

    if (!pengajuanUser) {
      const msg = `Pengajuan Cuti tidak ditemukan atau belum disetujui.<br><br>
                   <b>NAMA:</b> ${name}<br>
                   <b>WAKTU:</b> ${Utilities.formatDate(new Date(ts), tz, 'yyyy-MM-dd HH:mm')}`;
      return buildHtmlUI(msg, "error");
    }

    // 2. Ambil Data Karyawan
    const karyawan = ss.getSheetByName(CONFIG.SHEETS.KARYAWAN);
    const kLastRow = karyawan.getLastRow();
    if (kLastRow < 2) return buildHtmlUI("Data karyawan kosong.", "error");

    const dataKaryawan = karyawan.getRange(2, 1, kLastRow - 1, 2).getValues();
    const karyawanUser = dataKaryawan.find(row => row[CONFIG.KARYAWAN_INDEX.NAMA].toString() === name);

    if (!karyawanUser) return buildHtmlUI("Data Karyawan tidak ditemukan.", "error");

    // 3. Proses Template Copy
    const templateAsli = ss.getSheetByName(CONFIG.SHEETS.TEMPLATE);
    if (!templateAsli) return buildHtmlUI(`Sheet "${CONFIG.SHEETS.TEMPLATE}" tidak ditemukan.`, "error");

    let templateCopy = null;

    try {
      templateCopy = templateAsli.copyTo(ss);
      const cells = CONFIG.TEMPLATE_CELLS;
      
      const tglHariIni = Utilities.formatDate(new Date(), tz, "dd MMMM yyyy");
      const tglMulaiKerjaStandard = Utilities.formatDate(new Date(karyawanUser[CONFIG.KARYAWAN_INDEX.TANGGAL_MULAI_KERJA]), tz, "yyyy-MM-dd");

      // Set Nilai Teks Biasa
      templateCopy.getRange(cells.TANGGAL_CETAK).setValue('Jakarta, ' + tglHariIni);
      templateCopy.getRange(cells.NAMA).setValue(': ' + pengajuanUser[idx.NAMA].toString());
      templateCopy.getRange(cells.NAMA_BAWAH).setValue(pengajuanUser[idx.NAMA].toString());
      templateCopy.getRange(cells.JABATAN).setValue(': ' + pengajuanUser[idx.JABATAN].toString());
      templateCopy.getRange(cells.UNIT_KERJA).setValue(': ' + pengajuanUser[idx.UNIT_KERJA].toString());
      templateCopy.getRange(cells.NIP).setValue(': ' + pengajuanUser[idx.NIP].toString()); 
      templateCopy.getRange(cells.NIP_BAWAH).setValue('NIP. ' + pengajuanUser[idx.NIP].toString()); 
      
      // Set Formula Masa Kerja
      // templateCopy.getRange(cells.MASA_KERJA).setValue(`=CONCAT(": "; DATEDIF("${tglMulaiKerjaStandard}"; TODAY(); "Y") & " Tahun " & DATEDIF("${tglMulaiKerjaStandard}"; TODAY(); "YM") & " Bulan")`);

      // Set Checkbox Berdasarkan Jenis Cuti
      const jenisCuti = pengajuanUser[idx.JENIS_CUTI].toString().toLowerCase().trim();
      const targetCellCheckbox = CONFIG.CHECKBOX_CUTI[jenisCuti];
      
      if (targetCellCheckbox) {
        templateCopy.getRange(targetCellCheckbox).setValue('√');
      } else {
        return buildHtmlUI(`Jenis Cuti "${jenisCuti}" tidak valid atau tidak dipetakan.`, "error");
      }

      // Set Data Cuti Lainnya
      templateCopy.getRange(cells.ALASAN_ATAS).setValue(pengajuanUser[idx.ALASAN].toString());
      templateCopy.getRange(cells.ALASAN_BAWAH).setValue(pengajuanUser[idx.ALASAN].toString());
      templateCopy.getRange(cells.MULAI_CUTI).setValue(Utilities.formatDate(pengajuanUser[idx.MULAI_CUTI], tz, "dd MMMM yyyy")); 
      templateCopy.getRange(cells.SELESAI_CUTI).setValue(Utilities.formatDate(pengajuanUser[idx.SELESAI_CUTI], tz, "dd MMMM yyyy"));
      templateCopy.getRange(cells.ALAMAT_CUTI).setValue(pengajuanUser[idx.ALAMAT_CUTI].toString());

      SpreadsheetApp.flush();

      // Export ke PDF
      const url = `https://docs.google.com/spreadsheets/d/${ss.getId()}/export?exportFormat=pdf&format=pdf&size=A4&gridlines=false&fittopage=true&portrait=true&fitw=true&gid=${templateCopy.getSheetId()}`;
      const token = ScriptApp.getOAuthToken();
      const resp = UrlFetchApp.fetch(url, {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      const pdfB64 = Utilities.base64Encode(resp.getBlob().getBytes());
      return buildDownloadUI(pdfB64, CONFIG.PDF_FILENAME);

    } finally {
      // Pastikan Sheet Copy selalu dihapus untuk mencegah penumpukan sheet
      if (templateCopy) {
        ss.deleteSheet(templateCopy);
      }
    }

  } catch (e) {
    return buildHtmlUI("Terjadi kesalahan sistem:<br>" + e.message, "error");
  }
}

/**
 * Fungsi untuk membuat tampilan UI Error/Informasi
 */
function buildHtmlUI(message, type) {
  const isError = type === "error";
  const color = isError ? "#e74c3c" : "#3498db";
  const icon = isError ? "⚠️" : "ℹ️";
  const title = isError ? "Terjadi Kesalahan" : "Pemberitahuan";

  const html = `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
      .card { background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.08); text-align: center; max-width: 400px; width: 90%; }
      .icon { font-size: 60px; margin-bottom: 10px; }
      h2 { color: ${color}; margin: 0 0 15px 0; font-size: 24px; }
      .message { color: #555; line-height: 1.6; font-size: 15px; margin-bottom: 25px; }
      .btn { background-color: ${color}; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 15px; font-weight: 600; transition: 0.3s; }
      .btn:hover { opacity: 0.85; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon">${icon}</div>
      <h2>${title}</h2>
      <div class="message">${message}</div>
      <button class="btn" onclick="window.history.back()">Kembali</button>
    </div>
  </body>
  </html>`;

  return HtmlService.createHtmlOutput(html).setTitle(title);
}

/**
 * Fungsi untuk membuat tampilan UI saat proses download berjalan
 */
function buildDownloadUI(pdfB64, fileName) {
  const html = `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mengunduh PDF...</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
      .card { background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.08); text-align: center; max-width: 400px; width: 90%; }
      .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #2ecc71; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px auto; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .success-icon { font-size: 60px; display: none; margin-bottom: 10px; }
      h2 { color: #333; margin: 0 0 10px 0; font-size: 22px; transition: color 0.3s; }
      p { color: #666; line-height: 1.5; font-size: 15px; margin: 0; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="spinner" id="spinner"></div>
      <div class="success-icon" id="successIcon">✅</div>
      <h2 id="title">Sedang Mengunduh...</h2>
      <p id="desc">Mohon tunggu, dokumen Anda sedang disiapkan.</p>
    </div>
    <script>
    (function () {
        const base64 = "${pdfB64}";
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "${fileName}";
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(link.href);
        
        setTimeout(() => {
          document.getElementById('spinner').style.display = 'none';
          document.getElementById('successIcon').style.display = 'block';
          document.getElementById('title').innerText = 'Berhasil Diunduh!';
          document.getElementById('title').style.color = '#2ecc71';
          document.getElementById('desc').innerText = 'File PDF Anda telah diunduh.';
        }, 800);
    })();
    </script>
  </body>
  </html>`;

  return HtmlService.createHtmlOutput(html).setTitle('Mengunduh Dokumen...');
}

function onFormSubmit(e) {
  const sheet = e.source.getActiveSheet();
  const rowIndex = e.range.getRowIndex();
  sheet.getRange('R' + rowIndex).setValue('=ROW()');
  sheet.getRange('L' + rowIndex).setValue('=IF(INDEX(I:I; ROW())="Cuti karena Alasan Penting"; DAYS(INDEX(K:K; ROW()); INDEX(J:J; ROW())) + 1; NETWORKDAYS(INDEX(J:J; ROW()); INDEX(K:K; ROW())))');
}
