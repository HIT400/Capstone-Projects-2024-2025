"use client";
import React, { useState } from 'react';
import { Form, Input, Checkbox, Button, Typography, notification } from 'antd';
import pb from '@/lib/connection';
import { useRouter } from "next/navigation";
import { GiCow } from 'react-icons/gi';

const { Title, Text } = Typography;

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { username, password } = values;
      // Authenticate using PocketBase
      await pb.collection('users').authWithPassword(username, password);
      
      // Get user role from authenticated user
      const userRole = pb.authStore.model?.role?.toUpperCase();
      
      notification.success({
        message: 'Authentication Successful',
        description: 'Accessing National Livestock System',
      });

      // Redirect based on user role
      switch(userRole) {
        case 'FARMER':
          router.push('/farmer');
          break;
        case 'VET':
          router.push('/veterinarian');
          break;
        case 'GOV':
          router.push('/gov');
          break;
          case 'INSUARANCE':
            router.push('/insuarance');
            break;
        case 'ADMIN':
          router.push('/admin');
          break;
        default:
          notification.warning({
            message: 'Unknown Role',
            description: 'Redirecting to default portal',
          });
          router.push('/dashboard');
      }

    } catch (error) {
      notification.error({
        message: 'Authentication Failed',
        description: error.message || 'Invalid credentials or network error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="flex flex-col justify-center items-center mb-8">
          <GiCow className="text-[70px] text-green-600" />
          <br/>
          <h1  className="text-center text-gray-600 font-semibold">
            National Livestock Traceability
          </h1>
          <h1  className="text-center text-gray-600 font-semibold">
           System Login
          </h1>
        </div>

        <div className="p-8 rounded-lg border-b">
          
          <Form
            className="space-y-4"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              label={<Text className="text-gray-800 font-medium">Username</Text>}
              name="username"
              rules={[{ required: true, message: 'Enter your official ID' }]}
            >
              <Input
                placeholder="Enter government-issued ID"
                className="h-10 rounded"
              />
            </Form.Item>

            <Form.Item
              label={<Text className="text-gray-800 font-medium">Password</Text>}
              name="password"
              rules={[{ required: true, message: 'Enter your security credentials' }]}
            >
              <Input.Password
                placeholder="Enter secure passphrase"
                className="h-10 rounded"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex justify-between items-center mb-4">
                <Checkbox className="text-gray-600">Maintain session</Checkbox>
                <a 
                  href="/auth/reset" 
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Credential Recovery
                </a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-10 rounded bg-green-600 hover:bg-green-700 border-none font-semibold"
                loading={loading}
              >
                Authenticate
              </Button>
            </Form.Item>

            <Text className="text-gray-600 text-center block mt-4">
              Unauthorized access prohibited. {' '}
              <a 
                href="/auth/register" 
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Request system access
              </a>
            </Text>
          </Form>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>National Livestock Traceability System v1.0</p>
          <p className="mt-1">Secure Government Portal</p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;