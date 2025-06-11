import React, { useState, useEffect } from 'react';
import { fetchDistricts } from '@/utils/districtUtils';

interface District {
  id: number;
  name: string;
  description?: string;
}

interface DistrictSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const DistrictSelect: React.FC<DistrictSelectProps> = ({
  value,
  onChange,
  name,
  required = false,
  className = '',
  placeholder = 'Select District',
  disabled = false
}) => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        setLoading(true);
        const districtsData = await fetchDistricts();
        setDistricts(districtsData);
      } catch (err) {
        console.error('Error loading districts:', err);
        setError('Failed to load districts');
      } finally {
        setLoading(false);
      }
    };

    loadDistricts();
  }, []);

  const defaultClassName = 'border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150';
  const finalClassName = className || defaultClassName;

  if (loading) {
    return (
      <select
        className={finalClassName}
        disabled
      >
        <option>Loading districts...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select
        className={finalClassName}
        disabled
      >
        <option>Error loading districts</option>
      </select>
    );
  }

  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={finalClassName}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {districts.map((district) => (
        <option key={district.id} value={district.name}>
          {district.name}
        </option>
      ))}
    </select>
  );
};

export default DistrictSelect;
