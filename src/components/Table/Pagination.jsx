import clsx from 'clsx';
import { useMemo } from 'react';
import { Col } from 'react-bootstrap';
import IconifyIcon from '../wrappers/IconifyIcon';

const getVisiblePages = (totalPages, currentPage) => {
  if (!totalPages || totalPages <= 1) return [1];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis-start', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages];
};

const Pagination = ({ table, rowsPerPageList, currentPage, totalPages }) => {
  const pageSizeList = rowsPerPageList ?? [5, 10, 25, 50, 100];
  const pagesCount = Math.max(1, totalPages || 1);
  const activePage = Math.min(Math.max(1, currentPage || 1), pagesCount);

  const visiblePages = useMemo(
    () => getVisiblePages(pagesCount, activePage),
    [pagesCount, activePage]
  );

  const canPrevious = table.getCanPreviousPage() && activePage > 1;
  const canNext = table.getCanNextPage() && activePage < pagesCount;

  return (
    <div className="align-items-center justify-content-between row g-0 text-center text-sm-start p-3 border-top">
      <div className="col-sm">
        <div className="d-flex align-items-center gap-2">
          <div className="text-muted text-nowrap">
            Página <span className="fw-semibold">{activePage}</span> de{' '}
            <span className="fw-semibold">{pagesCount}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="page-size-select">Filas por página: </label>
            <select
              name="page-size-select"
              id="page-size-select"
              className="form-select w-auto"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
                table.setPageIndex(0);
              }}
            >
              {pageSizeList.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <Col sm="auto" className="mt-3 mt-sm-0">
        <ul className="pagination pagination-rounded m-0">
          <li className={clsx('page-item', { disabled: !canPrevious })}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (canPrevious) table.previousPage();
              }}
              disabled={!canPrevious}
              className={clsx('page-link', { disabled: !canPrevious })}
              style={{ cursor: !canPrevious ? 'not-allowed' : 'pointer' }}
              aria-label="Página anterior"
            >
              <IconifyIcon icon="bx:left-arrow-alt" height={18} width={18} />
            </button>
          </li>
          {visiblePages.map(page => {
            if (typeof page === 'string') {
              return (
                <li key={page} className="page-item disabled">
                  <span className="page-link border-0 text-muted">...</span>
                </li>
              );
            }
            const isActive = page === activePage;
            return (
              <li key={page} className={clsx('page-item', { active: isActive })}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    table.setPageIndex(page - 1);
                  }}
                  className="page-link"
                  aria-label={`Ir a la página ${page}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {page}
                </button>
              </li>
            );
          })}
          <li className={clsx('page-item', { disabled: !canNext })}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (canNext) table.nextPage();
              }}
              disabled={!canNext}
              className={clsx('page-link', { disabled: !canNext })}
              style={{ cursor: !canNext ? 'not-allowed' : 'pointer' }}
              aria-label="Página siguiente"
            >
              <IconifyIcon icon="bx:right-arrow-alt" height={18} width={18} />
            </button>
          </li>
        </ul>
      </Col>
    </div>
  );
};

export default Pagination;