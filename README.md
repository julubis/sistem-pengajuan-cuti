# Sistem Pengajuan Cuti

## Formula Google Sheet

### Menghitung jumlah hari cuti (semua hari vs hari kerja)
`=IF(INDEX(I:I; ROW())="Cuti karena Alasan Penting"; DAYS(INDEX(K:K; ROW()); INDEX(J:J; ROW())) + 1; NETWORKDAYS(INDEX(J:J; ROW()); INDEX(K:K; ROW())))`
> Jika jenis cuti adalah *Cuti karena Alasan Penting* maka hari Sabtu & Minggu dihitung
> - Kolom I = Jenis Cuti
> - Kolom J = Tanggal Mulai Cuti
> - Kolom K = Tanggal Selesai Cuti

`=IF`
