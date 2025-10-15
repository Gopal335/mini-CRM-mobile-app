import React from 'react';
import {Chip} from 'react-native-paper';
import {LeadStatus} from '../store/slices/leadSlice';

interface StatusChipProps {
  status: LeadStatus;
  size?: 'small' | 'medium';
}

const StatusChip: React.FC<StatusChipProps> = ({status, size = 'medium'}) => {
  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return '#FF6384';
      case 'Contacted':
        return '#36A2EB';
      case 'Converted':
        return '#4BC0C0';
      case 'Lost':
        return '#9966FF';
      default:
        return '#999';
    }
  };

  return (
    <Chip
      style={{
        backgroundColor: getStatusColor(status),
        height: size === 'small' ? 24 : 32,
      }}
      textStyle={{
        color: '#fff',
        fontSize: size === 'small' ? 12 : 14,
      }}>
      {status}
    </Chip>
  );
};

export default StatusChip;
