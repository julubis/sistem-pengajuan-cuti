# Sistem Pengajuan Cuti

## Formula Google Sheet

### Menghitung jumlah hari cuti (semua hari vs hari kerja)
`=IF(INDEX(I:I; ROW())="Cuti karena Alasan Penting"; DAYS(INDEX(K:K; ROW()); INDEX(J:J; ROW())) + 1; NETWORKDAYS(INDEX(J:J; ROW()); INDEX(K:K; ROW())))`
> Jika jenis cuti adalah **Cuti karena Alasan Penting** maka hari Sabtu & Minggu dihitung
> - Kolom I = Jenis Cuti
> - Kolom J = Tanggal Mulai Cuti
> - Kolom K = Tanggal Selesai Cuti

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

### Membuat field link download
`HYPERLINK(CONCAT("URL_WEB_APP_SCRIPT", "?ts=", Timestamp, "&name=", Nama), "Download")`
> URL web dari Google Apps Script yang sudah di deploy
