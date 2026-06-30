// Pagination component
export function renderPagination(containerId, total, page, limit, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  let pages = '';
  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages += `<button class="pagination-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  container.innerHTML = `
    <div class="pagination">
      <span>Menampilkan ${start}-${end} dari ${total}</span>
      <div class="pagination-pages">
        <button class="pagination-btn" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>‹</button>
        ${pages}
        <button class="pagination-btn" data-page="${page + 1}" ${page === totalPages ? 'disabled' : ''}>›</button>
      </div>
    </div>
  `;

  container.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.page);
      if (p >= 1 && p <= totalPages && p !== page) onChange(p);
    });
  });
}
