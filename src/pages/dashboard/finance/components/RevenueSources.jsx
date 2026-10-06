import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { currency } from '@/context/constants';
import ReactApexChart from 'react-apexcharts';
import { spanishChartLocale, formatNumber } from '../../spanishPresentation';
import { Card, CardBody, CardHeader, CardTitle, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Table } from 'react-bootstrap';
const RevenueSources = () => {
  const chartOptions = {
    chart: {
      ...spanishChartLocale,
      height: 205,
      type: 'donut'
    },
    legend: {
      show: false,
      position: 'bottom',
      horizontalAlign: 'center',
      offsetX: 0,
      offsetY: -5,
      markers: {
        // width: 9,
        // height: 9,
        // radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0
      }
    },
    stroke: {
      width: 0
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              showAlways: true,
              show: true
            }
          }
        }
      }
    },
    tooltip: { y: { formatter: (val) => formatNumber(val) } },
    series: [140, 125, 85],
    labels: ['En línea', 'Presencial', 'Directos'],
    colors: ['var(--bs-primary)', 'var(--bs-info)', 'var(--bs-light)'],
    dataLabels: {
      enabled: false
    }
  };
  return <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle>Fuentes de ingresos</CardTitle>
        <Dropdown>
          <DropdownToggle as={'a'} role="button" aria-label="Opciones del informe" className="arrow-none card-drop">
            <IconifyIcon icon="iconamoon:menu-kebab-vertical-circle-duotone" className="fs-20 align-middle text-muted" />
          </DropdownToggle>
          <DropdownMenu className="dropdown-menu-end">
            <DropdownItem href="">Informe de ventas</DropdownItem>
            <DropdownItem href="">Exportar informe</DropdownItem>
            <DropdownItem href="">Ganancias</DropdownItem>
            <DropdownItem href="">Acción</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody>
        <ReactApexChart height={205} options={chartOptions} series={chartOptions.series} type="donut" className="apex-charts mb-2" />
        <div className="table-responsive mb-n1">
          <Table borderless size="sm" className="table-nowrap  table-centered mb-0">
            <thead className="bg-light bg-opacity-50 thead-sm">
              <tr>
                <th className="py-1">Fuentes</th>
                <th className="py-1">Ingresos</th>
                <th className="py-1">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>En línea</td>
                <td>{currency}187.232</td>
                <td>
                  48,63%&nbsp;
                  <span className="badge badge-soft-success ms-1">2,5% de aumento</span>
                </td>
              </tr>
              <tr>
                <td>Presencial</td>
                <td>{currency}126.874</td>
                <td>
                  36,08%&nbsp;
                  <span className="badge badge-soft-success ms-1">8,5% de aumento</span>
                </td>
              </tr>
              <tr>
                <td>Directos</td>
                <td>{currency}90.127</td>
                <td>
                  23,41%&nbsp;
                  <span className="badge badge-soft-danger ms-1">10,98% de disminución</span>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>;
};
export default RevenueSources;