// Reusable table component
export function renderTable(containerId, columns, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="table-wrapper">
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>Belum ada data</p>
        </div>
      </div>
    `;
    return;
  }

  const headerCells = columns.map((col, i) => {
    const sortable = col.sortable ? 'sortable' : '';
    const sortIcon = col.sortable ? '<span class="sort-icon">↕</span>' : '';
    const alignClass = col.align ? ` text-${col.align}` : '';
    const styleAttr = col.style ? ` style="${col.style}"` : (col.width ? ` style="width: ${col.width}"` : '');
    return `<th class="${sortable}${alignClass}" data-col-index="${i}"${styleAttr}>${col.label}${sortIcon}</th>`;
  }).join('');

  const rows = data.map((row, rowIndex) => {
    const rowClass = options.rowClass ? options.rowClass(row) : '';
    const cells = columns.map(col => {
      const value = col.render ? col.render(row, rowIndex) : (row[col.key] ?? '-');
      const alignClass = col.align ? ` text-${col.align}` : '';
      const styleAttr = col.style ? ` style="${col.style}"` : (col.width ? ` style="width: ${col.width}"` : '');
      return `<td class="${alignClass}"${styleAttr}>${value}</td>`;
    }).join('');
    return `<tr class="${rowClass}">${cells}</tr>`;
  }).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table class="data-table ${options.compact ? 'data-table-compact' : ''}" id="${containerId}-table">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  // Sort handling
  if (options.onSort) {
    container.querySelectorAll('th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const colIndex = parseInt(th.dataset.colIndex);
        options.onSort(columns[colIndex].key);
      });
    });
  }
}
