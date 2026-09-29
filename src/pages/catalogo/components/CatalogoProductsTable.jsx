import clsx from 'clsx';
import { Link } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { currency } from '@/context/constants';
import { getCalculatedPrice, resolveProductImageUrl } from '@/helpers/product';
import { getStockStatus } from '@/utils/other';

const columns = [
  {
    header: 'Product Name',
    cell: ({
      row: {
        original: { id, images, name, description },
      },
    }) => {
      const rawSrc = Array.isArray(images) && images.length > 0 ? images[0] : null;
      const imgSrc = resolveProductImageUrl(rawSrc);
      return (
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 me-3">
            <Link to={`/catalogo/crear-producto?id=${id}`}>
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={name}
                  className="img-fluid avatar-sm object-fit-contain rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="avatar-sm bg-light rounded d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="bx:package" className="fs-24 text-primary" />
                </div>
              )}
            </Link>
          </div>
          <div className="flex-grow-1">
            <h5 className="mt-0 mb-1">
              <Link to={`/catalogo/crear-producto?id=${id}`} className="text-reset">
                {name}
              </Link>
            </h5>
            <span className="fs-13 text-muted">{description}</span>
          </div>
        </div>
      );
    },
  },
  {
    header: 'Category',
    cell: ({ row: { original } }) => original.category?.name || original.category || 'General',
  },
  {
    header: 'Price',
    cell: ({ row: { original } }) => {
      if (original.sale) {
        return currency + getCalculatedPrice(original);
      }
      return currency + (Number(original.price) || 0).toLocaleString('en-US');
    },
  },
  {
    header: 'Inventory',
    cell: ({
      row: {
        original: { quantity },
      },
    }) => {
      const stockStatus = getStockStatus(Number(quantity) || 0);
      return (
        <div className={'text-' + stockStatus.variant}>
          <IconifyIcon icon="bxs:circle" className={clsx('me-1', 'text-' + stockStatus.variant)} />
          {stockStatus.text}
        </div>
      );
    },
  },
  {
    header: 'Action',
    cell: ({ row: { original } }) => (
      <>
        <Link
          to={`/catalogo/crear-producto?id=${original.id}`}
          className="btn btn-sm btn-soft-secondary me-1"
          title="Editar Producto"
        >
          <IconifyIcon icon="bx:edit" className="fs-18" />
        </Link>
        <button
          type="button"
          className="btn btn-sm btn-soft-danger"
          title="Eliminar Producto"
          onClick={() => { }}
        >
          <IconifyIcon icon="bx:trash" className="fs-18" />
        </button>
      </>
    ),
  },
];

const CatalogoProductsTable = ({ products }) => {
  const pageSizeList = [2, 5, 10, 20, 50];
  return (
    <ReactTable
      columns={columns}
      data={products}
      rowsPerPageList={pageSizeList}
      pageSize={10}
      tableClass="text-nowrap mb-0"
      theadClass="bg-light bg-opacity-50"
      showPagination
    />
  );
};

export default CatalogoProductsTable;
