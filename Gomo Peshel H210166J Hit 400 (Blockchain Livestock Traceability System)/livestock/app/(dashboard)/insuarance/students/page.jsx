"use client"
import React, { useState } from 'react';
import { Table, Badge, Input, Button, DatePicker, Select, Space, Typography, Card, Tabs } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { Line, Column } from '@ant-design/charts';
import dayjs from 'dayjs';
import Link from 'next/link';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// Dummy data
const studentData = [
  { key: '1', name: 'Tendai Moyo', id: '001', enrollmentDate: '2023-01-15', lessons: 10, status: 'Active', phone: '0771234567', email: 'tendai.moyo@example.com' },
  { key: '2', name: 'Chipo Nyathi', id: '002', enrollmentDate: '2023-02-20', lessons: 15, status: 'Active', phone: '0777654321', email: 'chipo.nyathi@example.com' },
  { key: '3', name: 'Simba Chirwa', id: '003', enrollmentDate: '2023-03-05', lessons: 8, status: 'Inactive', phone: '0781234567', email: 'simba.chirwa@example.com' },
  { key: '4', name: 'Rumbidzai Mhlanga', id: '004', enrollmentDate: '2023-04-12', lessons: 20, status: 'Active', phone: '0772345678', email: 'rumbidzai.mhlanga@example.com' },
  { key: '5', name: 'Tafadzwa Dube', id: '005', enrollmentDate: '2023-05-22', lessons: 12, status: 'Active', phone: '0782345678', email: 'tafadzwa.dube@example.com' },
  { key: '6', name: 'Kudzai Moyo', id: '006', enrollmentDate: '2023-06-10', lessons: 9, status: 'Inactive', phone: '0773456789', email: 'kudzai.moyo@example.com' },
  { key: '7', name: 'Pamela Zulu', id: '007', enrollmentDate: '2023-07-17', lessons: 13, status: 'Active', phone: '0783456789', email: 'pamela.zulu@example.com' },
  { key: '8', name: 'Farai Maposa', id: '008', enrollmentDate: '2023-08-25', lessons: 11, status: 'Active', phone: '0774567890', email: 'farai.maposa@example.com' },
  { key: '9', name: 'Kudakwashe Tanyanyiwa', id: '009', enrollmentDate: '2023-09-05', lessons: 14, status: 'Inactive', phone: '0784567890', email: 'kudakwashe.tanyanyiwa@example.com' },
  { key: '10', name: 'Blessing Moyo', id: '010', enrollmentDate: '2023-10-12', lessons: 7, status: 'Active', phone: '0775678901', email: 'blessing.moyo@example.com' },
  // Add more student records up to 20
];

const StudentsPage = () => {
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [status, setStatus] = useState('All');

  // Filtered data
  const filteredData = studentData.filter(student => {
    const matchText = student.name.toLowerCase().includes(searchText.toLowerCase());
    const matchDate = !dateRange[0] || !dateRange[1]
      || (dayjs(student.enrollmentDate).isBetween(dateRange[0], dateRange[1], null, '[]'));
    const matchStatus = status === 'All' || student.status === status;
    return matchText && matchDate && matchStatus;
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link href={`/school/students/${record.id}`}>{text}</Link>,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Enrollment Date',
      dataIndex: 'enrollmentDate',
      key: 'enrollmentDate',
    },
    {
      title: 'Lessons',
      dataIndex: 'lessons',
      key: 'lessons',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge color={status === 'Active' ? 'green' : 'red'} text={status} />
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
  ];

  // Example data for analytics
  const analyticsData = [
    { month: 'Jan', count: 30 },
    { month: 'Feb', count: 40 },
    { month: 'Mar', count: 25 },
    { month: 'Apr', count: 35 },
    { month: 'May', count: 45 },
    // Add more data
  ];

  const barData = [
    { category: 'Theory', count: 120 },
    { category: 'Practical', count: 80 },
    // Add more data
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

  const barConfig = {
    data: barData,
    xField: 'category',
    yField: 'count',
    seriesField: 'category',
  };

  return (
    <div className="p-4">
      <Title level={2}>Student Overview</Title>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card>
          <Space>
            <Input
              placeholder="Search by name"
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
              onChange={(value) => setStatus(value)}
              style={{ width: 120 }}
            >
              <Option value="All">All Status</Option>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
            <Button icon={<DownloadOutlined />} type="primary">Export</Button>
          </Space>
        </Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Enrolled" key="1">
            <Table
              columns={columns}
              dataSource={filteredData}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          <TabPane tab="Applications" key="2">
            {/* Placeholder for Application Table */}
            <Table
              columns={columns}
              dataSource={filteredData}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
        </Tabs>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <Line {...lineConfig} />
          </Card>
          <Card>
            <Column {...barConfig} />
          </Card>
        </div>
      </Space>
    </div>
  );
};

export default StudentsPage;
