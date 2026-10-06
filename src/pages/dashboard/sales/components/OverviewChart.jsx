import ReactApexChart from 'react-apexcharts';
import { spanishChartLocale, formatNumber } from '../../spanishPresentation';
import { Button, Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap';
const OverviewChart = () => {
  const chartOptions = {
    series: [{
      name: 'Ingresos',
      type: 'area',
      data: [34, 65, 46, 68, 49, 61, 42, 44, 78, 52, 63, 67]
    }, {
      name: 'Pedidos',
      type: 'line',
      data: [8, 12, 7, 17, 21, 11, 5, 9, 7, 29, 12, 35]
    }],
    chart: {
      ...spanishChartLocale,
      height: 369,
      type: 'line',
      toolbar: {
        show: false
      }
    },
    stroke: {
      dashArray: [0, 8],
      width: [2, 2],
      curve: 'smooth'
    },
    fill: {
      opacity: [1, 1],
      type: ['gradient', 'solid'],
      gradient: {
        type: 'vertical',
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 70]
      }
    },
    markers: {
      size: [0, 0, 0],
      strokeWidth: 2,
      hover: {
        size: 4
      }
    },
    xaxis: {
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      axisTicks: {
        show: false
      },
      axisBorder: {
        show: false
      }
    },
    yaxis: {
      min: 0,
      labels: {
        formatter: function (val) {
          return formatNumber(val, { maximumFractionDigits: 0 }) + ' mil';
        }
      },
      axisBorder: {
        show: false
      }
    },
    grid: {
      show: true,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: -2,
        bottom: 15,
        left: 15
      }
    },
    legend: {
      show: true,
      horizontalAlign: 'center',
      offsetX: 0,
      offsetY: 5,
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
    plotOptions: {
      bar: {
        columnWidth: '30%',
        barHeight: '70%',
        borderRadius: 3
      }
    },
    colors: ['#7f56da', '#22c55e'],
    tooltip: {
      shared: true,
      y: {
        formatter: (y) => typeof y === 'undefined' ? y : '$' + formatNumber(y, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' mil'
      }
    }
  };
  return <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle>Resumen</CardTitle>
        <div className="icons-center gap-1">
          <Button variant="soft-secondary" size="sm" type="button">
            Todo
          </Button>
          <Button variant="soft-secondary" size="sm" type="button">
            1 mes
          </Button>
          <Button variant="soft-secondary" size="sm" type="button">
            6 meses
          </Button>
          <Button variant="soft-secondary" size="sm" type="button" active>
            1 año
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <div dir="ltr">
          <ReactApexChart height={369} options={chartOptions} series={chartOptions.series} type="line" className="apex-charts" />
        </div>
      </CardBody>
    </Card>;
};
export default OverviewChart;