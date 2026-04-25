function onFormSubmit(e) {
  const sheet = e.source.getActiveSheet();
  const rowIndex = e.range.getRowIndex();
  sheet.getRange('Q' + rowIndex).setValue('=ROW()');
  sheet.getRange('L' + rowIndex).setValue('=IF(INDEX(I:I; ROW())="Cuti Alasan Penting"; DAYS(INDEX(K:K; ROW()); INDEX(J:J; ROW())) + 1; NETWORKDAYS(INDEX(J:J; ROW()); INDEX(K:K; ROW())))');
}

