"use client"
import React from 'react';
import { Tabs, Descriptions, Avatar, Switch, Input, List } from 'antd';
import { UserOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const AccountDetails = () => (
    <Descriptions title="Account Details" bordered className="mb-4">
        <Descriptions.Item label="Avatar">
            <Avatar size={64} src="https://randomuser.me/api/portraits/men/1.jpg" />
        </Descriptions.Item>
        <Descriptions.Item label="Name">John Doe</Descriptions.Item>
        <Descriptions.Item label="Email">john.doe@example.com</Descriptions.Item>
        <Descriptions.Item label="Phone">555-1234</Descriptions.Item>
        <Descriptions.Item label="Address">123 Main St, Anytown, USA</Descriptions.Item>
        <Descriptions.Item label="Role">Instructor</Descriptions.Item>
        <Descriptions.Item label="Joined">January 1, 2020</Descriptions.Item>
    </Descriptions>
);

const SchoolDetails = () => (
    <Descriptions title="School Details" bordered className="mb-4">
        <Descriptions.Item label="School Name">Pro Drive School</Descriptions.Item>
        <Descriptions.Item label="Location">123 Main St, Anytown</Descriptions.Item>
        <Descriptions.Item label="License Number">ABCD-1234-5678</Descriptions.Item>
        <Descriptions.Item label="Owner">John Doe</Descriptions.Item>
        <Descriptions.Item label="Established">2010</Descriptions.Item>
        <Descriptions.Item label="Total Instructors">10</Descriptions.Item>
    </Descriptions>
);

const Preferences = () => (
    <Descriptions title="Preferences" bordered className="mb-4">
        <Descriptions.Item label="Language">
            <Input defaultValue="English" />
        </Descriptions.Item>
        <Descriptions.Item label="Time Zone">
            <Input defaultValue="GMT-5" />
        </Descriptions.Item>
        <Descriptions.Item label="Notifications">
            <Switch defaultChecked /> Enable Notifications
        </Descriptions.Item>
    </Descriptions>
);

const Notifications = () => {
    const data = [
        'Notification 1: Upcoming lesson at 10:00 AM.',
        'Notification 2: Student John Doe has passed the test.',
        'Notification 3: Car inspection due next week.',
    ];

    return (
        <List
            header={<div>Recent Notifications</div>}
            bordered
            dataSource={data}
            renderItem={item => (
                <List.Item>
                    <BellOutlined style={{ marginRight: 8 }} />
                    {item}
                </List.Item>
            )}
        />
    );
};

const AccountTabs = () => (
    <Tabs tabPosition="left" defaultActiveKey="1" className="mt-4">
        <TabPane tab={<span><UserOutlined /> Details</span>} key="1">
            <AccountDetails />
            <SchoolDetails />
        </TabPane>
        <TabPane tab={<span><SettingOutlined /> Preferences</span>} key="2">
            <Preferences />
        </TabPane>
        <TabPane tab={<span><BellOutlined /> Notifications</span>} key="3">
            <Notifications />
        </TabPane>
    </Tabs>
);

const AccountPage = () => (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
        <h1 className="text-2xl mb-4">Account Settings</h1>
        <AccountTabs />
    </div>
);

export default AccountPage;
