import { useRef } from 'react';
import { Alert, Button, Modal, Spinner, Table } from 'react-bootstrap';
import useProductoExcel from '../hooks/useProductoExcel';

function Errors({ errors }) {
  if (!errors?.length) return null;
  return <div style={{ maxHeight: 300, overflow: 'auto' }}>
    <Table size="sm" bordered><thead><tr><th>Fila Excel</th><th>Error</th></tr></thead>
      <tbody>{errors.map((error, index) => <tr key={`${error.fila}-${index}`}><td>{error.fila}</td><td>{error.message}</td></tr>)}</tbody>
    </Table>
  </div>;
}

export default function ProductoExcelActions({ onImported }) {
  const input = useRef(null);
  const excel = useProductoExcel(onImported);
  return <>
    <div className="d-flex flex-wrap gap-2 align-items-center" aria-busy={excel.busy}>
      <Button variant="outline-success" disabled={excel.busy} onClick={() => excel.download(true)}>Descargar plantilla Excel</Button>
      <Button variant="success" disabled={excel.busy} onClick={() => input.current.click()}>Importar Excel</Button>
      <Button variant="outline-success" disabled={excel.busy} onClick={() => excel.download(false)}>Exportar todos a Excel</Button>
      <input ref={input} type="file" accept=".xlsx" className="d-none" aria-label="Archivo Excel de productos"
        onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; excel.prepare(file); }} />
      {excel.busy && <span role="status"><Spinner size="sm" className="me-2" />{excel.progress}</span>}
    </div>
    <Modal show={!!excel.pending} onHide={excel.closePreview} size="lg" backdrop="static">
      <Modal.Header closeButton><Modal.Title>Confirmar importación de productos</Modal.Title></Modal.Header>
      <Modal.Body>
        <p>{excel.pending?.total} filas: <strong>{excel.pending?.valid.length} válidas</strong> y {excel.pending?.errors.length} con errores.</p>
        <Alert variant="info">Se crearán únicamente las filas válidas. No se sobrescriben productos existentes.
          Cada producto se guarda por separado; mantenga esta ventana abierta hasta finalizar.</Alert>
        <Errors errors={excel.pending?.errors} />
      </Modal.Body>
      <Modal.Footer><Button variant="secondary" onClick={excel.closePreview}>Cancelar</Button>
        <Button variant="success" disabled={!excel.pending?.valid.length} onClick={excel.importProducts}>Importar filas válidas</Button></Modal.Footer>
    </Modal>
    <Modal show={!!excel.report} onHide={excel.closeReport} size="lg">
      <Modal.Header closeButton><Modal.Title>Resultado Excel</Modal.Title></Modal.Header>
      <Modal.Body>{excel.report?.error ? <Alert variant="danger">{excel.report.error}</Alert> : <>
        <Alert variant={excel.report?.errors?.length ? 'warning' : 'success'}>
          {excel.report?.created} productos creados de {excel.report?.total} filas.
          {!!excel.report?.errors?.length && ' Revise las filas no importadas antes de reintentar.'}
        </Alert><Errors errors={excel.report?.errors} />
      </>}</Modal.Body>
      <Modal.Footer><Button onClick={excel.closeReport}>Cerrar</Button></Modal.Footer>
    </Modal>
  </>;
}
