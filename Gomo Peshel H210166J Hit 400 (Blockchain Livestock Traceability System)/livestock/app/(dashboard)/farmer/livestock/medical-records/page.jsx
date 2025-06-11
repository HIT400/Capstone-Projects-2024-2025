"use client";
import React, { useState, useEffect } from "react";
import { Table, Input, Button, Tag, Space, Image, Spin, Modal, Form, Card, Row, Col, Descriptions, Select, DatePicker } from "antd";
import { SearchOutlined, PlusOutlined, EyeOutlined, FilterOutlined, FileTextOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import pb from "@/lib/connection";
import dayjs from "dayjs"; // Import dayjs for date formatting
import { Option } from "antd/es/mentions";

const { Search } = Input;
const { RangePicker } = DatePicker;

const MedicalRecordsPage = () => {
  const router = useRouter();
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        const records = await pb.collection('Medical_Records').getFullList({
          sort: '-created',
          expand: 'livestock_id,veterinarian_id'
        });
        setMedicalRecords(records);
        setFilteredRecords(records);
      } catch (error) {
        console.error('Error fetching medical records:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicalRecords();
  }, []);

  useEffect(() => {
    let filtered = medicalRecords.filter(record => {
      const matchesSearch = Object.values(record).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesDate = !dateFilter || (
        dayjs(record.examination_date).isAfter(dayjs(dateFilter[0])) &&
        dayjs(record.examination_date).isBefore(dayjs(dateFilter[1]))
      );
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      return matchesSearch && matchesDate && matchesStatus;
    });
    setFilteredRecords(filtered);
  }, [searchTerm, dateFilter, statusFilter, medicalRecords]);

  const columns = [
    {
      title: 'Livestock',
      dataIndex: 'livestock_id',
      key: 'livestock_id',
      render: (_, record) => record.expand?.livestock_id?.name || 'Unknown',
    },
    {
      title: 'Veterinarian',
      dataIndex: 'veterinarian_id',
      key: 'veterinarian_id',
      render: (_, record) => record.expand?.veterinarian_id?.name || 'Unknown',
    },
    {
      title: 'Examination Date',
      dataIndex: 'examination_date',
      key: 'examination_date',
      render: (date) => {
        if (!date) return 'N/A'; // Fallback for missing dates
        return dayjs(date).format('MMMM D, YYYY h:mm A'); // Format: "February 27, 2025 12:00 PM"
      },
    },
    {
      title: 'Weight (kg)',
      dataIndex: 'weight',
      key: 'weight',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Completed' ? 'green' : status === 'Ongoing' ? 'blue' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => router.push(`/farmer/medical-record/${record.id}`)}
          >
            View
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    Modal.info({
      title: 'Medical Record Details',
      width: 800,
      content: (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Livestock">
            {record.expand?.livestock_id?.name || 'Unknown'}
            {record.expand?.livestock_id?.RFID_Tag && (
              <div className="text-gray-500">RFID: {record.expand.livestock_id.RFID_Tag}</div>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Veterinarian">
            {record.expand?.veterinarian_id?.name || 'Unknown'}
            {record.expand?.veterinarian_id?.email && (
              <div className="text-gray-500">{record.expand.veterinarian_id.email}</div>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Examination Date">
            {record.examination_date ? dayjs(record.examination_date).format('MMMM D, YYYY h:mm A') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Weight">{record.weight} kg</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={record.status === 'Completed' ? 'green' : 'red'}>{record.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Treatment Details" span={2}>
            {record.treatment_details || 'No details available'}
          </Descriptions.Item>
          <Descriptions.Item label="Notes" span={2}>
            {record.notes || 'No additional notes'}
          </Descriptions.Item>
          <Descriptions.Item label="Image" span={2}>
            {record.image ? (
              <Image
                src={pb.getFileUrl(record, record.image)}
                width={200}
                className="rounded-lg"
                alt="Medical record"
              />
            ) : (
              'No image available'
            )}
          </Descriptions.Item>
        </Descriptions>
      ),
    });
  };

  return (
    <div className="p-6">
      <Card
        title="Medical Records"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/farmer/medical-record/create-new')}
          >
            New Record
          </Button>
        }
      >
        <Row gutter={16} className="mb-4">
          <Col span={8}>
            <Search
              placeholder="Search records..."
              prefix={<SearchOutlined />}
              allowClear
              onSearch={setSearchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => setDateFilter(dates)}
            />
          </Col>
          <Col span={8}>
            <Select
              defaultValue="all"
              style={{ width: '100%' }}
              onChange={(value) => setStatusFilter(value)}
            >
              <Option value="all">All Statuses</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Ongoing">Ongoing</Option>
              <Option value="Pending">Pending</Option>
            </Select>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredRecords}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default MedicalRecordsPage;