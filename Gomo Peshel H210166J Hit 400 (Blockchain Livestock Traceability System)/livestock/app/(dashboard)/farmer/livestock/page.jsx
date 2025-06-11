"use client";
import React, { useState, useEffect } from "react";
import { Table, Input, Button, Drawer, Tag, Space, Image, Spin, Modal, Form, Card, Row, Col, Descriptions, Select, QRCode } from "antd";
import { SearchOutlined, PlusOutlined, EyeOutlined, MedicineBoxOutlined, ScanOutlined, SyncOutlined, FilePdfOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import pb from "@/lib/connection";
import { Option } from "antd/es/mentions";
import Link from "next/link";

const { Search } = Input;

const ViewLivestockPage = () => {
  const router = useRouter();
  const [livestockData, setLivestockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedLivestock, setSelectedLivestock] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [certificateVisible, setCertificateVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [healthFilter, setHealthFilter] = useState("all");

  // Fetch livestock data from PocketBase
  useEffect(() => {
    const fetchLivestock = async () => {
      try {
        const records = await pb.collection('livestock').getFullList({
          sort: '-created',
          expand: 'owner_id'
        });
        setLivestockData(records);
        setFilteredData(records);
      } catch (error) {
        console.error('Error fetching livestock:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLivestock();
  }, []);

  // Filter and search handler
  useEffect(() => {
    let filtered = livestockData.filter(item => {
      const matchesSearch = Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesHealth = healthFilter === 'all' || item.HealthStatus === healthFilter;
      return matchesSearch && matchesHealth;
    });
    setFilteredData(filtered);
  }, [searchTerm, healthFilter, livestockData]);

  const columns = [
    {
      title: 'RFID Tag',
      dataIndex: 'RFID_Tag',
      key: 'RFID_Tag',
      sorter: (a, b) => a.RFID_Tag.localeCompare(b.RFID_Tag),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-2">
          {record.image && (
            <Image
              src={pb.getFileUrl(record, record.image)}
              width={40}
              height={40}
              className="rounded-full"
              preview={false}
            />
          )}
          {text}
        </div>
      ),
    },
    {
      title: 'Breed',
      dataIndex: 'breed',
      key: 'breed',
    },
    {
      title: 'Type',
      dataIndex: 'typeOfLivestock',
      key: 'typeOfLivestock',
    },
    {
      title: 'Health Status',
      dataIndex: 'HealthStatus',
      key: 'HealthStatus',
      render: (status) => (
        <Tag color={status === 'Healthy' ? 'green' : 'red'}>{status}</Tag>
      ),
      filters: [
        { text: 'Healthy', value: 'Healthy' },
        { text: 'Sick', value: 'Sick' },
      ],
      onFilter: (value, record) => record.HealthStatus === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDrawer(record)}
          >
            Details
          </Button>
          <Button
            type="link"
            icon={<MedicineBoxOutlined />}
            onClick={() => router.push(`/farmer/medical-record?livestock-id=${record.id}`)}
          >
            Medical
          </Button>
          <Button
            type="link"
            icon={<SyncOutlined />}
            onClick={() => handleTransferOwnership(record.id)}
          >
            Transfer
          </Button>
          <Button
            type="link"
            icon={<FilePdfOutlined />}
            onClick={() => handleGenerateCertificate(record)}
          >
            Certificate
          </Button>
        </Space>
      ),
    },
  ];

  const showDrawer = (record) => {
    setSelectedLivestock(record);
    setDrawerVisible(true);
  };

  const handleScan = async (values) => {
    try {
      const record = await pb.collection('livestock').getFirstListItem(`RFID_Tag="${values.tag}"`);
      showDrawer(record);
      setScanModalVisible(false);
    } catch (error) {
      Modal.error({
        title: 'Livestock Not Found',
        content: 'No animal found with this RFID tag',
      });
    }
  };

  const handleTransferOwnership = (livestockId) => {
    Modal.confirm({
      title: 'Transfer Ownership',
      content: (
        <Form layout="vertical">
          <Form.Item label="New Owner ID" name="newOwner" rules={[{ required: true }]}>
            <Input placeholder="Enter new owner's ID" />
          </Form.Item>
        </Form>
      ),
      onOk: async (values) => {
        try {
          await pb.collection('livestock').update(livestockId, {
            owner_id: values.newOwner
          });
          message.success('Ownership transferred successfully');
        } catch (error) {
          message.error('Transfer failed: ' + error.message);
        }
      },
    });
  };

  const handleGenerateCertificate = (record) => {
    setSelectedLivestock(record);
    setCertificateVisible(true);
  };

  return (
    <div className="p-6">
      <Card
        title="Livestock Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/farmer/livestock/create-new')}
          >
            Add New Livestock
          </Button>
        }
      >
        <Row gutter={16} className="mb-4">
          <Col span={8}>
            <Search
              placeholder="Search livestock..."
              prefix={<SearchOutlined />}
              allowClear
              onSearch={setSearchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col span={8}>
            <Button
              icon={<ScanOutlined />}
              onClick={() => setScanModalVisible(true)}
            >
              Scan RFID Tag
            </Button>
          </Col>
          <Col span={8}>
            <Select
              defaultValue="all"
              style={{ width: '100%' }}
              onChange={(value) => setHealthFilter(value)}
            >
              <Option value="all">All Health Statuses</Option>
              <Option value="Healthy">Healthy</Option>
              <Option value="Sick">Sick</Option>
            </Select>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      {/* Scan Modal */}
      <Modal
        title="Scan RFID Tag"
        visible={scanModalVisible}
        onCancel={() => setScanModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleScan}>
          <Form.Item
            label="RFID Tag"
            name="tag"
            rules={[{ required: true, message: 'Please scan or enter RFID tag' }]}
          >
            <Input placeholder="Scan tag or enter manually" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Search
          </Button>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title="Livestock Details"
        width="70%"
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedLivestock && (
          <Row gutter={16}>
            <Col span={8}>
              <Image
                src={pb.getFileUrl(selectedLivestock, selectedLivestock.image)}
                className="rounded-lg"
              />
            </Col>
            <Col span={16}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="RFID Tag">{selectedLivestock.RFID_Tag}</Descriptions.Item>
                <Descriptions.Item label="Name">{selectedLivestock.name}</Descriptions.Item>
                <Descriptions.Item label="Breed">{selectedLivestock.breed}</Descriptions.Item>
                <Descriptions.Item label="Type">{selectedLivestock.typeOfLivestock}</Descriptions.Item>
                <Descriptions.Item label="Color">{selectedLivestock.color}</Descriptions.Item>
                <Descriptions.Item label="Date of Birth">
                  {new Date(selectedLivestock.dateOfBirth).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Owner">
                  {selectedLivestock.expand?.owner_id?.name || selectedLivestock.owner_id}
                </Descriptions.Item>
                <Descriptions.Item label="Health Status">
                  <Tag color={selectedLivestock.HealthStatus === 'Healthy' ? 'green' : 'red'}>
                    {selectedLivestock.HealthStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Vaccination Status">
                  {selectedLivestock.vaccinationStatus || 'Not Available'}
                </Descriptions.Item>
                <Descriptions.Item label="Last Vet Visit">
                  {selectedLivestock.lastVetVisit || 'Not Available'}
                </Descriptions.Item>
                <Descriptions.Item label="Weight">
                  {selectedLivestock.weight ? `${selectedLivestock.weight} kg` : 'Not Available'}
                </Descriptions.Item>
                <Descriptions.Item label="Notes">{selectedLivestock.notes}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        )}
      </Drawer>

      {/* Certificate Modal */}
      <Modal
        title="Health Certificate"
        visible={certificateVisible}
        onCancel={() => setCertificateVisible(false)}
        footer={null}
        width={800}
      >
        {selectedLivestock && (
          <div className="p-4 border rounded-lg">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Livestock Health Certificate</h2>
              <p className="text-gray-500">Issued on {new Date().toLocaleDateString()}</p>
            </div>

            <Row gutter={16} className="mb-4">
              <Col span={12}>
                <Descriptions column={1}>
                  <Descriptions.Item label="RFID Tag">{selectedLivestock.RFID_Tag}</Descriptions.Item>
                  <Descriptions.Item label="Name">{selectedLivestock.name}</Descriptions.Item>
                  <Descriptions.Item label="Breed">{selectedLivestock.breed}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions column={1}>
                  <Descriptions.Item label="Health Status">
                    <Tag color={selectedLivestock.HealthStatus === 'Healthy' ? 'green' : 'red'}>
                      {selectedLivestock.HealthStatus}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Owner">
                    {selectedLivestock.expand?.owner_id?.name || selectedLivestock.owner_id}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <div className="text-center my-6">
              <QRCode
                value={`${window.location.origin}/verify-certificate?livestockId=${selectedLivestock.id}`}
                icon="/logo.png"
                size={200}
              />
                            <Link href={`${window.location.origin}/verify-certificate?livestockId=${selectedLivestock.id}`} className="mt-2 text-sm text-blue-500 underline">Verify Manually</Link>

              <p className="mt-2 text-sm text-gray-500">Scan to verify authenticity</p>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>This certificate confirms that the above livestock has undergone health inspection</p>
              <p>Issued by: National Livestock Traceability System</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ViewLivestockPage;