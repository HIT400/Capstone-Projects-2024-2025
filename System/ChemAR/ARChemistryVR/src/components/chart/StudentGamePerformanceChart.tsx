import React from 'react';
import Chart from 'react-apexcharts';

const generateDateLabels = (numDays: number) => {
  const dates = [];
  const today = new Date();
  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date); // Store as Date objects
  }
  return dates;
};

const StudentGamePerformanceChart: React.FC = () => {
  const numDays = 7;
  const categories = generateDateLabels(numDays);

  const bestPerformance = [95, 85, 90, 92, 88, 96, 91];
  const worstPerformance = [45, 50, 40, 35, 55, 42, 38];
  const averagePerformance = bestPerformance.map((best, index) => (best + worstPerformance[index]) / 2);

  const options: any = {
    series: [
      {
        name: 'Best Performance',
        type: 'line',
        data: bestPerformance,
        color: '#00E396',
      },
      {
        name: 'Worst Performance',
        type: 'line',
        data: worstPerformance,
        color: '#FF4560',
      },
      {
        name: 'Average Performance',
        type: 'line',
        data: averagePerformance,
        color: '#008FFB',
        stroke: {
          dashArray: 5,
        },
      },
    ],
    chart: {
      height: 350,
      type: 'line',
    },
    stroke: {
      width: [2, 2, 3],
      dashArray: [0, 0, 5], // Dashed line for the average
    },
    title: {
      text: 'Daily Student DND Game Performance',
      align: 'left',
    },
    xaxis: {
      categories: categories.map(date => date.getTime()), // Convert Date objects to timestamps (milliseconds)
      title: {
        text: 'Date',
      },
      labels: {
        formatter: function (value: any) {
          const date = new Date(value);
          return date.toLocaleDateString(); // Format as MM/DD/YYYY
        },
      },
    },
    yaxis: {
      title: {
        text: 'Score',
      },
    },
    legend: {
      position: 'top',
    },
  };

  return (
    <div>
      <Chart options={options} series={options.series} type="line" height={350} />
    </div>
  );
};

export default StudentGamePerformanceChart;
