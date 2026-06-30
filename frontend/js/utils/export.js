// Excel and PDF export utilities
export function exportToExcel(data, sheetName = 'Data', fileName = 'export.xlsx') {
  if (typeof XLSX === 'undefined') {
    console.error('SheetJS not loaded');
    return;
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

export function exportToPDF(title, tableData, columns, fileName = 'laporan.pdf') {
  if (typeof jspdf === 'undefined') {
    console.error('jsPDF not loaded');
    return;
  }
  const { jsPDF } = jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  let y = 35;
  const colWidth = (doc.internal.pageSize.width - 28) / columns.length;

  // Header
  columns.forEach((col, i) => {
    doc.setFont(undefined, 'bold');
    doc.text(col.label, 14 + i * colWidth, y);
  });
  y += 8;

  // Rows
  doc.setFont(undefined, 'normal');
  tableData.forEach(row => {
    if (y > 280) { doc.addPage(); y = 20; }
    columns.forEach((col, i) => {
      const val = String(row[col.key] ?? '-');
      doc.text(val.substring(0, 20), 14 + i * colWidth, y);
    });
    y += 6;
  });

  doc.save(fileName);
}
