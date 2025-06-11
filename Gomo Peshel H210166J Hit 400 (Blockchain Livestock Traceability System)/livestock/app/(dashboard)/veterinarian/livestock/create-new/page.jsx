"use client";
import React, { useState } from "react";
import { Form, Input, Select, DatePicker, Button, Upload, message, Card, Row, Col, notification } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import pb from "@/lib/connection";

const { Option } = Select;
const { TextArea } = Input;

export default function AddLivestockForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append all form values
      Object.keys(values).forEach(key => {
        if (key === 'dateOfBirth') {
          formData.append(key, values[key].format('YYYY-MM-DD'));
        } else if (key !== 'image') {
          formData.append(key, values[key]);
        }
      });

      // Append image file if exists
      if (values.image && values.image[0]?.originFileObj) {
        formData.append('image', values.image[0].originFileObj);
      }

      // Add owner_id
      formData.append('owner_id', pb.authStore.model?.id || "");

      // Create record with form data
      const record = await pb.collection('livestock').create(formData);
      
      notification.success({
        message: "Success",
        description: "Livestock added successfully!",
      });
      form.resetFields();
      setFileList([]);
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent automatic upload
  };

  return (
    <Card title="Add New Livestock" className="w-full mx-auto shadow-lg">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ healthStatus: "Healthy" }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter the livestock name" }]}
            >
              <Input size="large" placeholder="Enter livestock name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Breed"
              name="breed"
              rules={[{ required: true, message: "Please enter the breed" }]}
            >
              <Input size="large" placeholder="Enter breed" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Type of Livestock"
              name="typeOfLivestock"
              rules={[{ required: true, message: "Please select the type" }]}
            >
              <Select size="large" placeholder="Select type">
                <Option value="Cattle">Cattle</Option>
                <Option value="Sheep">Sheep</Option>
                <Option value="Goat">Goat</Option>
                <Option value="Pig">Pig</Option>
                <Option value="Poultry">Poultry</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Color" name="color">
              <Input size="large" placeholder="Enter color" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Health Status" name="healthStatus">
              <Select size="large" placeholder="Select health status">
                <Option value="Healthy">Healthy</Option>
                <Option value="Sick">Sick</Option>
                <Option value="Under Treatment">Under Treatment</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Date of Birth"
              name="dateOfBirth"
              rules={[{ required: true, message: "Please select the date of birth" }]}
            >
              <DatePicker 
                size="large" 
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="RFID Tag"
              name="RFID_Tag"
              rules={[{ required: true, message: "Please enter the RFID Tag" }]}
            >
              <Input size="large" placeholder="Enter RFID Tag" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Image (Optional)"
              name="image"
              valuePropName="fileList"
              getValueFromEvent={(e) => e.fileList}
            >
              <Upload
                beforeUpload={beforeUpload}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                listType="picture"
                accept="image/*"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />} size="large">
                  Upload Image
                </Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Additional Notes" name="notes">
          <TextArea rows={4} placeholder="Enter any additional notes" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? "Adding Livestock..." : "Add Livestock"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}