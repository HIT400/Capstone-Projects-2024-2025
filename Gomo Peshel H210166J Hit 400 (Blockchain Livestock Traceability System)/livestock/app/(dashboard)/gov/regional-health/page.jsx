"use client";
import React, { useEffect, useState } from 'react';
import { Card, Table, Descriptions, Tag, Progress, Spin, Alert } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, WarningOutlined, CloudOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Column } = Table;

// Zimbabwe provinces
const provinces = [
  'Harare', 'Bulawayo', 'Manicaland', 'Mashonaland Central', 'Mashonaland East',
  'Mashonaland West', 'Masvingo', 'Matabeleland North', 'Matabeleland South', 'Midlands',
];

// Mock data for regional health status
const regionalHealthData = provinces.map((province, index) => ({
  key: index + 1,
  province,
  livestockPopulation: Math.floor(Math.random() * 100000) + 50000,
  vaccinationCoverage: Math.floor(Math.random() * 100),
  diseaseOutbreaks: Math.floor(Math.random() * 10),
  status: Math.random() > 0.5 ? 'Stable' : 'At Risk',
}));

const RegionalHealthPage = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch weather data for Harare (default region)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = '919cf60a75693678347b0717fe71c0e9'; // Replace with your API key
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=Harare,ZW&units=metric&appid=${apiKey}`
        );
        setWeatherData(response.data);
      } catch (err) {
        setError('Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // Current region data (mock)
  const currentRegion = {
    name: 'Harare',
    livestockPopulation: 120000,
    vaccinationCoverage: 85,
    diseaseOutbreaks: 2,
    mandatoryVaccinations: [
      { name: 'Foot and Mouth Disease', dueDate: '2023-12-15' },
      { name: 'Anthrax', dueDate: '2024-01-10' },
    ],
    status: 'Stable',
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Regional Health Dashboard</h1>

      {/* Current Region Status */}
      <Card title="Current Region Status" className="shadow-sm">
        <Descriptions bordered>
          <Descriptions.Item label="Region" span={3}>
            <Tag icon={<EnvironmentOutlined />} color="blue">
              {currentRegion.name}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Livestock Population">
            {currentRegion.livestockPopulation.toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Vaccination Coverage">
            <Progress percent={currentRegion.vaccinationCoverage} status="active" />
          </Descriptions.Item>
          <Descriptions.Item label="Disease Outbreaks">
            <Tag icon={<WarningOutlined />} color="red">
              {currentRegion.diseaseOutbreaks} Active
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Overall Status">
            <Tag color={currentRegion.status === 'Stable' ? 'green' : 'red'}>
              {currentRegion.status}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Mandatory Vaccinations</h3>
          {currentRegion.mandatoryVaccinations.map((vaccine, index) => (
            <Card key={index} className="mb-2">
              <div className="flex justify-between items-center">
                <span>{vaccine.name}</span>
                <Tag icon={<CalendarOutlined />} color="purple">
                  Due: {vaccine.dueDate}
                </Tag>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Weather Data */}
      <Card title="Weather Forecast" className="shadow-sm">
        {loading ? (
          <Spin tip="Fetching weather data..." />
        ) : error ? (
          <Alert message={error} type="error" />
        ) : (
          weatherData && (
            <div className="flex items-center space-x-4">
              <CloudOutlined className="text-2xl" />
              <div>
                <p className="text-lg">
                  {weatherData.name}, {weatherData.sys.country}
                </p>
                <p className="text-gray-600">
                  Temperature: {weatherData.main.temp}°C
                </p>
                <p className="text-gray-600">
                  Weather: {weatherData.weather[0].description}
                </p>
              </div>
            </div>
          )
        )}
      </Card>

      {/* Other Region Health Status */}
      <Card title="Other Region Health Status" className="shadow-sm">
        <Table dataSource={regionalHealthData} pagination={false}>
          <Column title="Province" dataIndex="province" key="province" />
          <Column
            title="Livestock Population"
            dataIndex="livestockPopulation"
            key="livestockPopulation"
            render={(value) => value.toLocaleString()}
          />
          <Column
            title="Vaccination Coverage"
            dataIndex="vaccinationCoverage"
            key="vaccinationCoverage"
            render={(value) => <Progress percent={value} status="active" />}
          />
          <Column
            title="Disease Outbreaks"
            dataIndex="diseaseOutbreaks"
            key="diseaseOutbreaks"
            render={(value) => (
              <Tag icon={<WarningOutlined />} color={value > 5 ? 'red' : 'orange'}>
                {value} Active
              </Tag>
            )}
          />
          <Column
            title="Status"
            dataIndex="status"
            key="status"
            render={(status) => (
              <Tag color={status === 'Stable' ? 'green' : 'red'}>{status}</Tag>
            )}
          />
        </Table>
      </Card>
    </div>
  );
};

export default RegionalHealthPage;