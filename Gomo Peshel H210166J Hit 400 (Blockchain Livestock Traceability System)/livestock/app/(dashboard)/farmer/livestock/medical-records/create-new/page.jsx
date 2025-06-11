"use client";
import React, { useState } from "react";
import { Form, Input, Select, DatePicker, Button, Upload, message, Card, Row, Col, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import pb from "@/lib/connection";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const AddMedicalRecordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const router = useRouter();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Append all form values
      Object.keys(values).forEach((key) => {
        if (key === "examination_date") {
          formData.append(key, values[key].format("YYYY-MM-DDTHH:mm:ss"));
        } else if (key !== "image") {
          formData.append(key, values[key]);
        }
      });

      // Append image file if exists
      if (values.image && values.image[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      // Add veterinarian_id (current user)
      formData.append("veterinarian_id", pb.authStore.model?.id || "");

      // Create record in PocketBase
      const record = await pb.collection("Medical_Records").create(formData);

      message.success("Medical record added successfully!");
      form.resetFields();
      setFileList([]);
      router.push("/farmer/medical-records"); // Redirect to medical records page
    } catch (error) {
      message.error(`Error: ${error.message}`);
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
    <div className="p-6">
      <Card title="Add New Medical Record" className="w-full mx-auto shadow-lg">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: "Pending" }}
        >
          <Row gutter={16}>
            {/* Livestock ID */}
            <Col span={12}>
              <Form.Item
                label="Livestock"
                name="livestock_id"
                rules={[{ required: true, message: "Please select the livestock" }]}
              >
                <Input size="large" placeholder="Enter Livestock ID" />
              </Form.Item>
            </Col>

            {/* Examination Date */}
            <Col span={12}>
              <Form.Item
                label="Examination Date"
                name="examination_date"
                rules={[{ required: true, message: "Please select the examination date" }]}
              >
                <DatePicker
                  size="large"
                  style={{ width: "100%" }}
                  showTime={{ format: "HH:mm" }}
                  format="MMMM D, YYYY h:mm A"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* Weight */}
            <Col span={12}>
              <Form.Item
                label="Weight (kg)"
                name="weight"
                rules={[{ required: true, message: "Please enter the weight" }]}
              >
                <Input type="number" size="large" placeholder="Enter weight" />
              </Form.Item>
            </Col>

            {/* Status */}
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select the status" }]}
              >
                <Select size="large" placeholder="Select status">
                  <Option value="Pending">Pending</Option>
                  <Option value="Ongoing">Ongoing</Option>
                  <Option value="Completed">Completed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Treatment Details */}
          <Form.Item
            label="Treatment Details"
            name="treatment_details"
            rules={[{ required: true, message: "Please enter treatment details" }]}
          >
            <TextArea rows={4} placeholder="Enter treatment details" />
          </Form.Item>

          {/* Notes */}
          <Form.Item label="Notes" name="notes">
            <TextArea rows={2} placeholder="Enter additional notes" />
          </Form.Item>

          {/* Image Upload */}
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

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Adding Record..." : "Add Medical Record"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddMedicalRecordPage;