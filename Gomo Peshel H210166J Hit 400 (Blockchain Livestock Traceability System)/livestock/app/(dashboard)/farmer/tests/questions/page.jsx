"use client";
import React, { useState } from 'react';
import { Table, Button, Drawer, Modal, Form, Input, Select, Badge, Descriptions, Upload, Tag, Space, Typography, Divider, Card, Checkbox } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { Description } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

// Dummy data for questions
const questionsData = [
  { key: '1', id: 'Q1', question: 'What is the capital of Zimbabwe?', category: 'Geography', optionA: 'Harare', optionB: 'Bulawayo', optionC: 'Gweru', answer: 'Harare', isActive: true, imageUrl: '' },
  { key: '2', id: 'Q2', question: 'What is the largest river in Zimbabwe?', category: 'Geography', optionA: 'Zambezi', optionB: 'Limpopo', optionC: 'Save', answer: 'Zambezi', isActive: false, imageUrl: '' },
  // Add more questions
];

const QuestionManagementPage = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [form] = Form.useForm();

  const showDrawer = () => setIsDrawerVisible(true);
  const closeDrawer = () => setIsDrawerVisible(false);
  const showModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const handleEdit = (question) => {
    setCurrentQuestion(question);
    showDrawer();
  };

  const handleView = (question) => {
    setCurrentQuestion(question);
    showModal();
  };

  const handleDelete = (id) => {
    // Implement delete functionality
    console.log('Delete question with id:', id);
  };

  const handleAdd = (values) => {
    // Implement add question functionality
    console.log('Add new question:', values);
    closeModal();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      render: text => <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
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
      render: isActive => <Badge color={isActive ? 'green' : 'red'} text={isActive ? 'Active' : 'Inactive'} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Title level={2}>Manage Questions</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={showModal} style={{ marginBottom: 16 }}>
        Add New Question
      </Button>
      <Table columns={columns} dataSource={questionsData} pagination={{ pageSize: 5 }} />

      {/* Add Question Modal */}
      <Modal
        title="Add New Question"
        visible={isModalVisible}
        onCancel={closeModal}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
        >
          <Form.Item name="question" label="Question" rules={[{ required: true, message: 'Please enter the question' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select a category' }]}>
            <Select placeholder="Select a category">
              <Option value="Geography">Geography</Option>
              <Option value="History">History</Option>
              <Option value="Science">Science</Option>
              {/* Add more categories as needed */}
            </Select>
          </Form.Item>
          <Form.Item name="optionA" label="Option A" rules={[{ required: true, message: 'Please enter option A' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="optionB" label="Option B" rules={[{ required: true, message: 'Please enter option B' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="optionC" label="Option C" rules={[{ required: true, message: 'Please enter option C' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="answer" label="Answer" rules={[{ required: true, message: 'Please select the correct answer' }]}>
            <Select placeholder="Select the correct answer">
              <Option value="A">Option A</Option>
              <Option value="B">Option B</Option>
              <Option value="C">Option C</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Checkbox>Is Active</Checkbox>
          </Form.Item>
          <Form.Item name="imageUrl" label="Upload Image">
            <Upload
              name="image"
              listType="picture"
              beforeUpload={() => false} // Prevent automatic upload
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Add Question</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Question Drawer */}
      <Drawer
        title="Edit Question"
        visible={isDrawerVisible}
        onClose={closeDrawer}
        width={720}
      >
        <Form
          layout="vertical"
          initialValues={currentQuestion}
          onFinish={values => {
            console.log('Edit question values:', values);
            closeDrawer();
          }}
        >
          <Form.Item name="question" label="Question" rules={[{ required: true, message: 'Please enter the question' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select a category' }]}>
            <Select>
              <Option value="Geography">Geography</Option>
              <Option value="History">History</Option>
              <Option value="Science">Science</Option>
              {/* Add more categories as needed */}
            </Select>
          </Form.Item>
          <Form.Item name="optionA" label="Option A" rules={[{ required: true, message: 'Please enter option A' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="optionB" label="Option B" rules={[{ required: true, message: 'Please enter option B' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="optionC" label="Option C" rules={[{ required: true, message: 'Please enter option C' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="answer" label="Answer" rules={[{ required: true, message: 'Please select the correct answer' }]}>
            <Select>
              <Option value="A">Option A</Option>
              <Option value="B">Option B</Option>
              <Option value="C">Option C</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Checkbox>Is Active</Checkbox>
          </Form.Item>
          <Form.Item name="imageUrl" label="Upload Image">
            <Upload
              name="image"
              listType="picture"
              beforeUpload={() => false} // Prevent automatic upload
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Save Changes</Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* View Question Modal */}
      <Modal
        title="View Question"
        visible={!!currentQuestion}
        onCancel={() => setCurrentQuestion(null)}
        footer={null}
        width={720}
      >
        <Descriptions title="Question Details" layout="vertical" column={2}>
          <Descriptions.Item label="Question">{currentQuestion?.question}</Descriptions.Item>
          <Descriptions.Item label="Category">{currentQuestion?.category}</Descriptions.Item>
          <Descriptions.Item label="Option A">{currentQuestion?.optionA}</Descriptions.Item>
          <Descriptions.Item label="Option B">{currentQuestion?.optionB}</Descriptions.Item>
          <Descriptions.Item label="Option C">{currentQuestion?.optionC}</Descriptions.Item>
          <Descriptions.Item label="Answer">{currentQuestion?.answer}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Badge color={currentQuestion?.isActive ? 'green' : 'red'} text={currentQuestion?.isActive ? 'Active' : 'Inactive'} />
          </Descriptions.Item>
          <Descriptions.Item label="Image">
            {currentQuestion?.imageUrl ? (
              <img src={currentQuestion.imageUrl} alt="Question" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }} />
            ) : (
              <span>No image available</span>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      {/* Additional Features */}
      <div style={{ marginTop: 24 }}>
        <Title level={4}>Statistics</Title>
        <Card>
          <p>Total Questions: {questionsData.length}</p>
          <p>Active Questions: {questionsData.filter(q => q.isActive).length}</p>
          <p>Inactive Questions: {questionsData.filter(q => !q.isActive).length}</p>
        </Card>
        <Divider />
        <Title level={4}>Filters</Title>
        <Form layout="inline" onFinish={(values) => console.log('Filter values:', values)}>
          <Form.Item name="category" label="Category">
            <Select placeholder="Select a category" style={{ width: 150 }}>
              <Option value="Geography">Geography</Option>
              <Option value="History">History</Option>
              <Option value="Science">Science</Option>
              {/* Add more categories as needed */}
            </Select>
          </Form.Item>
          <Form.Item name="isActive" label="Active">
            <Select placeholder="Select status" style={{ width: 150 }}>
              <Option value="">All</Option>
              <Option value="true">Active</Option>
              <Option value="false">Inactive</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Apply Filters</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default QuestionManagementPage;

