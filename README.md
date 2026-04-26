# Sistem Pengajuan Cuti

## Formula Google Sheet

### Menghitung jumlah hari cuti (semua hari vs hari kerja)
`=IF(INDEX(I:I; ROW())="Cuti karena Alasan Penting"; DAYS(INDEX(K:K; ROW()); INDEX(J:J; ROW())) + 1; NETWORKDAYS(INDEX(J:J; ROW()); INDEX(K:K; ROW())))`
> Jika jenis cuti adalah **Cuti karena Alasan Penting** maka hari Sabtu & Minggu dihitung
> - Kolom I = Jenis Cuti
> - Kolom J = Tanggal Mulai Cuti
> - Kolom K = Tanggal Selesai Cuti

### Mengitung jumlah hari cuti tahunan yang terpakai
`=SUMIFS(Form_Responses[Jumlah Hari]; Form_Responses[Nama]; A2; Form_Responses[Status 3]; "ACC"; Form_Responses[Jenis Cuti]; "Cuti Tahunan"; Form_Responses[Jumlah Hari]; ">0")`
> Kolom A2 = Nama Karyawan di sheet Data Karyawan

### Menghitung sisa cuti N2 (2 tahun sebelumnya)
`=MAX(0; C2 - E2)`
> - Kolom C2 = Kuota sisa cuti N2
> - Kolom E2 = Jumlah cuti yang terpakai

### Menghitung sisa cuti N1 (1 tahun sebelumnya)
`=MAX(0; C2 + D2 - E2 - F2)`
> - Kolom C2 = Kuota sisa cuti N2
> - Kolom D2 = Kuota sisa cuti N1
> - Kolom E2 = Jumlah cuti yang terpakai
> - Kolom F2 = Sisa cuti N2

### Menghitung sisa cuti N (Tahun ini)
`=MAX(0; B2 + C2 + D2 - E2 - F2 - G2)`
> - Kolom B2 = Kouta cuti N
> - Kolom C2 = Kuota sisa cuti N2
> - Kolom D2 = Kuota sisa cuti N1
> - Kolom E2 = Jumlah cuti yang terpakai
> - Kolom F2 = Sisa cuti N2
> - Kolom G2 = Sisa cuti N1

### Menghitung total sisa cuti
`=SUM(F2 + G2 + H2)`
> - Kolom F2 = Sisa cuti N2
> - Kolom G2 = Sisa cuti N1
> - Kolom H2 = Sisa cuti N

### Mendapatkan nilai yang sama dari sheet lain
`=XLOOKUP("KATA_KUNCI"; 'NamaSheet'!A:A; 'NamaSheet'!E:E)`

## Formula Looker Studio

### Membuat field status
`CASE
  WHEN Status 1 = 'Terverifikasi' AND Status 2 = 'Terverifikasi' AND Status 3 = 'ACC' THEN 'ACC'
  WHEN Status 1 = 'Ditolak' OR Status 2 = 'Ditolak' OR Status 3 = 'Ditolak' THEN 'Ditolak'
  WHEN Status 1 = 'Terverifikasi' AND Status 2 = 'Terverifikasi' THEN 'Terverifikasi 2'
  WHEN Status 1 = 'Terverifikasi' THEN 'Terverifikasi 1'
  ELSE 'Menunggu persetujuan'
END`
> - Jika status 1, 2, dan 3 oke, maka statusnya **ACC**
> - Jika status 1, 2, atau 3 ditolak, maka statusnya **Ditolak**
> - Jika hanya status 1 dan 2 yang oke, maka statusnya **Terverifikasi 2**
> - Jika hanya status 1 yang oke, maka statusnya **Terverifikasi 1**
> - Jika status 1, 2, dan 3 kosong, maka statusnya **Menunggu persetujuan**

### Membuat field tahap
`CASE
  WHEN Status 1 IS NULL AND Status 2 IS NULL AND Status 3 IS NULL THEN 'Tahap 1'
  WHEN Status 1 = 'Terverifikasi' AND Status 2 IS NULL AND Status 3 IS NULL THEN 'Tahap 2'
  WHEN Status 1 = 'Terverifikasi' AND Status 2 = 'Terverifikasi' AND Status 3 IS NULL THEN 'Tahap 3'
  ELSE 'Selesai'
END`
> - Jika status 1, 2, dan 3 null, maka tahapnya **Tahap 1**
> - Jika hanya status 2 dan 3 yang null, maka tahapnya **Tahap 2**
> - Jika hanya status 3 yang null, maka tahapnya **Tahap 3**

### Membuat field link download
`HYPERLINK(CONCAT("URL_WEB_APP_SCRIPT", "?ts=", Timestamp, "&name=", Nama), "Download")`
> URL web dari Google Apps Script yang sudah di deploy

### Membuat field link sheet
`HYPERLINK(
  CONCAT(
    "URL_GOOGLE_SHEET",
    "&range=",
    CASE 
      WHEN Tahap = 'Tahap 1' THEN 'O'
      WHEN Tahap = 'Tahap 2' THEN 'P'
      WHEN Tahap = 'Tahap 3' THEN 'Q'
    END,
    CAST(ID AS TEXT)
  ), 
  "Sheet"
)`
> URL Google Sheet di Sheet Form Response
