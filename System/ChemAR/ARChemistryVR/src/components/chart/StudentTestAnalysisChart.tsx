import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const StudentTestAnalysisChart: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);

  const defaultTestResults = [
    { test: new Date("2023-01-01").toISOString().split("T")[0], correctAnswers: 0 },
    { test: new Date("2023-02-01").toISOString().split("T")[0], correctAnswers: 30 },
  ];

  // Extract correctAnswers and categories (formatted test dates)
  const correctAnswers = testResults.map((result) => result.correctAnswers);
  const categories = testResults.map((result) =>
    result.test
  ); // format Date to locale string

  useEffect(() => {
    const storedTestResults = localStorage.getItem("studentTestAnalysis");
    if (storedTestResults) {
      setTestResults(JSON.parse(storedTestResults));
    } else {
      setTestResults(defaultTestResults);
      localStorage.setItem("studentTestAnalysis", JSON.stringify(defaultTestResults)); // Save default data to localStorage
    }
  }, []);
  // Calculate incorrect answers (100 - correct answers)
  const incorrectAnswers = correctAnswers.map((score) => 100 - score);

  const options: any = {
    series: [
      {
        name: "Correct Answers",
        type: "column",
        data: correctAnswers,
        color: "#00E396", // Green for correct answers
      },
      {
        name: "Incorrect Answers",
        type: "column",
        data: incorrectAnswers,
        color: "#FF4560", // Red for incorrect answers
      },
    ],
    chart: {
      height: 350,
      type: "line",
      stacked: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: [1, 1, 4],
    },
    title: {
      text: "Student Quiz Analysis",
      align: "left",
      offsetX: 110,
    },
    xaxis: {
      categories: categories,
    },
    yaxis: [
      {
        seriesName: "Correct Answers",
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: "#008FFB",
        },
        labels: {
          style: {
            colors: "#008FFB",
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      {
        seriesName: "Incorrect Answers",
        opposite: true,
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: "#00E396",
        },
        labels: {
          style: {
            colors: "#00E396",
          },
        },
        title: {
          text: "Number of Incorrect Answers",
          style: {
            color: "#00E396",
          },
        },
      },
    ],
    tooltip: {
      fixed: {
        enabled: true,
        position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
        offsetY: 30,
        offsetX: 60,
      },
    },
    legend: {
      horizontalAlign: "left",
      offsetX: 40,
    },
  };

  return (
    <div>
      <Chart
        options={options}
        series={options.series}
        type="line"
        height={350}
      />
    </div>
  );
};

export default StudentTestAnalysisChart;
