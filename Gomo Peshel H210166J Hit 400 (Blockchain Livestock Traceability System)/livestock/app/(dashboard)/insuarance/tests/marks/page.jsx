"use client";
import React, { useState } from 'react';
import { Table, Input, Button, DatePicker, Select, Space, Typography, Card } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Line } from '@ant-design/charts';
import Link from 'next/link';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Dummy data
const marksHistoryData = [
  { key: '1', name: 'John Doe', id: '123', date: '2024-08-01', category: 'Theory', marks: 85 },
  { key: '2', name: 'Jane Smith', id: '124', date: '2024-08-02', category: 'Practical', marks: 90 },
  { key: '3', name: 'Emily Johnson', id: '125', date: '2024-08-03', category: 'Theory', marks: 78 },
  { key: '4', name: 'Michael Brown', id: '126', date: '2024-08-04', category: 'Practical', marks: 88 },
  { key: '5', name: 'Sarah Davis', id: '127', date: '2024-08-05', category: 'Theory', marks: 92 },
  // Add more records as needed
];

const HistoryPage = () => {
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [category, setCategory] = useState('All');

  // Filtered data
  const filteredData = marksHistoryData.filter(record => {
    const matchText = record.name.toLowerCase().includes(searchText.toLowerCase());
    const matchDate = !dateRange[0] || !dateRange[1]
      || (dayjs(record.date).isBetween(dateRange[0], dateRange[1], null, '[]'));
    const matchCategory = category === 'All' || record.category === category;
    return matchText && matchDate && matchCategory;
  });

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link href={`/students/${record.id}`}>{text}</Link>,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
    },
  ];

  // Example data for analytics
  const analyticsData = [
    { month: 'Jan', count: 120 },
    { month: 'Feb', count: 135 },
    { month: 'Mar', count: 140 },
    { month: 'Apr', count: 155 },
    // Add more data as needed
  ];

  const lineConfig = {
    data: analyticsData,
    xField: 'month',
    yField: 'count',
    point: {
      size: 5,
      shape: 'diamond',
    },
  };

  return (
    <div className="p-4">
      <Title level={2}>Student Marks History</Title>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card>
          <Space>
            <Input
              placeholder="Search by name or ID"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              suffix={<SearchOutlined />}
            />
            <RangePicker
              format="YYYY-MM-DD"
              onChange={(dates) => setDateRange(dates)}
              value={dateRange}
            />
            <Select
              defaultValue="All"
              onChange={(value) => setCategory(value)}
              style={{ width: 120 }}
            >
              <Option value="All">All Categories</Option>
              <Option value="Theory">Theory</Option>
              <Option value="Practical">Practical</Option>
            </Select>
            <Button icon={<DownloadOutlined />} type="primary">Export</Button>
          </Space>
        </Card>
        <Card>
          <Line {...lineConfig} />
        </Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 5 }}
        />
      </Space>
    </div>
  );
};

export default HistoryPage;
