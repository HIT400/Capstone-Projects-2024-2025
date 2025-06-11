"use client"

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Card, Spin, Typography, Divider, Avatar } from 'antd';
import QRCode from 'antd/es/qrcode';
import pb from '@/lib/connection';

const { Title, Text } = Typography;

const Page = () => {
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const [farmer, setFarmer] = useState(null);

    useEffect(() => {
        const fetchFarmer = async () => {
            try {
                const record = await pb.collection('users').getOne(id.toString());
                setFarmer(record);
            } catch (error) {
                console.error('Error fetching farmer:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFarmer();
    }, [id]);

    if (loading) {
        return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
    }

    if (!farmer) {
        return <Text type="danger">Farmer not found.</Text>;
    }

    return (
        <Card style={{ maxWidth: 400, margin: '50px auto', textAlign: 'center', borderRadius: 15, boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', padding: 20 }}>
            <Avatar src={`http://127.0.0.1:8090/api/files/_pb_users_auth_/cv9nui7ch0r1hik/${farmer.avatar}`} size={100} style={{ marginBottom: 15 }} />
            <Title level={4} style={{ marginBottom: 5 }}>Farmer Identity Card</Title>
            <Divider />
            <Text strong>Name:</Text> <Text>{farmer.name}</Text>
            <br />
            <Text strong>Email:</Text> <Text>{farmer.email}</Text>
            <br />
            <Text strong>Role:</Text> <Text>{farmer.role}</Text>
            <br />
            <Divider />
            <QRCode value={JSON.stringify({ id: farmer.id, name: farmer.name, email: farmer.email })} size={120} icon="/logo.png" />
            <Divider />
            <Text type="secondary">Scan the QR code to verify ownership</Text>
        </Card>
    );
};

export default Page;
