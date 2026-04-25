# Sistem Pengajuan Cuti

## Formula

### Google SpreadSheet

`=IF([KOLOM JENIS CUTI]="Cuti Alasan Penting"; DAYS([TANGGAL SELESAI]; [TANGGAL MULAI]) + 1; NETWORKDAYS([TANGGAL MULAI]; [TANGGAL SELESAI]))`
> Menghitung jumlah hari vs hari kerja

`=IF`
