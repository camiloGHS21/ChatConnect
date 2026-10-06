import { Button, Card, CardBody, CardTitle, Col, Row } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import { spanishChartLocale, formatNumber } from '../../spanishPresentation';

const Conversions = () => {
  const chartOptions = {
    chart: {
      ...spanishChartLocale,
      height: 292,
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        dataLabels: {
          name: {
            fontSize: '14px',
            color: undefined,
            offsetY: 100,
          },
          value: {
            offsetY: 55,
            fontSize: '22px',
            color: undefined,
            formatter: function (val) {
              return formatNumber(val) + '%';
            },
          },
        },
        track: {
          background: 'rgba(170,184,197, 0.2)',
          margin: 0,
        },
      },
    },
    fill: {
      gradient: {
        shade: 'dark',
        shadeIntensity: 0.2,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 65, 91],
      },
    },
    stroke: {
      dashArray: 4,
    },
    colors: ['#25D366', '#7f56da'],
    series: [86.4],
    labels: ['Resuelto por IA'],
    responsive: [
      {
        breakpoint: 380,
        options: {
          chart: {
            height: 180,
          },
        },
      },
    ],
  };

  const chartOptions2 = {
    chart: {
      ...spanishChartLocale,
      height: 313,
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      dashArray: [0, 0],
      width: [0, 2],
      curve: 'smooth',
    },
    fill: {
      opacity: [1, 1],
      type: ['solid', 'solid'],
    },
    markers: {
      size: [0, 4],
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    xaxis: {
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    tooltip: { y: { formatter: (val) => formatNumber(val) } },
    yaxis: {
      min: 0,
      labels: { formatter: (val) => formatNumber(val) },
      axisBorder: {
        show: false,
      },
    },
    grid: {
      show: true,
      strokeDashArray: 3,
    },
    legend: {
      show: true,
      horizontalAlign: 'center',
    },
    plotOptions: {
      bar: {
        columnWidth: '32%',
        borderRadius: 4,
      },
    },
    colors: ['#7f56da', '#25D366'],
    series: [
      {
        name: 'Mensajes WhatsApp',
        type: 'column',
        data: [450, 620, 890, 1100, 1250, 980, 1340, 1420, 1680, 1550, 1720, 1890],
      },
      {
        name: 'Pedidos Formalizados',
        type: 'line',
        data: [35, 48, 72, 85, 96, 78, 110, 118, 142, 130, 150, 168],
      },
    ],
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-0">
        <Row className="g-0">
          <Col lg={4}>
            <div className="p-3 d-flex flex-column justify-content-between h-100">
              <CardTitle as={'h5'} className="fw-bold">
                Automatización WhatsApp
              </CardTitle>
              <ReactApexChart
                options={chartOptions}
                series={chartOptions.series}
                height={292}
                type="radialBar"
                className="apex-charts mb-2 mt-n2"
              />
              <Row className="text-center">
                <Col xs={6}>
                  <p className="text-muted mb-1 fs-12">Atención IA (automática)</p>
                  <h4 className="text-success mb-2 fw-bold">1.106</h4>
                </Col>
                <Col xs={6}>
                  <p className="text-muted mb-1 fs-12">Asesor Humano</p>
                  <h4 className="text-primary mb-2 fw-bold">174</h4>
                </Col>
              </Row>
              <div className="text-center">
                <Button variant="outline-success" size="sm" type="button" className="w-100 rounded-pill">
                  Supervisar Conversaciones
                </Button>
              </div>
            </div>
          </Col>
          <Col lg={8} className="border-start">
            <div className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <CardTitle as={'h5'} className="fw-bold mb-0">
                  Flujo de Mensajes y Pedidos WhatsApp
                </CardTitle>
                <span className="badge bg-success-subtle text-success px-2 py-1 rounded-pill">
                  Meta Cloud API Conectado
                </span>
              </div>
              <div className="alert alert-light border border-success-subtle d-flex align-items-center gap-2 py-2 px-3 mb-2" role="alert">
                <span className="badge bg-success text-white p-1 rounded-circle">✓</span>
                <span className="fs-12 text-muted">
                  Canal Activo: <strong>+57 302 461 0721</strong> (Ferretería El Constructor). Base de datos sincronizada.
                </span>
              </div>
              <div dir="ltr">
                <ReactApexChart
                  options={chartOptions2}
                  series={chartOptions2.series}
                  height={300}
                  type="line"
                  className="apex-charts"
                />
              </div>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default Conversions;