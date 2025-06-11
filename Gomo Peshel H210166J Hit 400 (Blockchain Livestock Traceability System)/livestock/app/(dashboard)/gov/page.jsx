"use client";
import React, { useState } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import {
 PiggyBank, Wheat, Scale, ClipboardList, CalendarDays, MapPin,
 PiggyBankIcon
} from 'lucide-react';
import { Layout, Menu, theme, Tabs, Table, Avatar, Badge, Button, Descriptions } from 'antd';
import {
  DashboardOutlined, UserOutlined, SettingOutlined, LogoutOutlined, EyeOutlined
} from '@ant-design/icons';
import { GiPlantsAndAnimals } from 'react-icons/gi';

const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;

const DashboardCards = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card className="hover:bg-green-50 transition duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Livestock</CardTitle>
        <PiggyBankIcon className="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">1,250</div>
        <p className="text-xs text-gray-500">Animals registered in your farm</p>
      </CardContent>
    </Card>
    
    <Card className="hover:bg-blue-50 transition duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Sales</CardTitle>
        <PiggyBank className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$12,500</div>
        <p className="text-xs text-gray-500">Last 30 days revenue</p>
      </CardContent>
    </Card>

    <Card className="hover:bg-yellow-50 transition duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Feed Inventory</CardTitle>
        <Wheat className="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">85%</div>
        <p className="text-xs text-gray-500">Remaining feed stock</p>
      </CardContent>
    </Card>

    <Card className="hover:bg-purple-50 transition duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
        <Scale className="h-4 w-4 text-purple-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">100%</div>
        <p className="text-xs text-gray-500">All requirements met</p>
      </CardContent>
    </Card>
  </div>
);

const FarmDetails = () => (
  <Descriptions title="Farm Information" bordered className="mb-4">
    <Descriptions.Item label="Farm Name">Green Valley Ranch</Descriptions.Item>
    <Descriptions.Item label="Location">123 Farm Rd, Agri Valley</Descriptions.Item>
    <Descriptions.Item label="Farm Size">500 hectares</Descriptions.Item>
    <Descriptions.Item label="Registration Number">AGRI-12345</Descriptions.Item>
    <Descriptions.Item label="Owner">John Farmer</Descriptions.Item>
    <Descriptions.Item label="Livestock Types">Cattle, Sheep, Poultry</Descriptions.Item>
  </Descriptions>
);

const LivestockTable = () => {
  const columns = [
    {
      title: 'Tag ID',
      dataIndex: 'tag',
      key: 'tag',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Health Status',
      dataIndex: 'health',
      key: 'health',
      render: (status) => (
        <Badge 
          status={status === 'Healthy' ? 'success' : 'error'} 
          text={status}
        />
      ),
    },
    {
      title: 'Vaccination',
      dataIndex: 'vaccination',
      key: 'vaccination',
      render: (date) => (
        <Badge 
          status={new Date(date) > new Date() ? 'success' : 'error'} 
          text={new Date(date).toLocaleDateString()}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button icon={<EyeOutlined />} size="small">Details</Button>
      ),
    },
  ];

  const data = [
    { key: '1', tag: 'LV-1234', type: 'Cattle', age: '2 years', health: 'Healthy', vaccination: '2024-06-15' },
    { key: '2', tag: 'LV-1235', type: 'Sheep', age: '1 year', health: 'Needs Check', vaccination: '2023-12-01' },
    { key: '3', tag: 'LV-1236', type: 'Poultry', age: '6 months', health: 'Healthy', vaccination: '2024-03-20' },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={{ pageSize: 5 }}
      className="mt-4"
    />
  );
};

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer } } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light">
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <GiPlantsAndAnimals className="text-green-600" />
            <span className="font-bold text-lg">Farmer Portal</span>
          </div>
        </div>
        <Menu theme="light" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>Profile</Menu.Item>
          <Menu.Item key="3" icon={<ClipboardList />}>Reports</Menu.Item>
          <Menu.Item key="4" icon={<CalendarDays />}>Schedule</Menu.Item>
          <Menu.Item key="5" icon={<SettingOutlined />}>Settings</Menu.Item>
          <Menu.Item key="6" icon={<LogoutOutlined />}>Logout</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-xl"
              >
                {collapsed ? '☰' : '✕'}
              </button>
              <h1 className="text-xl ml-4">National Livestock Traceability System</h1>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="text-green-600" />
              <span>Green Valley Ranch</span>
            </div>
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

const FarmerDashboard = () => (
    <div className="space-y-6">
      <DashboardCards />
      <FarmDetails />
      
      <Tabs defaultActiveKey="1">
        <TabPane tab="Livestock Management" key="1">
          <LivestockTable />
        </TabPane>
        <TabPane tab="Production Reports" key="2">
          <div className="p-4">Production data coming soon...</div>
        </TabPane>
        <TabPane tab="Compliance Documents" key="3">
          <div className="p-4">Document management coming soon...</div>
        </TabPane>
      </Tabs>
    </div>
);

export default FarmerDashboard;