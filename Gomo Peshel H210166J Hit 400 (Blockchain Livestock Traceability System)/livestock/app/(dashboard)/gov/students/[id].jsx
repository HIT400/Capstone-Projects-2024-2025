"use client";
import React from "react";
import { Tabs, Descriptions, Badge, Table, Calendar, Card, Button } from "antd";
import { UserOutlined, CalendarOutlined, ProfileOutlined, FileTextOutlined, DollarOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

// Dummy data for demonstration
const studentData = {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "555-5678",
    address: "456 Main St, Anytown, USA",
    emergencyContact: "John Doe - 555-1234",
    profileImage: "https://randomuser.me/api/portraits/women/1.jpg",
    lessonsCompleted: 20,
    totalLessons: 30,
    testResults: [
        { key: "1", date: "2024-08-10", type: "Theory", score: 85, status: "Passed" },
        { key: "2", date: "2024-08-17", type: "Practical", score: 78, status: "Passed" },
    ],
    paymentHistory: [
        { key: "1", date: "2024-08-01", amount: "$100", status: "Paid" },
        { key: "2", date: "2024-08-15", amount: "$50", status: "Due" },
    ],
};

// Component to display student details
const StudentDetails = () => (
    <Descriptions title="Student Profile" bordered>
        <Descriptions.Item label="Profile Picture">
            <img src={studentData.profileImage} alt="Profile" style={{ width: 64, borderRadius: '50%' }} />
        </Descriptions.Item>
        <Descriptions.Item label="Name">{studentData.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{studentData.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{studentData.phone}</Descriptions.Item>
        <Descriptions.Item label="Address">{studentData.address}</Descriptions.Item>
        <Descriptions.Item label="Emergency Contact">{studentData.emergencyContact}</Descriptions.Item>
    </Descriptions>
);

// Component to display lesson schedule
const LessonSchedule = () => (
    <Calendar fullscreen={false} />
);

// Component to display test results
const TestResults = () => {
    const columns = [
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Type", dataIndex: "type", key: "type" },
        {
            title: "Score",
            dataIndex: "score",
            key: "score",
            render: (score) => (
                <Badge
                    count={score}
                    style={{ backgroundColor: score > 70 ? "#52c41a" : "#faad14" }}
                />
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Badge
                    status={status === "Passed" ? "success" : "error"}
                    text={status}
                />
            ),
        },
    ];
    return <Table columns={columns} dataSource={studentData.testResults} pagination={{ pageSize: 5 }} />;
};

// Component to display payment history
const PaymentHistory = () => {
    const columns = [
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Amount", dataIndex: "amount", key: "amount" },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Badge
                    status={status === "Paid" ? "success" : "warning"}
                    text={status}
                />
            ),
        },
    ];
    return <Table columns={columns} dataSource={studentData.paymentHistory} pagination={{ pageSize: 5 }} />;
};

const StudentPage = () => (
    <div style={{ padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
        <h1 className="text-2xl mb-4">Student Dashboard</h1>
        <Tabs tabPosition="left" className="mt-4">
            <TabPane tab={<span><UserOutlined /> Profile</span>} key="1">
                <StudentDetails />
            </TabPane>
            <TabPane tab={<span><CalendarOutlined /> Lessons</span>} key="2">
                <LessonSchedule />
            </TabPane>
            <TabPane tab={<span><ProfileOutlined /> Test Results</span>} key="3">
                <TestResults />
            </TabPane>
            <TabPane tab={<span><DollarOutlined /> Payments</span>} key="4">
                <PaymentHistory />
            </TabPane>
        </Tabs>
    </div>
);

export default StudentPage;
