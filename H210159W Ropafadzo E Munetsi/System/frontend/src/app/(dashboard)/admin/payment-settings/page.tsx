'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from '@/utils/toast';
import DashboardLayout from '@/components/Dashboardlayout';
import { useAuth } from '@/context/AuthContext';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

interface PaymentSetting {
  id: string;
  payment_type: string;
  amount: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PaymentSettingsPage = () => {
  const { user } = useAuth();
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: { amount: number; description: string } }>({});

  // Fetch payment settings
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/payment-settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.data) {
          setPaymentSettings(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
        toast.error('Failed to load payment settings');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentSettings();
  }, [user]);

  // Start editing a payment setting
  const handleEdit = (setting: PaymentSetting) => {
    setEditingId(setting.id);
    setEditValues({
      ...editValues,
      [setting.id]: {
        amount: typeof setting.amount === 'number' ? setting.amount : parseFloat(String(setting.amount)),
        description: setting.description
      }
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Handle input change
  const handleInputChange = (id: string, field: 'amount' | 'description', value: string | number) => {
    try {
      setEditValues({
        ...editValues,
        [id]: {
          ...editValues[id],
          [field]: field === 'amount' ? (parseFloat(value as string) || 0) : value
        }
      });
    } catch (error) {
      console.error('Error parsing amount:', error);
      // If there's an error parsing the amount, set it to 0
      if (field === 'amount') {
        setEditValues({
          ...editValues,
          [id]: {
            ...editValues[id],
            amount: 0
          }
        });
        toast.error('Invalid amount. Please enter a valid number.');
      }
    }
  };

  // Save changes
  const handleSave = async (id: string) => {
    try {
      // Validate amount
      const amount = editValues[id].amount;
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount greater than 0');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5001/api/payment-settings/${id}`,
        {
          amount: amount,
          description: editValues[id].description
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.data) {
        // Update the local state
        setPaymentSettings(paymentSettings.map(setting =>
          setting.id === id ? response.data.data : setting
        ));
        toast.success('Payment setting updated successfully');
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating payment setting:', error);
      toast.error('Failed to update payment setting');
    }
  };

  // Format payment type for display
  const formatPaymentType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#224057] mb-6">Payment Settings</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#224057]"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (USD)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentSettings.map((setting) => (
                  <tr key={setting.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPaymentType(setting.payment_type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === setting.id ? (
                        <input
                          type="number"
                          value={editValues[setting.id]?.amount || setting.amount}
                          onChange={(e) => handleInputChange(setting.id, 'amount', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">${typeof setting.amount === 'number' ? setting.amount.toFixed(2) : parseFloat(String(setting.amount)).toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === setting.id ? (
                        <input
                          type="text"
                          value={editValues[setting.id]?.description || setting.description}
                          onChange={(e) => handleInputChange(setting.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{setting.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(setting.updated_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingId === setting.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(setting.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaSave className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTimes className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(setting)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PaymentSettingsPage;
