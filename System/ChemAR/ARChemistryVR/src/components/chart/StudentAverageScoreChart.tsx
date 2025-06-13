import React from 'react';
import Chart from 'react-apexcharts';

const StudentAverageScoreChart: React.FC<{ score: number }> = ({ score }) => {
  const options : any= {
    series: [score] + "%",
    chart: {
      height: 350,
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,
        hollow: {
          margin: 0,
          size: '70%',
          background: '#fff',
          dropShadow: {
            enabled: true,
            top: 3,
            blur: 4,
            opacity: 0.5,
          },
        },
        track: {
          background: '#f0f0f0',
          strokeWidth: '67%',
          dropShadow: {
            enabled: true,
            top: -3,
            blur: 4,
            opacity: 0.7,
          },
        },
        dataLabels: {
          name: {
            offsetY: -10,
            color: '#888',
            fontSize: '17px',
            show: true,
          },
          value: {
            formatter: (val: number) => parseInt(val.toString(), 10),
            color: '#111',
            fontSize: '36px',
            show: true,
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#ABE5A1'],
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: 'round',
    },
    labels: ['Average Score'],
  };

  return (
    <div>
      <Chart options={options} series={[score]} type="radialBar" height={350} />
    </div>
  );
};

export default StudentAverageScoreChart;
