"use client";
import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Card, Space, Badge, Typography, Popconfirm, Checkbox, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, ShareAltOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/charts';

const { Option } = Select;
const { Title } = Typography;

// Dummy data
const questionsData = [
  { key: '1', id: '1', question: 'What is the capital of Zimbabwe?', category: 'Geography', optionA: 'Harare', optionB: 'Bulawayo', optionC: 'Gweru', answer: 'Harare', isActive: true },
  { key: '2', id: '2', question: 'Which is the largest city in Zimbabwe?', category: 'Geography', optionA: 'Harare', optionB: 'Bulawayo', optionC: 'Gweru', answer: 'Bulawayo', isActive: true },
  { key: '3', id: '3', question: 'Who is the current President of Zimbabwe?', category: 'Politics', optionA: 'Robert Mugabe', optionB: 'Emmerson Mnangagwa', optionC: 'Morgan Tsvangirai', answer: 'Emmerson Mnangagwa', isActive: false },
  // Add more questions
];

const ManageTestsPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [form] = Form.useForm();
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleCreateTest = () => {
    setShowCreateModal(true);
  };

  const handleSelectQuestions = () => {
    setShowSelectModal(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      console.log('Test Created:', values);
      setShowCreateModal(false);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    setShowCreateModal(false);
    setShowSelectModal(false);
    setIsModalVisible(false);
  };

  const handleEdit = (record) => {
    setSelectedQuestion(record);
    form.setFieldsValue(record);
    setIsEdit(true);
    setIsModalVisible(true);
  };

  const handleDelete = (key) => {
    console.log('Deleted:', key);
  };

  const handleShare = (link) => {
    console.log('Shared Link:', link);
  };

  const handleTableChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const columns = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Options',
      dataIndex: 'options',
      key: 'options',
      render: (text, record) => (
        <div>
          <p>A: {record.optionA}</p>
          <p>B: {record.optionB}</p>
          <p>C: {record.optionC}</p>
        </div>
      ),
    },
    {
      title: 'Answer',
      dataIndex: 'answer',
      key: 'answer',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: isActive => (
        <Badge color={isActive ? 'green' : 'red'} text={isActive ? 'Active' : 'Inactive'} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm title="Are you sure to delete this question?" onConfirm={() => handleDelete(record.key)}>
            <Button icon={<DeleteOutlined />} type="danger">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Dummy data for statistics
  const statsData = [
    { category: 'Geography', count: 10 },
    { category: 'Politics', count: 5 },
    // Add more stats
  ];

  const lineConfig = {
    data: statsData,
    xField: 'category',
    yField: 'count',
    point: {
      size: 5,
      shape: 'diamond',
    },
  };

  return (
    <div className="p-4">
      <Title level={2}>Manage Tests</Title>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTest}>Create Test</Button>
          <Button icon={<ShareAltOutlined />} onClick={() => handleShare('https://test-link.com')}>Share Test</Button>
        </Space>
        <Card>
          <Line {...lineConfig} />
        </Card>
        <Table
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedRowKeys,
            onChange: handleTableChange,
          }}
          columns={columns}
          dataSource={questionsData}
          pagination={{ pageSize: 5 }}
        />
        <Modal
          title={isEdit ? 'Edit Question' : 'Add New Question'}
          visible={isModalVisible}
          onOk={() => form.submit()}
          onCancel={handleCancel}
          okText={isEdit ? 'Update' : 'Create'}
        >
          <Form form={form} layout="vertical" onFinish={values => {
            console.log('Form Values:', values);
            setIsModalVisible(false);
          }}>
            <Form.Item name="question" label="Question" rules={[{ required: true, message: 'Please enter the question!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select a category!' }]}>
              <Select>
                <Option value="Geography">Geography</Option>
                <Option value="Politics">Politics</Option>
                {/* Add more categories */}
              </Select>
            </Form.Item>
            <Form.Item name="optionA" label="Option A" rules={[{ required: true, message: 'Please enter option A!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="optionB" label="Option B" rules={[{ required: true, message: 'Please enter option B!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="optionC" label="Option C" rules={[{ required: true, message: 'Please enter option C!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="answer" label="Answer" rules={[{ required: true, message: 'Please select the correct answer!' }]}>
              <Select>
                <Option value="optionA">Option A</Option>
                <Option value="optionB">Option B</Option>
                <Option value="optionC">Option C</Option>
              </Select>
            </Form.Item>
            <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
              <Checkbox>Active</Checkbox>
            </Form.Item>
            <Form.Item name="imageUrl" label="Image">
              <Upload
                name="image"
                showUploadList={false}
                action="/upload"
                listType="picture-card"
                onChange={info => {
                  if (info.file.status === 'done') {
                    console.log(`${info.file.name} file uploaded successfully`);
                  } else if (info.file.status === 'error') {
                    console.log(`${info.file.name} file upload failed.`);
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Create Test"
          visible={showCreateModal}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form layout="vertical">
            <Form.Item name="testName" label="Test Name" rules={[{ required: true, message: 'Please enter the test name!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Select Questions"
          visible={showSelectModal}
          onOk={() => {
            console.log('Selected Questions:', selectedQuestions);
            setShowSelectModal(false);
          }}
          onCancel={handleCancel}
        >
          <Table
            rowSelection={{
              type: 'checkbox',
              onChange: (selectedRowKeys) => setSelectedQuestions(selectedRowKeys),
            }}
            columns={columns}
            dataSource={questionsData}
            pagination={{ pageSize: 5 }}
          />
        </Modal>
      </Space>
    </div>
  );
};

export default ManageTestsPage;
